<template>
  <el-row style="height: 100%" class="container">
    <el-col
      :span="4"
      style="padding-right: 10px; border-right: 1px solid #dcdfe6"
      class="tree"
    >
      <el-input
        v-model="searchContent"
        placeholder="请输入企业名查找"
        @input="handleFilter"
      ></el-input>

      <SensorTree
        @handleCompanyInfo="handleCompanyInfo"
        @getTreeToAmap="getTreeToAmap"
        ref="SensorTree"
        :isFilter="isFilter"
        :searchContent="searchContent"
      />
    </el-col>
    <!-- 地图 -->
    <el-col
      :span="20"
      v-show="marking === 1 || marking === 2"
      style="padding-left: 10px; height: 100%"
    >
      <Amap
        class="amap"
        :marking="marking"
        module="realtime"
        AmapId="realtime"
        :regionName="regionName"
        :companyList="companyLists"
        @handleClickMarker="handleClickMarker"
        :isShowSearch="true"
        placeholder="可搜索具体位置"
      />
    </el-col>
    <el-col
      :span="16"
      v-show="marking === 10"
      style="padding-right: 10px; height: 100%"
      class="equipmentList"
    >
      <h4>设备列表</h4>
      <ul>
        <li
          v-for="(item, index) in deviceLists.deviceList"
          :key="index"
          @click="handleEquipmentList(deviceLists.name, item)"
        >
          <div>{{ item.name }}</div>
        </li>
      </ul>
    </el-col>
    <el-col :span="16" v-if="marking === 3 && !isSensor">
      <el-empty
        description="该企业暂无传感器,请添加传感器"
        :image="require('@/assets/image/zwxx.png')"
      ></el-empty>
    </el-col>
    <el-col
      :span="4"
      v-show="marking === 3 || marking === 10"
      style="
        padding-left: 10px;
        padding-right: 10px;
        border-left: 1px solid #dcdfe6;
      "
    >
      <el-descriptions
        class="margin-top"
        title="企业信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(companyInfo) !== '{}'"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>企业名称</h4>
          </template>
          {{ companyInfo.label }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>法人代表</h4>
          </template>
          {{ companyInfo.legalPerson }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <h4>法人代表联系方式</h4>
          </template>
          {{ companyInfo.legalPhone }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>地址</h4>
          </template>
          {{ companyInfo.address }}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
    <el-col :span="20" v-if="marking === 4">
      <div class="d_flex d_flex_end mb-10">
        <!-- <el-date-picker
          v-model="dateData"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="mr-10"
        >
        </el-date-picker> -->
        <n-config-provider
          :theme-overrides="themeOverrides"
          :locale="zhCN"
          :date-locale="dateZhCN"
        >
          <n-date-picker
            v-model:value="range"
            type="datetimerange"
            clearable
            @update:value="change"
            @blur="focus"
            @mousemove="focus"
            @click="focus"
            :is-date-disabled="disablePreviousDate"
            class="mr-10"
            separator="至"
            :shortcuts="shortcuts"
          />
        </n-config-provider>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <div style="width: 100%" ref="lineChartRef">
        <init-echarts
          :id="`lineChart_1`"
          :options="options"
          :innerWidth="0.65"
          ref="chartsRef"
        ></init-echarts>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import SensorTree from "@/components/sensorTree/index.vue";
import InitEcharts from "@/components/initEcharts/index.vue";
import { findHistory } from "@/api/monitor/historyData";
import { RES_SUCCESS } from "@/api/common/common";
import { findGetAllSensorDevice } from "@/api/monitor/device";
import { sensorDataByCompany } from "@/api/monitor/realtime";
import Amap from "@/components/amap/index.vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { filterTime } from "@/utils/filtration";
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui";
export default defineComponent({
  components: { SensorTree, InitEcharts, Amap, NConfigProvider },
  setup(props) {
    let lineChartRef: any = ref(null);
    let chartsRef: any = ref(null);
    const STORE = useStore();
    let { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      isFilter: false,
      companyList: [],
      companyLists: [], //地图
      searchContent: "",
      marking: 1,
      dateData: [],
      range: null,
      zhCN,
      dateZhCN,
      themeOverrides: {
        common: {
          primaryColor: "#409eff",
          primaryColorHover: "#409eff",
        },
      },
      shortcuts: {
        今天: () => {
          const end = new Date();
          let date = new Date();
          let year = date.getFullYear(); // 年份
          let month = date.getMonth() + 1; // 月份，从0开始
          let day = date.getDate(); // 当前天数
          let start = new Date(`${year}/${month}/${day}`);
          return [start, end];
        },
        最近一周: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        },
      },
      chartsTitle: "",
      // 折线图配置
      options: {
        animation: false,
        title: {
          text: "传感器历史数据",
          left: "center",
        },
        xAxis: {
          type: "time",
          name: "时间",
          boundaryGap: false,
          axisLabel: {
            // formatter: '{HH}:{mm}:{ss}',
            formatter: {
              year: "{yyyy}",
              month: "{MMM}",
              day: "{d}",
              hour: "{HH}:{mm}",
              minute: "{HH}:{mm}",
              second: "{HH}:{mm}:{ss}",
              millisecond: "{HH}:{mm}:{ss}", //{SSS}
              none: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}",
            },
          },
        },
        yAxis: {
          type: "value",
          // min: 0,
          // max: 100,
          name: "历史数据",
          minorTick: {
            show: true,
          },
          minorSplitLine: {
            show: true,
          },
          axisLine: {
            //y轴
            show: true,
          },
          axisTick: {
            //y轴刻度线
            show: true,
          },
          show: true,
          scale: true,
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(1);
            },
          },
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {},
            dataZoom: {
              yAxisIndex: "none",
            },
          },
        },
        color: ["#bf444c"],
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["历史数据"],
          top: "4.5%",
          icon: "roundRect",
          itemHeight: 3, // 粗细
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "9%",
          containLabel: true,
          height: "83%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          formatter: function (params: any) {
            let list = [];
            let listItem = "";
            let colors = ["#bf444c"];
            let seriesNames = ["历史数据"];
            let value: number;
            for (var i = 0; i < params[0].value.length; i++) {
              if (i !== 0) {
                params[0].value[i] % 1 === 0
                  ? (value = params[0].value[i])
                  : (value = params[0].value[i].toFixed(1));
                list.push(
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                    colors[i - 1] +
                    ';margin-right: 5px;border-radius: 50%;}"></i><span style="width:70px; display:inline-block;text-align:right">' +
                    seriesNames[i - 1] +
                    "：</span>&nbsp&nbsp" +
                    value
                );
              }
            }
            listItem = list.join("<br>");
            return (
              '<div class="showBox" style="text-align:left">' +
              listItem +
              "<br/>" +
              '<i style="display: inline-block;width: 10px;height: 10px;background: lightblue' +
              ';margin-right: 5px;border-radius: 50%;}"></i>' +
              '<span style="width:70px; display:inline-block;text-align:right">' +
              "时间" +
              "：</span>&nbsp&nbsp" +
              params[0].value[0] +
              "</div>"
            );
          },
        },
        dataZoom: [
          //X轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            xAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100, //初始化时，滑动条宽度结束标度
          },
          //y轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            yAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100, //初始化时，滑动条宽度结束标度
          },
        ],
        series: [
          {
            name: "历史数据",
            data: [],
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#bf444c",
              borderColor: "#bf444c", //拐点边框颜色
            },
            lineStyle: {
              color: "#bf444c", //改变折线颜色
            },
          },
        ],
      },
      companyInfo: {},
      // 地区名
      regionName: "",
      sensorDeviceInfo: {},
      lineChartData: [],
      isSensor: false,
      deviceLists: [],
    });
    let METHODS = reactive({
      disablePreviousDate(ts: number) {
        return ts > Date.now();
      },
      focus() {
        nextTick(() => {
          let end: any = document.querySelector(".n-date-panel-calendar--end");
          if (end) {
            end.style.display = "none";
          }
          let calendar: any = document.querySelector(".n-date-panel-calendar");
          if (calendar) {
            calendar.style.width = "420px";
          }
        });
      },
      change(value: any) {
        if (!value) {
          return;
        }
        DATA.range = value;
        if (String(value[0]) == String(value[1])) {
          DATA.range[1] = new Date().getTime();
        }
      },
      handleEquipmentList(companyName: any, item: any) {
        DATA.marking = 4;
        DATA.sensorDeviceInfo = Object.assign({}, item);
        DATA.chartsTitle = `${companyName}${item.name}历史数据`;
        DATA.lineChartData = [];
        DATA.dateData = [];
        DATA.options.series[0].data = [];
        DATA.options.title.text = DATA.chartsTitle;
      },
      // 获取树的数据给到地图
      getTreeToAmap(data: any) {
        DATA.companyLists = [];
        data.data.forEach((item: any) => {
          item.companyList.forEach((val: any) => {
            DATA.companyLists.push(val);
          });
        });
      },
      handleCompanyInfo: (data: any) => {
        switch (data.marking) {
          case 1:
            DATA.marking = 1;
            DATA.regionName = data.label;
            break;
          case 2:
            DATA.marking = 2;
            DATA.regionName = data.label;
            break;
          case 3:
            DATA.marking = 3;
            DATA.companyInfo = Object.assign({}, data);
            DATA.isSensor =
              data.deviceList !== null && data.deviceList.length > 0
                ? true
                : false;

            if (data.deviceList !== null && data.deviceList.length) {
              DATA.marking = 10;
              DATA.marking = 10;
              DATA.deviceLists = data;
            }

            break;
          case 4:
            DATA.marking = 4;
            DATA.sensorDeviceInfo = Object.assign({}, data);
            DATA.chartsTitle = `${data.name}${data.label}历史数据`;
            DATA.lineChartData = [];
            DATA.dateData = [];
            DATA.range = null;
            DATA.options.series[0].data = [];
            DATA.options.title.text = DATA.chartsTitle;
            break;
          default:
            break;
        }
      },
      // 过滤树结构
      handleFilter: () => {
        // proxy.$refs["SensorTree"].filterText(DATA.searchContent);
        DATA.isFilter = !DATA.isFilter;
      },

      handleSearch: async () => {
        if (DATA.range == null || DATA.range.length === 0) {
          ElMessage({
            message: "请选择时间段",
            type: "warning",
          });
          return;
        }
        let startTime = filterTime(DATA.range[0], "/");
        let endTime = filterTime(DATA.range[1], "/");

        chartsRef.value.chartloading();
        DATA.lineChartData = [];
        let { data } = await findHistory({
          startTime,
          endTime,
          sensorDeviceId: DATA.sensorDeviceInfo.id,
        });
        if (data.code === RES_SUCCESS) {
          chartsRef.value.charthideloading();
          if (data.data != null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              DATA.lineChartData.push([
                filterTime(item.createTime),
                item.value,
              ]);
            });
          }
          DATA.options.series[0].data = DATA.lineChartData;
        } else {
          chartsRef.value.charthideloading();
        }
      },

      // 获取英德市所有企业列表
      handleFindGetAllSensorDevice: async () => {
        let { data } = await findGetAllSensorDevice();
        if (data.code === RES_SUCCESS) {
          DATA.companyList = data.data;
        }
      },
      // 获取用户企业
      handleUserCompany: () => {
        DATA.companyList = [STORE.state.globalData.userCompanyInfo];
      },
      // 过滤网关数据
      handleFilterGatewayData: (data: Array<any>) => {
        let list: Array<any> = [];
        let snList: Array<string> = [];
        data.forEach((item, index) => {
          if (snList.indexOf(item.sn) === -1) {
            snList.push(item.sn);
            list.push({
              sn: item.sn,
              uuid: [item.uuid],
            });
          } else {
            list[snList.indexOf(item.sn)].uuid.push(item.uuid);
          }
        });
        return list;
      },

      // 获取企业传感器
      handleFindByCompany: async (companyInfoId: number) => {
        DATA.oldSensorList = DATA.sensorList;
        let { data } = await sensorDataByCompany({ companyInfoId });
        if (data.code === RES_SUCCESS) {
          // DATA.sensorList = data.data;
        }
      },

      handleClickMarker: async (item: any) => {
        if (item.deviceList && item.deviceList.length > 0) {
          DATA.marking = 10;
          DATA.deviceLists = item;
        } else {
          DATA.marking = 3;
          DATA.isSensor = false;
        }
      },
    });
    // websocket
    let SOCKET: any = reactive({
      async initWebSocket() {
        let socketapi =
          "wss://" + location.host + "/websocket/" + STORE.state.user.userId;
        // let socketapi = `ws://192.168.0.211:8301/websocket/${STORE.state.user.userId}`;
        DATA.websocket = new WebSocket(socketapi);
        DATA.websocket.onerror = SOCKET.setErrorMessage;
        // 连接成功
        DATA.websocket.onopen = SOCKET.setOnopenMessage;
        // 收到消息的回调
        DATA.websocket.onmessage = SOCKET.setOnmessageMessage;
        // 连接关闭的回调
        DATA.websocket.onclose = SOCKET.setOncloseMessage;
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        // window.onbeforeunload = this.onbeforeunload
      },
      setOnopenMessage: () => {
        let list: any = [];
        if (DATA.sensorList.length > 0 && DATA.marking === 3) {
          list = METHODS.handleFilterGatewayData(DATA.sensorList);
          list.forEach((item: any) => {
            SOCKET.setOnSendMessage(
              `0101${JSON.stringify({
                uuidList: item.uuid,
                sn: item.sn,
                userId: STORE.state.user.userId,
              })}`
            );
          });
          DATA.existSensor = list;
        } else if (
          (DATA.sensorList.length > 0 || DATA.oldSensorList.length > 0) &&
          DATA.marking === 4
        ) {
          if (DATA.oldSensorList.length > 0) {
            let list: any = [];
            DATA.oldSensorList.forEach((item: any) => {
              if (item.id === DATA.senserInfo.id) {
                list.push({ uuid: [item.uuid], sn: item.sn });
              }
            });
            setTimeout(() => {
              list.length > 0 &&
                SOCKET.setOnSendMessage(
                  `0101${JSON.stringify({
                    uuidList: list[0].uuid,
                    sn: list[0].sn,
                    userId: STORE.state.user.userId,
                  })}`
                );
            }, 100);
            DATA.existSensor = list;
          } else {
            let list: any = [];
            DATA.sensorList.forEach((item: any) => {
              if (item.id == DATA.senserInfo.id) {
                list.push({ uuid: [item.uuid], sn: item.sn });
              }
            });
            setTimeout(() => {
              list.length > 0 &&
                SOCKET.setOnSendMessage(
                  `0101${JSON.stringify({
                    uuidList: list[0].uuid,
                    sn: list[0].sn,
                    userId: STORE.state.user.userId,
                  })}`
                );
            }, 100);
            DATA.existSensor = list;
          }
        }
      },
      setOnmessageMessage: (result: any) => {
        if (result) {
          DATA.panelLoading = false;
          DATA.lineLoading = false;
          if (result.data.indexOf("error") !== -1) {
            ElMessage({
              message: result.data.slice(5, result.data.length),
              type: "error",
            });
            DATA.timer && clearInterval(DATA.timer);
            return;
          }

          let resultData = JSON.parse(result.data);
          // 仪表盘
          if (DATA.panelOptions.length > 0) {
            DATA.panelOptions.forEach((item: any) => {
              if (item.uuid === resultData.uuid) {
                // 检测 是否报警
                if (item.warningSetting !== null) {
                  let lowerData: Array<any> = [];
                  let upperData: Array<any> = [];
                  let lower: number | null = null;
                  let upper: number | null = null;
                  lowerData.push(item.warningSetting.lowerThreshold1);
                  lowerData.push(item.warningSetting.lowerThreshold2);
                  lowerData.push(item.warningSetting.lowerThreshold3);
                  upperData.push(item.warningSetting.upperThreshold1);
                  upperData.push(item.warningSetting.upperThreshold2);
                  upperData.push(item.warningSetting.upperThreshold3);
                  // 获取最近下限值
                  if (lowerData[0] === null) {
                    if (lowerData[1] === null) {
                      if (lowerData[2] === null) {
                        lower = null;
                      } else {
                        lower = lowerData[2];
                      }
                    } else {
                      lower = lowerData[1];
                    }
                  } else {
                    lower = lowerData[0];
                  }
                  // 获取最近上限值
                  if (upperData[0] === null) {
                    if (upperData[1] === null) {
                      if (upperData[2] === null) {
                        upper = null;
                      } else {
                        upper = upperData[2];
                      }
                    } else {
                      upper = upperData[1];
                    }
                  } else {
                    upper = upperData[0];
                  }
                  if (lower !== null && upper !== null) {
                    if (
                      resultData.value <= lower ||
                      resultData.value >= upper
                    ) {
                      item.isWarning = true;
                    } else {
                      item.isWarning = false;
                    }
                  }
                  if (lower === null && upper !== null) {
                    if (resultData.value >= upper) {
                      item.isWarning = true;
                    } else {
                      item.isWarning = false;
                    }
                  }
                  if (lower !== null && upper === null) {
                    if (resultData.value <= lower) {
                      item.isWarning = true;
                    } else {
                      item.isWarning = false;
                    }
                  }
                }
                // 刷新数据
                item.option.series[0].data[0].value = (
                  resultData.value as number
                ).toFixed(3);
              }
            });
          }
          // 单个仪表盘
          if (DATA.panelOption.length > 0) {
            if (DATA.panelOption[0].uuid === resultData.uuid) {
              DATA.panelOption[0].option.series[0].data[0].value = (
                resultData.value as number
              ).toFixed(3);
            }
          }

          // 折线图
          if (
            DATA.lineOption.length > 0 &&
            DATA.lineOption[0].uuid === resultData.uuid
          ) {
            DATA.lineChartsData.push([
              filterTime(resultData.createTime, "/"),
              resultData.value,
            ]);
            if (DATA.lineChartsData.length > 1000) {
              DATA.lineChartsData = DATA.lineChartsData.slice(
                1,
                DATA.lineChartsData.length
              );
            }
            DATA.lineOption[0].option.series[0].data = DATA.lineChartsData;
          }
        }
      },
      setErrorMessage: (err: any) => {
        DATA.panelLoading = false;
        DATA.lineLoading = false;
        ElMessage({
          message: "通讯服务连接失败,请检查!",
          type: "error",
        });
      },
      setOncloseMessage: () => {},
      setOnSendMessage: (mesage: string) => {
        if (DATA.websocket.readyState === 1) {
          DATA.websocket.send(mesage);
        }
      },
    });
    STORE.state.user.personnel.unitType === 1
      ? METHODS.handleFindGetAllSensorDevice()
      : METHODS.handleUserCompany();

    onMounted(() => {});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ...toRefs(SOCKET),
      lineChartRef,
      chartsRef,
    };
  },
});
</script>
<style scoped lang="scss">
/deep/#lineChart_1 {
  box-sizing: border-box !important;
}
/deep/.n-button:not(.n-button--disabled):hover {
  background-color: red !important;
  color: var(--n-text-color-hover);
}
/deep/.n-date-panel {
  width: 500px !important;
}

.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}

.amap {
  width: 100%;
  height: calc(100vh - 170px);
}

.equipmentList {
  padding-left: 10px;
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 10px;
    margin-top: 10px;
    li {
      width: 25%;
      height: 60px;
      line-height: 60px;
      text-align: center;
      background-color: #fff;
      padding: 0 10px;
      margin: 20px;
      div {
        border: 1px solid rgba(204, 204, 204, 0.5);
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          box-shadow: 0 0 10px 1px rgba(215, 215, 215, 0.8);
        }
      }
    }
  }
}
</style>