<template>
  <el-descriptions
    class="margin-top"
    :title="title"
    :column="column"
    :border="border"
    :colon="false"
    :direction="direction"
    :size="size"
  >
    <template v-for="(item, index) in renderDescriptionsArr" :key="index">
      <!-- div 默认 -->
      <el-descriptions-item :span="item.span" v-if="!item.type" prop="item.prop">
        <template #label> {{ item.label }} </template>
        <div>{{ listData[item.prop] }}</div>
      </el-descriptions-item>

      <!-- tag -->
      <el-descriptions-item :span="item.span" v-if="item.type=='tag'" prop="item.prop">
        <template #label> {{ item.label }} </template>
        <el-tag :type="item.tagType" v-if="listData[item.prop]">{{ listData[item.prop] }}</el-tag>
        <div v-else></div>
      </el-descriptions-item>

      <!-- slot -->
      <el-descriptions-item :span="item.span" v-if="item.type=='slot'" prop="item.prop">
        <template #label> {{ item.label }} </template>
          <slot
            :name="item.slotName"
            :scope="listData"
          ></slot>
      </el-descriptions-item>
    </template>
  </el-descriptions>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from "vue";

export default defineComponent({
  props: {
    styles: {
      type: Object,
      defaule: {},
    },
    title: {
      type: String,
      defaule: "",
    },
    column: {
      type: Number,
      defaule: 3,
    },
    border: {
      type: Boolean,
      defaule: false,
    },
    size: {
      type: String,
      defaule: "", //medium / small / mini
    },
    // 排列的方向
    direction: {
      type: String,
      default: "horizontal", //vertical垂直 / horizontal水平
    },
    // 描述列表
    renderDescriptionsArr: {
      type: Array,
      default: [],
    },
    // 列表数据
    listData: {
      type: Object,
      default: {},
    },

    // 是否全部禁用
    isDisable: {
      type: Boolean,
      default: false,
    },
  },
  name: "elFrom",
  setup(prop, { emit }) {
    const { proxy }: any = getCurrentInstance();
    return {};
  },
});
</script>

<style scoped lang="scss">
</style>
