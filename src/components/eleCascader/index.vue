<template>
  <el-cascader
    :props="props"
    @change="handleChange"
    v-model="options"
    clearable
    placeholder="请选择企业"
  ></el-cascader>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useState } from '@/hooks/useMapper';
import { getListByTown } from '@/api/company';
import { RES_SUCCESS } from '@/api/common/common';
export default defineComponent({
  emits: ['handleChange'],
  setup(props, { emit }) {
    let { globalData } = useState(['globalData']);
    let { user } = useState(['user']);
    let townList: Array<any> = globalData.value.townList;
    let unitType: number = user.value.personnel.unitType;
    let companyId: number = user.value.personnel.companyId;
    let DATA: any = reactive({
      props: {
        lazy: true,
        async lazyLoad(node: any, resolve: any) {
          const { level } = node;
          let nodeData: Array<any> = [];
          switch (level) {
            case 0:
              if (unitType === 1) {
                townList.forEach((item) => {
                  nodeData.push({
                    value: item.code,
                    label: item.name,
                    leaf: false,
                  });
                });
                resolve(nodeData);
              } else {
                let { data } = await getListByTown({ companyId });
                if (data.code === RES_SUCCESS && data.data !== null) {
                  townList.forEach((item) => {
                    if (item.code === data.data[0].townCode) {
                      nodeData.push({
                        value: item.code,
                        label: item.name,
                        leaf: false,
                      });
                    }
                  });
                  resolve(nodeData);
                }
              }
              break;
            case 1:
              let { data } = await getListByTown({ townCode: node.value });
              if (data.code === RES_SUCCESS && data.data !== null) {
                if (data.data.length === 0) {
                  resolve(data.data);
                } else {
                  data.data.forEach((item: any) => {
                    if (unitType === 1) {
                      nodeData.push({
                        value: item.id,
                        label: item.name,
                        leaf: true,
                      });
                    } else {
                      if (item.id === companyId) {
                        nodeData.push({
                          value: item.id,
                          label: item.name,
                          leaf: true,
                        });
                      }
                    }
                  });
                  resolve(nodeData);
                }
              } else {
                resolve([]);
              }
              break;
            default:
              break;
          }
        },
      },
      options: [],
    });
    let METHODS = reactive({
      handleChange: () => {
        emit('handleChange', DATA.options);
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
</style>