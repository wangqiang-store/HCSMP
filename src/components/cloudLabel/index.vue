<template>
  <el-row>
    <el-col :span="24" v-if="labelList.length > 0" class="col">
      <div v-for="item of labelList" :key="item.id">
        <el-tag class="mr-10 mb-20 tag" :type="labelTypes(item.labelType)">{{
          item.labelType
        }}</el-tag>
      </div>
      <!-- <el-tag
        class="mr-10 mb-20 tag"
        v-for="item of list"
        :key="item.id"
        :type="labelTypes(item.labelType)"
        >{{ item.labelType }}</el-tag
      > -->
    </el-col>
    <el-col :span="24" class="d_flex d_flex_column" v-else>
      <img style="width: 70%" :src="require('@/assets/image/zwxx.png')" />
      <p class="title mt-10 text-ellipsis">暂无标签云数据</p>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  props: {
    labelList: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    let DATA = reactive({});
    let METHODS = reactive({
      // 展示不同标签类型
      labelTypes: (type: string) => {
        let tagType = "";
        switch (type) {
          case "一年多次整改":
            tagType = "danger";
            break;
          case "设立超过5年":
            tagType = "promary";
            break;
          case "存在重大隐患未整改":
            tagType = "info";
            break;
          case "存在企业证照到期":
            tagType = "warning";
            break;
          case "存在人员证照到期":
            tagType = "warning";
            break;
          default:
            break;
        }
        return tagType;
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.title {
  font-size: 12px;
  font-weight: bold;
}
.col {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  & > div {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
.tag {
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  box-shadow: 0 0 5px 1px #ddd;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>