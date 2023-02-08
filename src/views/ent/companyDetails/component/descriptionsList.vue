<template>
  <el-row>
    <el-col :span="24">
      <div class="d_flex d_flex_sb flex-wrap">
        <div
          v-for="item of options"
          :key="item.label"
          :style="{width:item.width}"
          class="pb-10"
        >
          <span class="label mr-10">{{item.label}}:</span>
          <div
            class="text"
            v-if="(data && data[item.prop]) || (item.formatter &&  item.formatter(data))"
          >
            <span v-if="!item.slot">{{ item.formatter ? item.formatter(data) : data[item.prop]}}</span>
            <div
              v-else
              v-html="item.formatter(data)"
            >
            </div>
          </div>
          <el-tag
            type="info"
            v-else
          >暂无数据<i class="el-icon-info ml-5"></i></el-tag>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
export default defineComponent({
  props: {
    options: {
      type: Array,
      default: [],
    },
    data: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    let DATA = reactive({});
    let METHODS = reactive({});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.label {
  font-weight: bold;
  font-size: 16px;
}
.text {
  display: inline-block;
  font-size: 16px;
  color: #333333;
}
</style>