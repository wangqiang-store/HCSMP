<template>
  <!-- 汇总统计 -->
  <el-row  class="container">
    <el-col
      :span="24"
      class="pt-20 mb-20"
    >
      <!-- 地区企业数量统计图 -->
      <RegionSum />
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
import { defineComponent, reactive, toRefs } from 'vue';
import InitEcharts from '@/components/initEcharts/index.vue';
import NoncoalRiskLevel from '../component/noncoalRiskLevel.vue';
import IndustryTrade from '../component/industryTrade.vue';
import RegionSum from '../component/regionSum.vue';
export default defineComponent({
  components: { InitEcharts, NoncoalRiskLevel, IndustryTrade, RegionSum },
  setup(props) {
    let DATA: any = reactive({});
    let METHODS = reactive({});
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