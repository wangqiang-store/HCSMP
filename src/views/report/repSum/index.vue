<template>
  <!-- 汇总统计 -->
  <el-row class="container">
    <el-col
      :span="24"
      class="pt-20 mb-20"
    >
      <!-- 地区企业数量统计图 -->
      <RegionSum />
    </el-col>
    <el-col :span="14">
      <!-- 矿产类型统计图 -->
      <init-echarts
        id="mineralType"
        :options="mineraltypeOptions"
        :innerWidth="0.45"
      ></init-echarts>
    </el-col>
    <el-col :span="10">
      <!-- 矿产类型 占比图 -->
      <init-echarts
        id="mineraltypeProportion"
        :options="mineraltypeProportionOptions"
        :innerWidth="0.35"
      ></init-echarts>
    </el-col>
    <el-col :span="12">
      <!-- 非煤企业风险等级 占比图 -->
      <NoncoalRiskLevel :innerWidth="0.5" />
    </el-col>
    <el-col :span="12">
      <!-- 工贸企业风险等级 占比图 -->
      <IndustryTrade :innerWidth="0.5" />
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, reactive, ref, toRefs } from 'vue';
import InitEcharts from '@/components/initEcharts/index.vue';
import NoncoalRiskLevel from '../component/noncoalRiskLevel.vue';
import IndustryTrade from '../component/industryTrade.vue';
import RegionSum from '../component/regionSum.vue';
import { nonMediaOfMineralType } from '@/api/report/repSum';
import { RES_SUCCESS } from '@/api/common/common';
export default defineComponent({
  components: { InitEcharts, NoncoalRiskLevel, IndustryTrade, RegionSum },
  setup(props) {
    // 开采矿种类型
    let mineTypeList: any = ref([]);
    // 矿产类型占比数据
    let mineraltypeProporData: any = ref([]);
    let DATA: any = reactive({
      /** 矿产类型 */
      mineraltypeOptions: {
        title: {
          text: '非煤矿山企业矿产类型组成情况',
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
          name: '矿种类型',
          type: 'category',
          data: mineTypeList.value,
          axisLabel: {
            interval: 0,
            // rotate: 20,
          },
        },
        yAxis: {
          name: '数量',
          type: 'value',
          minInterval: 1, //设置成1保证坐标轴分割刻度显示成整数。
        },
        series: [
          {
            name: '地下矿山企业',
            data: [],
            type: 'bar',
          },
          {
            name: '露天矿山企业',
            data: [],
            type: 'bar',
          },
        ],
      },
      /** 矿产类型占比 */
      mineraltypeProportionOptions: {
        title: {
          text: '非煤企业矿产类型占比图',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '矿产类型占比',
            type: 'pie',
            radius: '50%',
            selectedMode: 'single',
            data: mineraltypeProporData.value,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取矿产类型占比图 or 类型组成数据
      handleMineraltypeProportion: async () => {
        let diXiaTotal: Array<number> = [];
        let luTianTotal: Array<number> = [];
        mineraltypeProporData.value = [];
        let { data } = await nonMediaOfMineralType();
        if (data.code === RES_SUCCESS) {
          if (data.data !== null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              mineTypeList.value.push(item.mineralName);
              diXiaTotal.push(item.diXiaTotal);
              luTianTotal.push(item.luTianTotal);
              // 类型占比
              if (item.mineralTotal !== 0 && item.mineralTotal !== null) {
                mineraltypeProporData.value.push({
                  value: item.mineralTotal,
                  name: item.mineralName,
                });
              }
            });
          }
        }
        // 类型组成
        DATA.mineraltypeOptions.series[0].data = diXiaTotal;
        DATA.mineraltypeOptions.series[1].data = luTianTotal;
        // 设置初始选中
        mineraltypeProporData.value[0].selected = true;
        DATA.mineraltypeProportionOptions.series[0].data =
          mineraltypeProporData.value;
      },
    });
    onBeforeMount(async () => {
      await METHODS.handleMineraltypeProportion();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  box-sizing: border-box !important;
  height: calc(100% - 40px) !important;
  width: 100% !important;
  overflow-x: hidden;
}
</style>