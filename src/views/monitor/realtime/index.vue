<template>
  <el-row class="container">
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
      style="padding-left: 10px"
    >
      <Amap
        class="amap"
        :marking="marking"
        :companyList="companyLists"
        module="realtime"
        :regionName="regionName"
        :isShowSearch="true"
        @handleClickMarker="handleClickMarker"
        AmapId="realtime"
        placeholder="可搜索具体位置"
      />
    </el-col>
    <!-- 折线图 -->
    <el-col
      :span="20"
      v-if="marking === 4"
      class="d_flex"
      v-loading="lineLoading"
      element-loading-text="数据加载中..."
    >
      <el-row style="width:100%">
        <el-col
          :span="19"
          :lg="19"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <div
            style="width: 100%;"
            ref="lineChartRef"
          >
            <init-echarts
              :id="`lineChart_1`"
              :options="lineOption[0].option"
              :innerWidth="0.55"
            ></init-echarts>
          </div>
        </el-col>
        <el-col
          :span="5"
          :lg="5"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <div
            style="width: 100%; margin: 0 auto"
            ref="seed_panelRef"
          >
            <InitEcharts
              :id="'panel_echarts'"
              class="charts_item"
              :options="panelOption[0].option"
              :innerWidth="0.15"
            />
          </div>
        </el-col>
      </el-row>

      <!-- <div
        style="width: 80%; margin-right: 20px"
        ref="lineChartRef"
      >
        <init-echarts
          :id="`lineChart_1`"
          :options="lineOption[0].option"
          :innerWidth="0.55"
        ></init-echarts>
      </div>
      <div
        style="width: 20%; margin: 0 auto"
        ref="seed_panelRef"
      >
        <InitEcharts
          :id="'panel_echarts'"
          class="charts_item"
          :options="panelOption[0].option"
          :innerWidth="0.15"
        />
      </div> -->
    </el-col>
    <!-- 传感器 -->
    <el-col
      :span="16"
      v-loading="panelLoading"
      element-loading-text="数据加载中..."
    >
      <div
        v-if="marking === 3 && !panelLoading"
        ref="panelChartsRef"
        style="width: 100%;display: flex "
        class="panelSensor"
      >
        <template v-if="sensorList.length > 0">
          <el-row style="width:100%">
            <el-col
              :span="8"
              :xl="8"
              :lg="12"
              :xs="24"
              :sm="24"
              class="charts mb-10"
              v-for="(item, index) of sensorList"
              :key="item"
              style="width: 100%; padding: 0 10px 0 10px;"
            >
              <InitEcharts
                :id="'panel_echarts' + item.id"
                class="charts_item"
                :class="panelOptions[index].isWarning && 'warning'"
                :options="panelOptions[index].option"
                @click="handleCharts(item, panelOptions[index].option)"
                style="padding-top: 10px"
                type="panelSensor"
                :innerWidth="0.3"
                :innerHeight="0.65"
              />
            </el-col>
          </el-row>
          <!-- <div
            class="charts mb-10"
            v-for="(item, index) of sensorList"
            :key="item"
            style="width: 100%; padding: 0 10px 0 10px"
          >
            <InitEcharts
              :id="'panel_echarts' + item.id"
              class="charts_item"
              :class="panelOptions[index].isWarning && 'warning'"
              :options="panelOptions[index].option"
              @click="handleCharts(item, panelOptions[index].option)"
              style="padding-top: 10px"
              :innerWidth="0.168"
              :innerHeight="0.4"
            />
          </div> -->
        </template>
        <template v-else>
          <div class="d_flex d_flex_c w-100">
            <el-empty
              description="该企业下无传感器设备,请添加传感器设备"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>
        </template>
      </div>
    </el-col>

    <el-col
      :span="4"
      v-show="marking === 3 && !panelLoading"
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
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  watch
} from "vue";
import SensorTree from "@/components/sensorTree/index.vue";
import Amap from "@/components/amap/index.vue";
import InitEcharts from "@/components/initEcharts/index.vue";
import { sensorDataByCompany } from "@/api/monitor/realtime";
import { RES_SUCCESS } from "@/api/common/common";
import { findGetAllSensorDevice } from "@/api/monitor/device";
import { useStore } from "vuex";
import { filterTime } from "@/utils/filtration";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { SensorTree, Amap, InitEcharts },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTE = useRoute();
    let panelChartsRef: any = ref(null);
    let lineChartRef: any = ref(null);
    let seed_panelRef: any = ref(null);
    let DATA: any = reactive({
      isFilter: false,
      searchContent: "",
      sensorList: [],
      marking: 1,
      companyInfo: {},
      companyList: [],
      companyLists: [],
      // 地区名
      regionName: "",
      panelOptions: [],
      panelOption: [],
      // 折线图配置
      option: {
        animation: false,
        title: {
          text: "传感器实时数据",
          left: "center"
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
              none: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}"
            }
          }
        },
        yAxis: {
          type: "value",
          // min: 0,
          // max: 100,
          name: "实时数据",
          minorTick: {
            show: true
          },
          minorSplitLine: {
            show: true
          },
          axisLine: {
            //y轴
            show: true
          },
          axisTick: {
            //y轴刻度线
            show: true
          },
          show: true,
          scale: true,
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(3);
            }
          }
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {},
            dataZoom: {
              yAxisIndex: "none"
            }
          }
        },
        color: ["#bf444c"],
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["实时数据"],
          top: "4.5%",
          icon: "roundRect",
          itemHeight: 3 // 粗细
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "9%",
          containLabel: true,
          height: "83%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          formatter: function (params: any) {
            let list = [];
            let listItem = "";
            let colors = ["#33cc66"];
            let seriesNames = ["实时数据"];
            var value: any;
            if (params.length > 1) {
              for (var i = 0; i < params.length; i++) {
                params[i].value[1] % 1 === 0
                  ? (value = params[i].value[1])
                  : (value = params[i].value[1].toFixed(3));
                list.push(
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                    params[i].color +
                    ';margin-right: 5px;border-radius: 50%;}"></i><span style="width:70px; display:inline-block;text-align:right">' +
                    params[i].seriesName +
                    "：</span>&nbsp&nbsp" +
                    value
                );
              }
            } else if (params.length === 1) {
              for (var i = 0; i < params[0].value.length; i++) {
                if (i !== 0) {
                  params[0].value[i] % 1 === 0
                    ? (value = params[0].value[i])
                    : (value = params[0].value[i].toFixed(3));
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
          }
        },
        dataZoom: [
          //X轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            xAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          },
          //y轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            yAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          }
        ],
        series: [
          {
            name: "实时数据",
            data: [],
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#33cc66",
              borderColor: "#33cc66" //拐点边框颜色
            },
            lineStyle: {
              color: "#33cc66" //改变折线颜色
            }
          }
        ]
      },
      websocket: null,
      panelLoading: false,
      lineLoading: false,
      // 存储之前传感器列表
      oldSensorList: [],
      senserInfo: {},
      // echarts
      lineOption: [],
      lineChartsData: [],
      // 页面存在的传感器
      existSensor: [],
      // 全局定时器
      timer: null,
      styles: {
        width: "100%",
        marginTop: "10px"
      }
    });
    let METHODS: any = reactive({
      // 获取企业传感器
      handleFindByCompany: async (companyInfoId: number) => {
        DATA.oldSensorList = DATA.sensorList;
        let { data } = await sensorDataByCompany({ companyInfoId });
        if (data.code === RES_SUCCESS) {
          DATA.sensorList = data.data;
          METHODS.handlePanelsData();
        }
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
      handleCompanyInfo: async (data: any, node: any) => {
        switch (data.marking) {
          case 1:
            if (DATA.websocket) {
              DATA.existSensor = [];
            }
            DATA.marking = 1;
            DATA.regionName = data.label;
            DATA.timer && clearInterval(DATA.timer);
            break;
          case 2:
            if (DATA.websocket) {
              DATA.existSensor = [];
            }
            DATA.marking = 2;
            DATA.regionName = data.label;
            DATA.timer && clearInterval(DATA.timer);
            break;
          case 3:
            DATA.marking = 3;
            DATA.panelLoading = true;
            if (data.deviceList?.length > 0) {
              // if (node.expanded) {
              await METHODS.handleFindByCompany(data.id);
              // }
            } else {
              DATA.sensorList = [];
            }
            if (!DATA.websocket) {
              if (data.deviceList?.length > 0) {
                await SOCKET.initWebSocket();
              }
              DATA.panelLoading = false;
            } else {
              let list: Array<any> = [];
              if (DATA.sensorList.length > 0) {
                list = METHODS.handleFilterGatewayData(DATA.sensorList);
              }
              setTimeout(() => {
                if (list.length > 0) {
                  list.forEach((item) => {
                    SOCKET.setOnSendMessage(
                      `0101${JSON.stringify({
                        uuidList: item.uuid,
                        sn: item.sn,
                        userId: STORE.state.user.userId
                      })}`
                    );
                  });
                }
              }, 100);
              DATA.existSensor = list;
            }
            if (data.deviceList?.length > 0) {
              (DATA.websocket.readyState === 3 ||
                DATA.sensorList.length === 0) &&
                (DATA.panelLoading = false);
            }
            if (
              data.deviceList?.length > 0 &&
              DATA.websocket.readyState === 3 &&
              node.expanded
            ) {
              ElMessage({
                message: "通讯服务连接失败,请检查!",
                type: "error"
              });
            }
            DATA.companyInfo = Object.assign({}, data);
            DATA.panelLoading = false;
            break;
          case 4:
            DATA.panelLoading = false;
            // DATA.websocket.readyState !== 3 &&
            DATA.lineLoading = true;
            await METHODS.handleFindByCompany(data.companyInfoId);
            DATA.senserInfo = Object.assign({}, data);
            if (!DATA.websocket) {
              await SOCKET.initWebSocket();
            } else {
              if (DATA.oldSensorList.length > 0) {
                let list: any = [];
                DATA.oldSensorList.forEach((item: any) => {
                  if (item.id === data.id) {
                    list.push({ uuid: [item.uuid], sn: item.sn });
                  }
                });
                setTimeout(() => {
                  list.length > 0 &&
                    SOCKET.setOnSendMessage(
                      `0101${JSON.stringify({
                        uuidList: list[0].uuid,
                        sn: list[0].sn,
                        userId: STORE.state.user.userId
                      })}`
                    );
                }, 100);
                DATA.existSensor = list;
              } else {
                let list: any = [];
                DATA.sensorList.forEach((item: any) => {
                  if (item.id === data.id) {
                    list.push({ uuid: [item.uuid], sn: item.sn });
                  }
                });
                setTimeout(() => {
                  list.length > 0 &&
                    SOCKET.setOnSendMessage(
                      `0101${JSON.stringify({
                        uuidList: list[0].uuid,
                        sn: list[0].sn,
                        userId: STORE.state.user.userId
                      })}`
                    );
                }, 100);
                DATA.existSensor = list;
              }
            }
            let lower3: any = null,
              lower2: any = null,
              lower1: any = null,
              upper3: any = null,
              upper2: any = null,
              upper1: any = null;
            if (DATA.sensorList.length > 0) {
              DATA.sensorList.forEach((item: any) => {
                if (item.id === data.id) {
                  let baifenbiOptions: Array<any> = [];
                  let markingList: Array<any> = [];
                  if (item.warningSetting !== null) {
                    item.warningSetting.lowerThreshold3 !== null
                      ? markingList.push(item.warningSetting.lowerThreshold3)
                      : markingList.push(null);
                    item.warningSetting.lowerThreshold2 !== null
                      ? markingList.push(item.warningSetting.lowerThreshold2)
                      : markingList.push(null);
                    item.warningSetting.lowerThreshold1 !== null
                      ? markingList.push(item.warningSetting.lowerThreshold1)
                      : markingList.push(null);
                    item.warningSetting.upperThreshold1 !== null
                      ? markingList.push(item.warningSetting.upperThreshold1)
                      : markingList.push(null);
                    item.warningSetting.upperThreshold2 !== null
                      ? markingList.push(item.warningSetting.upperThreshold2)
                      : markingList.push(null);
                    item.warningSetting.upperThreshold3 !== null
                      ? markingList.push(item.warningSetting.upperThreshold3)
                      : markingList.push(null);
                    markingList.forEach((key, index) => {
                      switch (index) {
                        case 0:
                          if (key !== null) {
                            lower3 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              item.min,
                              key
                            );
                            baifenbiOptions.push([
                              lower3.maxbaifenbi,
                              "#B53332"
                            ]);
                          }
                          break;
                        case 1:
                          if (key !== null) {
                            lower2 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              item.min,
                              key
                            );
                            baifenbiOptions.push([
                              lower2.maxbaifenbi,
                              "#c69a66"
                            ]);
                          }
                          break;
                        case 2:
                          if (key !== null) {
                            lower1 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              item.min,
                              key
                            );
                            baifenbiOptions.push([
                              lower1.maxbaifenbi,
                              "#ffd71b"
                            ]);
                          }
                          break;
                        case 3:
                          if (key !== null) {
                            upper1 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              key,
                              item.max
                            );
                            baifenbiOptions.push([
                              upper1.minbaifenbi,
                              "#6A869F"
                            ]);
                          }
                          break;
                        case 4:
                          if (key !== null) {
                            upper2 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              key,
                              item.max
                            );
                            if (upper1 === null) {
                              baifenbiOptions.push([
                                upper2.minbaifenbi,
                                "#6A869F"
                              ]);
                            } else {
                              baifenbiOptions.push([
                                upper2.minbaifenbi,
                                "#ffd71b"
                              ]);
                            }
                          }
                          break;
                        case 5:
                          if (key !== null) {
                            upper3 = METHODS.PanelPercenScale(
                              item.min,
                              item.max,
                              key,
                              item.max
                            );
                            if (upper1 === null && upper2 === null) {
                              baifenbiOptions.push([
                                upper3.minbaifenbi,
                                "#6A869F"
                              ]);
                            } else if (upper1 !== null && upper2 === null) {
                              baifenbiOptions.push([
                                upper3.minbaifenbi,
                                "#ffd71b"
                              ]);
                            } else if (upper1 === null && upper2 !== null) {
                              baifenbiOptions.push([
                                upper3.minbaifenbi,
                                "#c69a66"
                              ]);
                            } else if (upper1 !== null && upper2 !== null) {
                              baifenbiOptions.push([
                                upper3.minbaifenbi,
                                "#c69a66"
                              ]);
                            }
                          }
                          break;
                        default:
                          break;
                      }
                    });
                    if (upper1 === null && upper2 === null && upper3 === null) {
                      baifenbiOptions.push([1, "#6A869F"]);
                    }
                    if (upper2 === null && upper3 === null) {
                      baifenbiOptions.push([1, "#ffd71b"]);
                    } else if (upper2 !== null && upper3 === null) {
                      baifenbiOptions.push([1, "#c69a66"]);
                    } else {
                      baifenbiOptions.push([1, "#B53332"]);
                    }
                  } else {
                    baifenbiOptions = [[1, "#6A869F"]];
                  }

                  let option = {
                    title: {
                      text: item.name,
                      left: "center"
                    },
                    tooltip: { formatter: "{a} <br/>{b} : {c}" },
                    series: [
                      {
                        name: "实时数据",
                        min: item.min,
                        max: item.max,
                        startAngle: 180, //开始角度 左侧角度
                        endAngle: 0, //结束角度 右侧
                        type: "gauge",
                        // center: [(j*20)+15+'%', '50%'], //**调整仪表盘的位置**
                        detail: {
                          formatter: (value: any) => {
                            return `${value} ${item.unit}`;
                          },
                          color: "#ee83af",
                          fontSize: 18,
                          fontWeight: "bolder"
                        },
                        axisLine: {
                          lineStyle: {
                            color: baifenbiOptions
                          }
                        },
                        itemStyle: { color: "#b6bcfb" },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: {
                          show: true,
                          fontSize: 10,
                          formatter: "{value}"
                        },
                        pointer: { width: 6 },
                        data: [{ value: 0 }],
                        title: {
                          show: true,
                          offsetCenter: [0, "70%"],
                          fontWeight: "bolder",
                          fontSize: 26,
                          color: "#b6bcfb",
                          text: "aaaaa"
                        }
                      }
                    ]
                  };
                  DATA.panelOption = [{ uuid: item.uuid, option }];
                  DATA.lineChartsData = [];
                  DATA.option.series[0].data = [];
                  DATA.option.yAxis.min = item.min;
                  DATA.option.yAxis.max = item.max;
                  DATA.lineOption = [
                    { uuid: item.uuid, option: Object.assign({}, DATA.option) }
                  ];
                }
              });
            }
            DATA.marking = 4;
            DATA.websocket.readyState === 3 && (DATA.lineLoading = false);
            break;
          default:
            break;
        }
      },
      handleCharts: (item: any, options: any) => {
        DATA.lineLoading = true;
        DATA.marking = 4;
        if (DATA.sensorList.length > 0) {
          setTimeout(() => {
            SOCKET.setOnSendMessage(
              `0101${JSON.stringify({
                uuidList: [item.uuid],
                sn: item.sn,
                userId: STORE.state.user.userId
              })}`
            );
          }, 100);
          DATA.existSensor = [{ uuid: item.uuid, sn: item.sn }];
        }
        DATA.lineChartsData = [];
        DATA.option.series[0].data = [];
        DATA.option.yAxis.min = item.min;
        DATA.option.yAxis.max = item.max;
        // options.series[0].data = [{ value: 0, name: item.unit }];
        options.series[0].data = [{ value: 0 }];
        DATA.panelOption = [{ uuid: item.uuid, option: options }];
        DATA.lineOption = [
          { uuid: item.uuid, option: Object.assign({}, DATA.option) }
        ];

        DATA.websocket.readyState === 3 && (DATA.lineLoading = false);
      },
      // 仪表盘百分比刻度
      PanelPercenScale: (
        min: any,
        max: any,
        minThreshold: any,
        maxThreshold: any
      ) => {
        let minbaifenbi, maxbaifenbi;
        if (
          parseInt(min) < 0 &&
          parseInt(max) >= 0 &&
          parseInt(minThreshold) >= 0
        ) {
          minbaifenbi = (minThreshold + Math.abs(min)) / (max + Math.abs(min));
          maxbaifenbi = (maxThreshold + Math.abs(min)) / (max + Math.abs(min));
        }
        if (
          parseInt(min) < 0 &&
          parseInt(max) >= 0 &&
          parseInt(minThreshold) < 0
        ) {
          minbaifenbi =
            (Math.abs(min) - Math.abs(minThreshold)) / (max + Math.abs(min));
          if (parseInt(maxThreshold) <= 0) {
            maxbaifenbi =
              (Math.abs(min) - Math.abs(maxThreshold)) / (max + Math.abs(min));
          } else {
            maxbaifenbi =
              (maxThreshold + Math.abs(min)) / (max + Math.abs(min));
          }
        }
        if (parseInt(min) < 0 && parseInt(max) < 0) {
          minbaifenbi =
            (Math.abs(min) - Math.abs(minThreshold)) /
            (Math.abs(min) - Math.abs(max));
          maxbaifenbi =
            (Math.abs(min) - Math.abs(maxThreshold)) /
            (Math.abs(min) - Math.abs(max));
        }
        if (parseInt(min) >= 0 && parseInt(max) >= 0) {
          minbaifenbi = (minThreshold - min) / (max - min);
          maxbaifenbi = (maxThreshold - min) / (max - min);
        }
        return { minbaifenbi, maxbaifenbi };
      },
      // 过滤树结构
      handleFilter: () => {
        // proxy.$refs['SensorTree'].filterText(DATA.searchContent);

        DATA.isFilter = !DATA.isFilter;
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
      handleClickMarker: async (item: any) => {
        let { name, legalPerson, legalPhone, address } = item;
        DATA.companyInfo = Object.assign(
          {},
          { label: name, legalPerson, legalPhone, address }
        );
        DATA.marking = 3;
        DATA.panelLoading = true;
        await METHODS.handleFindByCompany(item.id);
        if (!DATA.websocket) {
          await SOCKET.initWebSocket();
        } else {
          let list: Array<any> = [];
          if (DATA.sensorList.length > 0) {
            list = METHODS.handleFilterGatewayData(DATA.sensorList);
          }
          setTimeout(() => {
            if (list.length > 0) {
              list.forEach((item) => {
                SOCKET.setOnSendMessage(
                  `0101${JSON.stringify({
                    uuidList: item.uuid,
                    sn: item.sn,
                    userId: STORE.state.user.userId
                  })}`
                );
              });
            }
          }, 100);
          DATA.existSensor = list;
        }
        (DATA.websocket.readyState === 3 || DATA.sensorList.length === 0) &&
          (DATA.panelLoading = false);
      },
      // 仪表盘数据
      handlePanelsData: () => {
        DATA.panelOptions = [];
        let lower3: any = null,
          lower2: any = null,
          lower1: any = null,
          upper3: any = null,
          upper2: any = null,
          upper1: any = null;
        if (DATA.sensorList.length > 0) {
          DATA.sensorList.forEach((item: any) => {
            let baifenbiOptions: Array<any> = [];
            let markingList: Array<any> = [];
            if (item.warningSetting !== null) {
              item.warningSetting.lowerThreshold3 !== null
                ? markingList.push(item.warningSetting.lowerThreshold3)
                : markingList.push(null);
              item.warningSetting.lowerThreshold2 !== null
                ? markingList.push(item.warningSetting.lowerThreshold2)
                : markingList.push(null);
              item.warningSetting.lowerThreshold1 !== null
                ? markingList.push(item.warningSetting.lowerThreshold1)
                : markingList.push(null);
              item.warningSetting.upperThreshold1 !== null
                ? markingList.push(item.warningSetting.upperThreshold1)
                : markingList.push(null);
              item.warningSetting.upperThreshold2 !== null
                ? markingList.push(item.warningSetting.upperThreshold2)
                : markingList.push(null);
              item.warningSetting.upperThreshold3 !== null
                ? markingList.push(item.warningSetting.upperThreshold3)
                : markingList.push(null);
              markingList.forEach((key, index) => {
                switch (index) {
                  case 0:
                    if (key !== null) {
                      lower3 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        item.min,
                        key
                      );
                      baifenbiOptions.push([lower3.maxbaifenbi, "#B53332"]);
                    }
                    break;
                  case 1:
                    if (key !== null) {
                      lower2 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        item.min,
                        key
                      );
                      baifenbiOptions.push([lower2.maxbaifenbi, "#c69a66"]);
                    }
                    break;
                  case 2:
                    if (key !== null) {
                      lower1 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        item.min,
                        key
                      );
                      baifenbiOptions.push([lower1.maxbaifenbi, "#ffd71b"]);
                    }
                    break;
                  case 3:
                    if (key !== null) {
                      upper1 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        key,
                        item.max
                      );
                      baifenbiOptions.push([upper1.minbaifenbi, "#6A869F"]);
                    }
                    break;
                  case 4:
                    if (key !== null) {
                      upper2 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        key,
                        item.max
                      );
                      if (upper1 === null) {
                        baifenbiOptions.push([upper2.minbaifenbi, "#6A869F"]);
                      } else {
                        baifenbiOptions.push([upper2.minbaifenbi, "#ffd71b"]);
                      }
                    }
                    break;
                  case 5:
                    if (key !== null) {
                      upper3 = METHODS.PanelPercenScale(
                        item.min,
                        item.max,
                        key,
                        item.max
                      );
                      if (upper1 === null && upper2 === null) {
                        baifenbiOptions.push([upper3.minbaifenbi, "#6A869F"]);
                      } else if (upper1 !== null && upper2 === null) {
                        baifenbiOptions.push([upper3.minbaifenbi, "#ffd71b"]);
                      } else if (upper1 === null && upper2 !== null) {
                        baifenbiOptions.push([upper3.minbaifenbi, "#c69a66"]);
                      } else if (upper1 !== null && upper2 !== null) {
                        baifenbiOptions.push([upper3.minbaifenbi, "#c69a66"]);
                      }
                    }
                    break;
                  default:
                    break;
                }
              });
              if (upper1 === null && upper2 === null && upper3 === null) {
                baifenbiOptions.push([1, "#6A869F"]);
              }
              if (upper2 === null && upper3 === null) {
                baifenbiOptions.push([1, "#ffd71b"]);
              } else if (upper2 !== null && upper3 === null) {
                baifenbiOptions.push([1, "#c69a66"]);
              } else {
                baifenbiOptions.push([1, "#B53332"]);
              }
            } else {
              baifenbiOptions = [[1, "#6A869F"]];
            }

            let option = {
              title: {
                text: `${item.name}`,
                left: "center",
                subtext: item.installLocation
              },
              tooltip: { formatter: "{a} <br/>{b} : {c}" },
              series: [
                {
                  name: "实时数据",
                  min: item.min,
                  max: item.max,
                  startAngle: 180, //开始角度 左侧角度
                  endAngle: 0, //结束角度 右侧
                  type: "gauge",
                  // center: [(j*20)+15+'%', '50%'], //**调整仪表盘的位置**
                  center: ["50%", "55%"],
                  detail: {
                    formatter: (value: any) => {
                      return `${value} ${item.unit}`;
                    },
                    color: "#ee83af",
                    fontSize: 18,
                    fontWeight: "bolder"
                  },
                  axisLine: {
                    lineStyle: {
                      color: baifenbiOptions
                    }
                  },
                  itemStyle: { color: "#b6bcfb" },
                  splitLine: { show: false },
                  axisTick: { show: false },
                  axisLabel: {
                    show: true,
                    fontSize: 10,
                    formatter: "{value}"
                  },
                  pointer: { width: 6 },
                  data: [{ value: 0 }],
                  title: {
                    show: true,
                    offsetCenter: [0, "70%"],
                    fontWeight: "bolder",
                    fontSize: 26,
                    color: "#b6bcfb",
                    text: "aaaaa"
                  }
                }
              ]
            };
            DATA.panelOptions.push({
              uuid: item.uuid,
              option,
              warningSetting: item.warningSetting
            });
          });
        }
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
              uuid: [item.uuid]
            });
          } else {
            list[snList.indexOf(item.sn)].uuid.push(item.uuid);
          }
        });
        return list;
      }
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
                userId: STORE.state.user.userId
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
                    userId: STORE.state.user.userId
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
                    userId: STORE.state.user.userId
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
              type: "error"
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
              resultData.value
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
          type: "error"
        });
      },
      setOncloseMessage: () => {},
      setOnSendMessage: (mesage: string) => {
        if (DATA.websocket.readyState === 1) {
          DATA.websocket.send(mesage);
        }
      }
    });
    watch(
      () => DATA.existSensor,
      (newValue, oldValue) => {
        if (oldValue.length > 0) {
          oldValue.forEach((item: any) => {
            SOCKET.setOnSendMessage(
              `0102${JSON.stringify({
                uuidList: item.uuid,
                sn: item.sn,
                userId: STORE.state.user.userId
              })}`
            );
          });
        }

        if (DATA.existSensor.length > 0 && DATA.websocket) {
          DATA.timer && clearInterval(DATA.timer);
          DATA.timer = setInterval(() => {
            DATA.existSensor.forEach((item: any) => {
              SOCKET.setOnSendMessage(
                `0101${JSON.stringify({
                  uuidList: item.uuid,
                  sn: item.sn,
                  userId: STORE.state.user.userId
                })}`
              );
            });
          }, 1000 * 60);
        } else if (DATA.websocket && DATA.timer) {
          clearInterval(DATA.timer);
        }
      },
      {
        deep: true
      }
    );
    STORE.state.user.personnel.unitType === 1
      ? METHODS.handleFindGetAllSensorDevice()
      : METHODS.handleUserCompany();
    onMounted(async () => {});
    onUnmounted(() => {
      if (DATA.existSensor.length > 0) {
        DATA.existSensor.forEach((item: any) => {
          SOCKET.setOnSendMessage(
            `0102${JSON.stringify({
              uuidList: item.uuid,
              sn: item.sn,
              userId: STORE.state.user.userId
            })}`
          );
        });
      }
      DATA.websocket && DATA.websocket.close();
      DATA.timer && clearInterval(DATA.timer);
    });

    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ...toRefs(SOCKET),
      panelChartsRef,
      lineChartRef,
      seed_panelRef,
      STORE
    };
  },
  // 对接外接路由
  beforeRouteEnter(to, from, next) {
    if (to.query.companyId && to.query.sensorId) {
      next(async (vm: any) => {
        vm.lineLoading = true;
        await vm.handleFindByCompany(to.query.companyId);
        vm.senserInfo = Object.assign({}, { id: to.query.sensorId });
        nextTick(async () => {
          if (!vm.websocket) {
            await vm.initWebSocket();
          }
          let lower3: any = null,
            lower2: any = null,
            lower1: any = null,
            upper3: any = null,
            upper2: any = null,
            upper1: any = null;
          if (vm.sensorList.length > 0) {
            vm.sensorList.forEach((item: any) => {
              if (item.id == to.query.sensorId) {
                let baifenbiOptions: Array<any> = [];
                let markingList: Array<any> = [];
                if (item.warningSetting !== null) {
                  item.warningSetting.lowerThreshold3 !== null
                    ? markingList.push(item.warningSetting.lowerThreshold3)
                    : markingList.push(null);
                  item.warningSetting.lowerThreshold2 !== null
                    ? markingList.push(item.warningSetting.lowerThreshold2)
                    : markingList.push(null);
                  item.warningSetting.lowerThreshold1 !== null
                    ? markingList.push(item.warningSetting.lowerThreshold1)
                    : markingList.push(null);
                  item.warningSetting.upperThreshold1 !== null
                    ? markingList.push(item.warningSetting.upperThreshold1)
                    : markingList.push(null);
                  item.warningSetting.upperThreshold2 !== null
                    ? markingList.push(item.warningSetting.upperThreshold2)
                    : markingList.push(null);
                  item.warningSetting.upperThreshold3 !== null
                    ? markingList.push(item.warningSetting.upperThreshold3)
                    : markingList.push(null);
                  markingList.forEach((key, index) => {
                    switch (index) {
                      case 0:
                        if (key !== null) {
                          lower3 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            item.min,
                            key
                          );
                          baifenbiOptions.push([lower3.maxbaifenbi, "#B53332"]);
                        }
                        break;
                      case 1:
                        if (key !== null) {
                          lower2 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            item.min,
                            key
                          );
                          baifenbiOptions.push([lower2.maxbaifenbi, "#c69a66"]);
                        }
                        break;
                      case 2:
                        if (key !== null) {
                          lower1 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            item.min,
                            key
                          );
                          baifenbiOptions.push([lower1.maxbaifenbi, "#ffd71b"]);
                        }
                        break;
                      case 3:
                        if (key !== null) {
                          upper1 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            key,
                            item.max
                          );
                          baifenbiOptions.push([upper1.minbaifenbi, "#6A869F"]);
                        }
                        break;
                      case 4:
                        if (key !== null) {
                          upper2 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            key,
                            item.max
                          );
                          if (upper1 === null) {
                            baifenbiOptions.push([
                              upper2.minbaifenbi,
                              "#6A869F"
                            ]);
                          } else {
                            baifenbiOptions.push([
                              upper2.minbaifenbi,
                              "#ffd71b"
                            ]);
                          }
                        }
                        break;
                      case 5:
                        if (key !== null) {
                          upper3 = vm.PanelPercenScale(
                            item.min,
                            item.max,
                            key,
                            item.max
                          );
                          if (upper1 === null && upper2 === null) {
                            baifenbiOptions.push([
                              upper3.minbaifenbi,
                              "#6A869F"
                            ]);
                          } else if (upper1 !== null && upper2 === null) {
                            baifenbiOptions.push([
                              upper3.minbaifenbi,
                              "#ffd71b"
                            ]);
                          } else if (upper1 === null && upper2 !== null) {
                            baifenbiOptions.push([
                              upper3.minbaifenbi,
                              "#c69a66"
                            ]);
                          } else if (upper1 !== null && upper2 !== null) {
                            baifenbiOptions.push([
                              upper3.minbaifenbi,
                              "#c69a66"
                            ]);
                          }
                        }
                        break;
                      default:
                        break;
                    }
                  });
                  if (upper1 === null && upper2 === null && upper3 === null) {
                    baifenbiOptions.push([1, "#6A869F"]);
                  }
                  if (upper2 === null && upper3 === null) {
                    baifenbiOptions.push([1, "#ffd71b"]);
                  } else if (upper2 !== null && upper3 === null) {
                    baifenbiOptions.push([1, "#c69a66"]);
                  } else {
                    baifenbiOptions.push([1, "#B53332"]);
                  }
                } else {
                  baifenbiOptions = [[1, "#6A869F"]];
                }
                let option = {
                  title: {
                    text: item.name,
                    left: "center"
                  },
                  tooltip: { formatter: "{a} <br/>{b} : {c}" },
                  series: [
                    {
                      name: "实时数据",
                      min: item.min,
                      max: item.max,
                      startAngle: 180, //开始角度 左侧角度
                      endAngle: 0, //结束角度 右侧
                      type: "gauge",
                      // center: [(j*20)+15+'%', '50%'], //**调整仪表盘的位置**
                      detail: {
                        formatter: (value: any) => {
                          return `${value} ${item.unit}`;
                        },
                        color: "#ee83af",
                        fontSize: 18,
                        fontWeight: "bolder"
                      },
                      axisLine: {
                        lineStyle: {
                          color: baifenbiOptions
                        }
                      },
                      itemStyle: { color: "#b6bcfb" },
                      splitLine: { show: false },
                      axisTick: { show: false },
                      axisLabel: {
                        show: true,
                        fontSize: 10,
                        formatter: "{value}"
                      },
                      pointer: { width: 6 },
                      data: [{ value: 0 }],
                      title: {
                        show: true,
                        offsetCenter: [0, "70%"],
                        fontWeight: "bolder",
                        fontSize: 26,
                        color: "#b6bcfb",
                        text: "aaaaa"
                      }
                    }
                  ]
                };
                vm.panelOption = [{ uuid: item.uuid, option }];
                vm.lineChartsData = [];
                vm.option.series[0].data = [];
                vm.option.yAxis.min = item.min;
                vm.option.yAxis.max = item.max;
                vm.lineOption = [
                  { uuid: item.uuid, option: Object.assign({}, vm.option) }
                ];
              }
            });
          }
          vm.websocket.readyState === 3 && (vm.lineLoading = false);
          vm.marking = 4;
        });
      });
    } else {
      next();
    }
    // ...
  }
});
</script>
<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
}
.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}
.charts {
  // width: 33.3% !important;
  .charts_item {
    width: 100% !important;
    height: 350px;
    border: 1px solid rgba($color: #cccccc, $alpha: 0.5);
    border-radius: 4px;
    &:hover {
      box-shadow: 0 0 5px 1px #cccccc;
      cursor: pointer;
    }
    & > div {
      & > canvas {
        width: 100% !important;
      }
    }
  }
}
.amap {
  width: 100%;
  height: calc(100vh - 170px);
}
.warning {
  border: 1px solid red !important;
}
.panelSensor {
  flex-wrap: wrap;
  // min-height: calc(100vh - 170px);
}
</style>