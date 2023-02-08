<template>
  <p class="mb-10">
    <span class="fast">快速定位<span class="mr-5 ml-5">:</span></span>
    <span
      class="twon_item"
      :class="code === null && 'yellow'"
      @click="handeeAllTown"
      >全部</span
    >
    <span
      v-for="item of townList"
      :key="item.code"
      class="twon_item"
      :class="item.code === code && 'yellow'"
      @click="handleClickTwon(item.code)"
    >
      {{ item.name }}
    </span>
  </p>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  emits: ["handleClickTwon"],
  setup(props, { emit }) {
    const STORE = useStore();
    let DATA: any = reactive({
      townList: [],
      code: null,
    });
    let METHODS = reactive({
      handeeAllTown: () => {
        DATA.code = null;
        emit("handleClickTwon", null);
      },
      handleClickTwon: (code: number) => {
        DATA.code = code;
        emit("handleClickTwon", code);
      },
    });
    onMounted(() => {
      DATA.townList = STORE.state.globalData.townList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.twon_item {
  display: inline-block;
  // text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  word-wrap: break-all;
  // font-weight: 600;
  &:hover {
    color: $themeColor;
  }
}
.yellow {
  color: $textColor;
  background-color: $themeColor;
  border-radius: 10px;
  &:hover {
    color: $textColor;
  }
}
.fast {
  font-size: 16px;
  color: #606266;
  font-weight: 700 !important;
}
</style>