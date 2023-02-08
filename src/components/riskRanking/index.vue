<template>
  <el-row>
    <el-col
      :span="24"
      v-loading="loading"
    >
      <el-radio-group
        v-model="risk"
        @change="handleChangeRisk"
      >
        <el-radio
          v-for="item of riskList"
          :key="item.value"
          :label="item.value"
        >{{item.name}}</el-radio>
      </el-radio-group>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue';
export default defineComponent({
  emits: ['handleChangeRisk'],
  props: {
    riskLevel: {
      type: Number,
    },
    riskList: {
      type: Array,
      default: [],
    },
  },
  setup(props, { emit }) {
    let { riskList, riskLevel }: any = props;
    let DATA: any = reactive({
      risk: '',
      loading: false,
    });
    let METHODS = reactive({
      handleGetRiskList: async () => {
        DATA.risk = riskLevel ? riskLevel : riskList[riskList.length - 1].value;
        emit('handleChangeRisk', DATA.risk);
      },
      handleChangeRisk: () => {
        emit('handleChangeRisk', DATA.risk);
      },
    });
    watch(
      () => props.riskLevel,
      (newValue) => {
        DATA.risk = newValue ? newValue : riskList[riskList.length - 1].value;
      }
    );
    METHODS.handleGetRiskList();
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
</style>