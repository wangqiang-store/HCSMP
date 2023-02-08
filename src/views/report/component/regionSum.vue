<template>
  <!-- 汇总统计 -->
  <el-row>
    <el-col
      :span="24"
      class="pt-20 mb-20"
    >
      <!-- 地区企业数量统计图 -->
      <init-echarts
        id="regionSum"
        :options="regionSumOptions"
        :innerWidth="0.85"
      ></init-echarts>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import InitEcharts from '@/components/initEcharts/index.vue';
import NoncoalRiskLevel from '../component/noncoalRiskLevel.vue';
import IndustryTrade from '../component/industryTrade.vue';
import { statisticsOfRegional } from '@/api/report/repSum';
import { RES_SUCCESS } from '@/api/common/common';
export default defineComponent({
  components: { InitEcharts, NoncoalRiskLevel, IndustryTrade },
  setup(props) {
    // 地区区域
    let regionData: any = ref([]);
    let DATA: any = reactive({
      /** 地区企业数量 */
      regionSumOptions: {
        title: {
          text: '地区企业数量统计图',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          // selectedMode: false, //取消图例上的点击事件
          bottom: '2.5%',
          icon: 'roundRect',
          itemHeight: 8, // 粗细
        },
        xAxis: {
          name: '区域',
          type: 'category',
          data: regionData.value,
          axisLabel: {
            interval: 0,
            rotate: 20,
          },
        },
        yAxis: {
          name: '数量',
          type: 'value',
          minInterval: 1, //设置成1保证坐标轴分割刻度显示成整数。
        },
        series: [
          {
            name: '企业总数',
            data: [],
            type: 'bar',
          },
          {
            name: '地下矿山企业数量',
            data: [],
            type: 'bar',
          },
          {
            name: '露天矿山矿山企业数量',
            data: [],
            type: 'bar',
          },
          {
            name: '工贸行业企业数量',
            data: [],
            type: 'bar',
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取 地区企业数量
      handleGetRegionCompanySum: async () => {
        let { data } = await statisticsOfRegional();
        if (data.code === RES_SUCCESS) {
          let companyTotal: Array<number> = [],
            diXiaTotal: Array<number> = [],
            gongMaoTotal: Array<number> = [],
            luTianTotal: Array<number> = [];
          if (data.data !== null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              regionData.value.push(item.townName);
              companyTotal.push(item.companyTotal);
              diXiaTotal.push(item.diXiaTotal);
              gongMaoTotal.push(item.gongMaoTotal);
              luTianTotal.push(item.luTianTotal);
            });
            DATA.regionSumOptions.xAxis.data = regionData.value;
            DATA.regionSumOptions.series[0].data = companyTotal;
            DATA.regionSumOptions.series[1].data = diXiaTotal;
            DATA.regionSumOptions.series[2].data = luTianTotal;
            DATA.regionSumOptions.series[3].data = gongMaoTotal;
          }
        }
      },
    });
    onMounted(async () => {
      METHODS.handleGetRegionCompanySum();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
</style>