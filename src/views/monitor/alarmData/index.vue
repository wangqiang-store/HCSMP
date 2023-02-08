<template>
  <el-row class="container">
    <el-col :span="24" class="d_flex d_flex_end">
      <el-cascader
        v-model="value"
        :options="options"
        :props="props"
        @change="handleChange"
        clearable
        class="mr-10"
      ></el-cascader>

      <!-- <el-date-picker
        v-model="dateList"
        type="datetimerange"
        :shortcuts="shortcuts"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleChangeDate"
        class="mr-10"
        clearable
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
          :shortcuts="shortcuts2"
        />
      </n-config-provider>

      <el-button type="primary" @click="handleSearch"
        ><i class="el-icon-search mr-5"></i>搜索</el-button
      >
    </el-col>
    <el-col :span="24" v-loading="loading" class="mt-10">
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        :btnList="btnList"
        @handleBtnEvent="handleBtnEvent"
      ></ele-table>
      <ele-pagination
        :total="total"
        :currentPage="pagingParamsCopy.page"
        @handleCurrentChange="
          (val) =>
            handleCurrentChange(
              val,
              pagingParams,
              pagingParamsCopy,
              handleGetPagingData
            )
        "
        @handleSizeChange="
          (val) =>
            handleSizeChange(
              val,
              pagingParams,
              pagingParamsCopy,
              handleGetPagingData,
              total
            )
        "
      ></ele-pagination>
    </el-col>
    <el-col :span="24">
      <!-- 传感器详情模态框 -->
      <el-dialog
        title="传感器详情信息"
        v-model="sensorInfoDialogVisible"
        width="50%"
        top="3vh"
      >
        <el-descriptions
          class="margin-top mb-20"
          title="基础信息"
          :column="3"
          border
        >
          <el-descriptions-item>
            <template #label> 传感器名称 </template>
            {{ sensorData.sensorDevice.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 单位 </template>
            {{ sensorInfo.companyInfoName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 安装位置 </template>
            {{ sensorData.sensorDevice.installLocation }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 安装时间 </template>
            <span v-if="sensorData.sensorDevice.installTime">{{
              sensorData.sensorDevice.installTime
            }}</span>
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 气体类型 </template>
            {{ sensorInfo.gasType }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 被监测设备 </template>
            {{ sensorData.sensorDevice.monitorDevice }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 网关SN </template>
            <span v-if="sensorData.sensorDevice.sn">{{
              sensorData.sensorDevice.sn
            }}</span>
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> UUID </template>
            {{ sensorData.sensorDevice.uuid }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 监测内容 </template>
            {{ sensorData.sensorDevice.monitorContent }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 传感器类型 </template>
            {{ sensorInfo.sensorDeviceType }}
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions
          class="margin-top mb-20"
          title="报警参数"
          :column="3"
          border
        >
          <el-descriptions-item>
            <template #label> 仪表盘最小值 </template>
            {{ sensorData.sensorDevice.min }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 仪表盘最大值 </template>
            {{ sensorData.sensorDevice.max }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 1级上限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.upperThreshold1
              "
              >{{ sensorData.warningSetting.upperThreshold1 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 1级下限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.lowerThreshold1
              "
              >{{ sensorData.warningSetting.lowerThreshold1 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 2级上限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.upperThreshold2
              "
              >{{ sensorData.warningSetting.upperThreshold2 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 2级下限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.lowerThreshold2
              "
              >{{ sensorData.warningSetting.lowerThreshold2 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 3级上限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.upperThreshold3
              "
              >{{ sensorData.warningSetting.upperThreshold3 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 3级下限阀值 </template>
            <span
              v-if="
                sensorData.warningSetting != null &&
                sensorData.warningSetting.lowerThreshold3
              "
              >{{ sensorData.warningSetting.lowerThreshold3 }}</span
            >
            <el-tag v-else type="info">
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions class="margin-top" title="气体参数" :column="3" border>
          <el-descriptions-item>
            <template #label> 气体密度 </template>
            <span
              v-if="sensorData.toxicGas != null && sensorData.toxicGas.density"
              >{{ sensorData.toxicGas.density }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 熔点 </template>
            <span
              v-if="
                sensorData.toxicGas != null && sensorData.toxicGas.meltingPoint
              "
              >{{ sensorData.toxicGas.meltingPoint }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> PC-TWA </template>
            <span
              v-if="sensorData.toxicGas != null && sensorData.toxicGas.pcTwa"
              >{{ sensorData.toxicGas.pcTwa }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> PC-STEL </template>
            <span
              v-if="sensorData.toxicGas != null && sensorData.toxicGas.pcStel"
              >{{ sensorData.toxicGas.pcStel }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> MAC </template>
            <span
              v-if="sensorData.toxicGas != null && sensorData.toxicGas.mac"
              >{{ sensorData.toxicGas.mac }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> IDLH </template>
            <span
              v-if="sensorData.toxicGas != null && sensorData.toxicGas.idlh"
              >{{ sensorData.toxicGas.idlh }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 引燃温度 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.firePoint
              "
              >{{ sensorData.flammableGas.firePoint }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 闪点 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.flashPoint
              "
              >{{ sensorData.flammableGas.flashPoint }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 火灾危险分类 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.fireHazardClass
              "
              >{{ sensorData.flammableGas.fireHazardClass }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 主要危险 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.danger
              "
              >{{ sensorData.flammableGas.danger }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 备注 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.remark
              "
              >{{ sensorData.flammableGas.remark }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label> 沸点 </template>
            <span
              v-if="
                sensorData.flammableGas != null &&
                sensorData.flammableGas.boilingPoint
              "
              >{{ sensorData.flammableGas.boilingPoint }}</span
            >
            <el-tag type="info" v-else>
              <i class="el-icon-info"></i>
              <b>请填写</b>
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <!-- 报警详情模态框 -->
      <el-dialog
        title="报警详情"
        v-model="warningDialogVisible"
        width="80%"
        top="3vh"
      >
        <div style="width: 100%" ref="lineChartRef">
          <init-echarts
            :id="`lineChart_1`"
            :options="chartOptions"
            :innerWidth="0.78"
            ref="chartsRef"
          ></init-echarts>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import InitEcharts from "@/components/initEcharts/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { filterTime } from "@/utils/filtration";
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import { alarmFindByPage } from "@/api/monitor/alarmData";
import {
  findAndTree,
  findByCompanySensorDevice,
  findOne,
} from "@/api/monitor/device";
import { useStore } from "vuex";
import { findHistory } from "@/api/monitor/historyData";
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui";
export default defineComponent({
  components: { EleTable, ElePagination, InitEcharts, NConfigProvider },
  setup(props) {
    const STORE = useStore();
    let lineChartRef: any = ref(null);
    let chartsRef: any = ref(null);
    let DATA: any = reactive({
      range: null,
      zhCN,
      dateZhCN,
      themeOverrides: {
        common: {
          primaryColor: "#409eff",
          primaryColorHover: "#409eff",
        },
      },
      pagingParams: {
        startTime: null,
        endTime: null,
        sensorDeviceId: null,
        companyInfoId: null,
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        startTime: null,
        endTime: null,
        sensorDeviceId: null,
        companyInfoId: null,
        limit: 10,
        page: 1,
      },
      total: 0,
      value: [],
      props: { expandTrigger: "hover" },
      options: [],
      shortcuts: [
        {
          text: "最近一周",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
          },
        },
        {
          text: "最近一个月",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
          },
        },
        {
          text: "最近三个月",
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            return [start, end];
          },
        },
      ],
      shortcuts2: {
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
      dateList: [],
      //   表格
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: "传感器名称",
          type: "text",
          prop: "sensorDeviceName",
        },
        {
          label: "单位",
          type: "text",
          prop: "companyInfoName",
        },
        {
          label: "安装位置",
          type: "text",
          prop: "sensorDeviceAddress",
        },
        {
          label: "气体类型",
          type: "text",
          prop: "gasType",
        },
        {
          label: "传感器类型",
          type: "text",
          prop: "sensorDeviceType",
        },
        {
          label: "报警时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime)} - ${filterTime(row.endTime)}`;
          },
        },
        {
          label: "报警区间",
          type: "text",
          formatter: (row: any) => {
            return `${row.minValue} - ${row.maxValue}`;
          },
        },
        {
          label: "报警等级",
          type: "tag",
          prop: "warningLevelName",
          width: 150,
          formatter: (row: any) => {
            let tagOption = {
              text: row.warningLevelName,
              tagType: "danger",
            };
            return tagOption;
          },
        },
        {
          label: "操作",
          type: "handle",
          width: 240,
        },
      ],
      btnList: [
        {
          text: "传感器详情",
          type: "success",
          size: "small",
          handleType: "sensorInfo",
          isShow: true,
        },
        {
          text: "报警详情",
          type: "success",
          size: "small",
          handleType: "warningInfo",
          isShow: true,
        },
      ],
      loading: false,
      sensorLoading: false,
      warningDialogVisible: false,
      sensorInfoDialogVisible: false,
      sensorInfo: {},
      sensorData: {},
      lineChartData: [],
      // 折线图配置
      chartOptions: {
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
      // 时间段选择
      change(value: any) {
        if (!value) {
          DATA.pagingParams.startTime = null;
          DATA.pagingParams.endTime = null;
          return;
        }
        DATA.range = value;
        if (String(value[0]) == String(value[1])) {
          DATA.range[1] = new Date().getTime();
        }
        DATA.pagingParams.startTime = filterTime(DATA.range[0], "/");
        DATA.pagingParams.endTime = filterTime(DATA.range[1], "/");
      },
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        let { data } = await alarmFindByPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handleGetPagingData);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handleGetPagingData,
          total
        );
      },
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      handleChange: (value: any) => {
        if (value !== null) {
          if (STORE.state.user.personnel.unitType === 1) {
            DATA.pagingParams.sensorDeviceId = value[2];
          } else if (STORE.state.user.personnel.unitType === 2) {
            DATA.pagingParams.sensorDeviceId = value[1];
          }
        } else {
          DATA.pagingParams.sensorDeviceId = null;
        }
      },
      handleChangeDate: () => {
        if (DATA.dateList === null) {
          DATA.pagingParams.startTime = null;
          DATA.pagingParams.endTime = null;
        } else if (DATA.dateList.length > 0) {
          DATA.pagingParams.startTime = filterTime(DATA.dateList[0], "/");
          DATA.pagingParams.endTime = filterTime(DATA.dateList[1], "/");
        }
      },
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "sensorInfo":
            await METHODS.handleGetSensorData(row.sensorDeviceId);
            DATA.sensorInfo = Object.assign({}, row);
            DATA.sensorInfoDialogVisible = true;
            break;
          case "warningInfo":
            DATA.warningDialogVisible = true;
            await METHODS.handleWarningInfo(
              row.startTime,
              row.endTime,
              row.sensorDeviceId
            );
            break;
          default:
            break;
        }
      },
      // 获取传感器数据
      handleGetSensorData: async (id: number) => {
        DATA.sensorLoading = true;
        let { data } = await findOne({ id });
        if (data.code === RES_SUCCESS) {
          DATA.sensorLoading = false;
          if (data.data != null) {
            DATA.sensorData = data.data;
          } else {
            DATA.sensorData = {};
          }
        }
      },
      // 报警详情
      handleWarningInfo: async (
        startTime: string,
        endTime: string,
        sensorDeviceId: number
      ) => {
        startTime = filterTime(startTime, "/");
        endTime = filterTime(endTime, "/");
        nextTick(() => {
          chartsRef.value.chartloading();
        });
        DATA.lineChartData = [];
        let { data } = await findHistory({
          startTime,
          endTime,
          sensorDeviceId,
        });
        if (data.code === RES_SUCCESS) {
          nextTick(() => {
            chartsRef.value.charthideloading();
          });
          if (data.data != null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              DATA.lineChartData.push([
                filterTime(item.createTime),
                item.value,
              ]);
            });
          }
          DATA.chartOptions.series[0].data = DATA.lineChartData;
        }
      },
      handleGetThree: async () => {
        if (STORE.state.user.personnel.unitType === 1) {
          let { data } = await findAndTree();
          if (data.code === RES_SUCCESS) {
            DATA.options = METHODS.filterThreeData([], data.data);
          }
        } else {
          let { data } = await findByCompanySensorDevice({
            companyInfoId: STORE.state.user.personnel.companyId,
          });
          if (data.code === RES_SUCCESS) {
            let Obj: any = {
              value: data.data.id,
              label: data.data.name,
              children: [],
            };
            if (
              data.data.deviceList != null &&
              data.data.deviceList.length > 0
            ) {
              data.data.deviceList.forEach((item: any) => {
                Obj.children.push({
                  label: item.name,
                  value: item.id,
                  companyInfoId: item.companyInfoId,
                });
              });
            }
            DATA.options = [Obj];
          }
        }
      },
      filterThreeData: (list: Array<any>, data: Array<any>) => {
        data.forEach((item, index) => {
          list.push({
            label: item.townName,
            children: [],
          });

          if (item.companyList.length > 0) {
            list.forEach((val: any, ind: number) => {
              item.companyList.forEach((key: any) => {
                if (index === ind) {
                  val.children.push({
                    label: key.name,
                    value: key.id,
                    children: [],
                  });
                }

                if (key.deviceList != null && key.deviceList.length > 0) {
                  val.children.forEach((a: any) => {
                    key.deviceList.forEach((b: any) => {
                      if (b.companyInfoId === a.value) {
                        a.children.push({
                          value: b.id,
                          label: b.name,
                        });
                      }
                    });
                  });
                }
              });
            });
          }
        });
        return list;
      },
    });
    onMounted(() => {
      if (STORE.state.user.personnel.unitType !== 1) {
        DATA.pagingParams.companyInfoId = STORE.state.user.personnel.companyId;
      }
      METHODS.handleGetPagingData(DATA.pagingParams);
      METHODS.handleGetThree();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      lineChartRef,
      chartsRef,
    };
  },
});
</script>
<style scoped lang="scss">
</style>