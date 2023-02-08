<template>
  <!-- 安监执法统计分析页面 -->
  <el-row class="page container" style="height:100%">
    <el-col :span="24">
      <el-row class="mt-20">
        <el-col :span="24" class="d_flex d_flex_sb title">
          <h2>{{ yearly }}年度安监执法统计分析</h2>
          <div class="titleDate">
            <el-date-picker
              v-model="date"
              type="year"
              placeholder="请选择年份"
              size="large"
              :disabled-date="disabledDate"
              @change="handleChangeYear"
            >
            </el-date-picker>
          </div>
        </el-col>
        <el-col
          :span="24"
          class="d_flex ml-10"
          v-loading="loading"
          element-loading-text="数据加载中..."
        >
          <div style="width: 100%" ref="barChartRef">
            <init-echarts
              :id="`barChart`"
              :options="barOption"
              :innerWidth="0.8"
            ></init-echarts>
          </div>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { RES_SUCCESS } from "@/api/common/common";
import InitEcharts from "@/components/initEcharts/index.vue";
import { getCaseSettlement } from "@/api/enforcement/analysis";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  components: { InitEcharts },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let DATA: any = reactive({
      date: new Date(),
      yearly: new Date(),
      loading: false,

      // echarts
      barOption: {},
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      //获取数据
      handleGetData: async () => {
        DATA.loading = true;
        if (DATA.date) {
          DATA.yearly = new Date(DATA.date).getFullYear();
        } else {
          DATA.yearly = new Date().getFullYear();
        }
        let option = {
          grid: {
            left: 50,
            right: 50,
          },
          legend: {
            data: ["安全事故", "死亡人数", "重伤人数", "事故查处", "结案数量"],
            bottom: "0",
            itemWidth: 14,
            padding: [0, 0, 0, 100],
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },

          color: ["#3aa0ff", "#4ecb73", "#fad337", "#435088", "#975fe4"],
          xAxis: [
            {
              type: "category",
              axisTick: {
                show: false,
              },
              data: [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月",
              ],
            },
          ],
          yAxis: [
            {
              type: "value",
             minInterval: 1, //设置成1保证坐标轴分割刻度显示成整数。
            },
          ],

          series: [
            {
              name: "安全事故",
              type: "bar",
              data: [],
              barWidth: "10%",
            },
            {
              name: "死亡人数",
              type: "bar",
              data: [],
              barWidth: "10%",
            },
            {
              name: "重伤人数",
              type: "bar",
              data: [],
              barWidth: "10%",
            },
            {
              name: "事故查处",
              type: "bar",
              data: [],
              barWidth: "10%",
            },
            {
              name: "结案数量",
              type: "bar",
              data: [],
              barWidth: "10%",
              barGap: 0,
            },
          ],
        };
        DATA.barOption = option;
        let { data } = await getCaseSettlement({ yearly: DATA.yearly });
        if (data.code === RES_SUCCESS) {
          for (const item of data.data) {
            DATA.barOption.series[0].data.push(item.safetyAccident);
            DATA.barOption.series[1].data.push(item.deathToll);
            DATA.barOption.series[2].data.push(item.seriouslyInjured);
            DATA.barOption.series[3].data.push(item.identified);
            DATA.barOption.series[4].data.push(item.numberOfCases);
          }
        }
        DATA.loading = false;
      },
      // 改变年份
      handleChangeYear: (val: any) => {
        DATA.yearly = val;
        METHODS.handleGetData();
      },
    });
    onMounted(() => {
      METHODS.handleGetData();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 80px) !important;
}
.page {
  margin: 40px 10px;
  .title {
    margin-bottom: 20px;
    position: relative;
    h2 {
      font: 700 36px "黑体";
      margin-left: auto;
      margin-right: auto;
    }
    .titleDate {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
.button {
  margin-top: 10px;
  float: right;
}
</style>
