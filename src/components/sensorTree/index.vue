<template>
  <el-tree
    :data="threeList"
    @node-click="handleNodeClick"
    :filter-node-method="filterNode"
    highlight-current
    node-key="marking"
    :default-expanded-keys="[defaultIndex]"
    ref="tree"
    accordion
    v-loading="loading"
    :props="defaultProps"
    v-if="isRestart"
  >
    <template #default="{ node }">
      <p
        class="text-ellipsis"
        style="font-size: 12px"
        :title="node.label"
      >
        {{ node.label }}
      </p>
      <i
        v-show="
          (!node.isLeaf && node.level == 3) ||
          (node.level === 2 && node.data.isLeafAAA)
        "
        class="el-icon-odometer"
      ></i>
    </template>
  </el-tree>
</template>
<script lang="ts">
import { RES_SUCCESS } from "@/api/common/common";
import { findAndTree, findByCompanySensorDevice } from "@/api/monitor/device";
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  emits: ["handleCompanyInfo", "getTreeToAmap", "isFilterFn"],
  props: {
    isFilter: {
      type: Boolean,
      default: false,
    },
    searchContent: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const STORE = useStore();
    let tree: any = ref(null);
    let DATA: any = reactive({
      isRestart: true,
      defaultIndex: 1,
      threeList: [],
      threeListCopy: [],
      filterWord: ["英德市", "英德", "市", "镇", "传感器", "监控"],
      loading: false,
      defaultProps: {
        children: "children",
        label: "label",
        class: "linaaa",
      },
      filterData: null,
    });
    let METHODS = reactive({
      // 格式化数据
      filterThreeData: (list: Array<any>, data: Array<any>) => {
        let Obj: any = {
          label: "英德市",
          marking: 1,
          children: [],
        };
        data.forEach((item, index) => {
          Obj.children.push({
            label: item.townName,
            marking: 2,
            children: [],
            // isLeafAAA:""
          });

          // 镇里面是否有企业
          if (item.companyList.length > 0) {
            Obj.children.forEach((val: any, ind: number, self: any) => {
              item.companyList.forEach((key: any) => {
                if (index === ind) {
                  val.children.push({
                    label: key.name,
                    id: key.id,
                    legalPerson: key.legalPerson,
                    legalPhone: key.legalPhone,
                    address: key.address,
                    deviceList: key.deviceList,
                    monitorDeviceList: key.monitorDeviceList,
                    name: key.name,
                    marking: 3,
                    children: [],
                  });
                }

                // 企业是否有设备
                if (key.deviceList.length > 0) {
                  val.children.forEach((a: any) => {
                    key.deviceList.forEach((b: any) => {
                      if (b.companyInfoId === a.id) {
                        val["isLeafAAA"] = true;
                        a.children.push({
                          id: b.id,
                          label: b.name,
                          marking: 4,
                          legalPerson: key.legalPerson,
                          companyInfoId: b.companyInfoId,
                          legalPhone: key.legalPhone,
                          address: key.address,
                          name: key.name,
                        });
                      }
                    });
                  });
                }
              });
            });
          }
        });
        list.push(Obj);
        return list;
      },
      handleNodeClick: (data: any,node:any) => {
        if (data.marking == 2) {
          data.children.forEach((item: any) => {
            if (item?.deviceList.length > 0) {
              item.isLeaf = true; //做标识:有无关联监控设备
            }
          });
        }
        
        emit("handleCompanyInfo", data,node);
      },
      filterNode: (value: any, data: any) => {
        // if (!value) return true;


        // if (data.label.indexOf(value) !== -1) {
        //   DATA.filterData = data;
        //   return true;
        // }

        // if (DATA.filterData !== null) {
        //   if (DATA.filterData.children?.length > 0) {
        //     return DATA.filterData.children.some((item: any) => {
        //       return item.id === data.id;
        //     });
        //   }
        // }
      },
      filterText(val: any) {
        DATA.filterData = null;
        tree.value.filter(val);
      },

      handleGetThree: async () => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType === 1) {
          let { data } = await findAndTree();
          if (data.code === RES_SUCCESS) {
            DATA.threeList = METHODS.filterThreeData([], data.data);
            
            DATA.threeListCopy = JSON.parse(JSON.stringify(DATA.threeList));

            emit("getTreeToAmap", data);
            DATA.loading = false;
          }
        } else {
          let { data } = await findByCompanySensorDevice({
            companyInfoId: STORE.state.user.personnel.companyId,
          });
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            let Obj: any = {
              id: data.data.id,
              label: data.data.name,
              legalPerson: data.data.legalPerson,
              legalPhone: data.data.legalPhone,
              address: data.data.address,
              deviceList: data.data.deviceList,
              monitorDeviceList: data.data.monitorDeviceList,
              name: data.data.name,
              marking: 3,
              children: [],
            };
            if (
              data.data.deviceList != null &&
              data.data.deviceList.length > 0
            ) {
              data.data.deviceList.forEach((item: any) => {
                Obj.children.push({
                  label: item.name,
                  id: item.id,
                  companyInfoId: item.companyInfoId,
                  legalPerson: data.data.legalPerson,
                  legalPhone: data.data.legalPhone,
                  address: data.data.address,
                  name: data.data.name,
                  marking: 4,
                });
              });
            }
            Obj = {
              label: "英德市",
              marking: 1,
              children: [Obj],
            };
            DATA.threeList = [Obj];
            DATA.threeListCopy = JSON.parse(JSON.stringify([Obj]));
          }
        }
      },
      // tree的过滤
      isFilterFn() {
        DATA.threeList = JSON.parse(JSON.stringify(DATA.threeListCopy));
        let value = props.searchContent.trim();
        if (value) {
          let list = JSON.parse(JSON.stringify(DATA.threeList));
          // 过滤敏感字眼
          for (const item of DATA.filterWord) {
            if (item.indexOf(value) >= 0) {
              DATA.threeList = [];
              return;
            }
          }
          if (DATA.threeList[0]?.children.length > 0) {
            // 遍历镇
            DATA.threeList[0].children.forEach((item: any, index1: number) => {
              item.children.forEach((val: any, index2: number) => {
                if (!val.label.includes(value)) {
                  list[0].children[index1].children.forEach(
                    (iitem: any, ind: any) => {
                      if (iitem.label == val.label) {
                        list[0].children[index1].children.splice(ind, 1);
                      }
                    }
                  );
                }
              });
            });
            let list2: any = [{ children: [], label: "英德市", marking: 1 }];
            list[0].children.forEach((item: any, index: any) => {
              if (item.children.length > 0) {
                list2[0].children.push(item);
              }
            });
            DATA.threeList = list2;
            if (!(DATA.threeList[0].children?.length > 0)) {
              DATA.threeList = [];
            }
            DATA.defaultIndex = 2;
          }
        } else {
          // DATA.threeList = JSON.parse(JSON.stringify(DATA.threeListCopy));
          DATA.defaultIndex = 1;
        }
        // 重新渲染tree
        DATA.isRestart = false;
        setTimeout(() => {
          DATA.isRestart = true;
        }, 100);
      },
    });
    onMounted(() => {
      METHODS.handleGetThree();
      // 获取英德市的镇名
      let list = STORE.state.globalData.townList.map((item: any) => {
        return item.name;
      });
      DATA.filterWord = Object.assign(list, DATA.filterWord);
    });

    // 监听tree是否数据过滤
    watch(
      () => props.isFilter,
      (newValue) => {
        METHODS.isFilterFn();
      }
    );
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      tree,
    };
  },
});
</script>
<style scoped lang="scss">
.el-icon-odometer {
  color: #508ffc ;
  margin-left: 5px;
  // position: absolute;
  // right: 0;
}
</style>