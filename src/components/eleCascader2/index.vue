<template>
  <el-cascader :options="options" clearable placeholder="请选择企业">
    <template #default="{ data }">
      <span
        @click="handleChange(data)"
        :class="{ gray: data.isColor == 'gray' }"
        >{{ data.label }}</span
      >
    </template>
  </el-cascader>
</template>
<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, toRefs } from "vue";
import { findAndTree } from "@/api/monitor/device";
import { useState } from "@/hooks/useMapper";
import { getListByTown } from "@/api/company";
import { RES_SUCCESS } from "@/api/common/common";
import { ElMessage } from "element-plus";
export default defineComponent({
  props: {
    ids: {
      type: String,
      default: "",
    },
  },
  emits: ["handleChange"],
  setup(props, { emit }) {
    let { globalData } = useState(["globalData"]);
    let { user } = useState(["user"]);
    let townList: Array<any> = globalData.value.townList;
    let unitType: number = user.value.personnel.unitType;
    let companyId: number = user.value.personnel.companyId;
    let DATA: any = reactive({
      isaaa: false,
      arr: [],
      arr2: [],
      options: [],
    });
    let METHODS = reactive({
      handleChange: (value: any) => {
        console.log("当前的数据", value);
        if (value.id) {
          emit("handleChange", value);
        }
      },

      //获取级联的options
      getOptions: async () => {
        let { data } = await findAndTree();
        if (data.code === RES_SUCCESS) {
          nextTick(() => {
            DATA.options = [];
            // 镇
            data.data.forEach((item: any, index: any) => {
              DATA.options.push({
                value: item.id,
                label: item.townName,
                children: item.companyList,
                isColor: "",
              });
              // 企业
              let list = DATA.options[index].children.map(
                (item2: any, index2: any) => {
                  item2.label = item2.name;
                  if (item2.deviceList?.length <= 0) {
                    item2.isColor = "gray";
                  }
                  return item2;
                }
              );

              //给镇置灰
              let companyIsGray = list.every((item: any) => {
                return item.isColor == "gray";
              });
              DATA.options[index].children = list;
              DATA.options[index].isColor = companyIsGray ? "gray" : "";
            });
          });
        }
      },
    });
    onMounted(() => {
      METHODS.getOptions();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
ul.scrollbar__view.el-cascader-menu__list /deep/.is-disabled.el-cascader-node {
  color: var(--el-cascader-node-color-disabled);
  background-color: pink !important;
  cursor: pointer !important;
  pointer-events: none;
}
.gray {
  color: #ababab;
}
.el-cascader-node__label {
  span {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}
</style>