<template>
  <el-row>
    <el-col :span="24">
      <el-input
        class="search"
        v-model="searchContent"
        placeholder="请输入企业名查找"
        @input="handleFilter"
      ></el-input>
      <el-tree
        :data="threeList"
        :props="defaultProps"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        :filter-node-method="filterNode"
        highlight-current
        node-key="marking"
        :default-expanded-keys="[defaultIndex]"
        v-loading="loading"
        ref="tree"
        accordion
        v-if="isRestart"
      >
        <template #default="{ node }">
          <div
            @click="handleClick(node)"
            style="display: flex; height: 100%; line-height: 26px"
            class="text-ellipsis"
          >
            <p
              class="text-ellipsis"
              style="font-size: 12px"
              :title="node.label"
            >
              {{ node.label }}
            </p>
            <i
              v-show="
                (node.data.indexCode && node.level == 3) ||
                (node.level == 2 && node.data.isLeafAAA)
              "
              class="el-icon-video-camera"
            ></i>
          </div>
        </template>
      </el-tree>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { RES_SUCCESS } from "@/api/common/common";
import { encodeDevice } from "@/api/Haikang";
import {
  findByCompanyMonitorDevice,
  findAndTree,
} from "@/api/monitor/monitoringAids";
import { ElMessage } from "element-plus";
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import { useStore } from "vuex";
export default defineComponent({
  emits: ["handleNodeClick"],
  setup(props, { emit }) {
    const STORE = useStore();
    let tree: any = ref(null);
    let DATA: any = reactive({
      isRestart: true,
      filterWord: ["英德市", "英德", "市", "镇", "传感器", "监控"],
      defaultIndex: 1,
      searchContent: "",
      loading: false,
      threeList: [],
      threeListCopy: [],
      defaultProps: {
        children: "children",
        label: "label",
        isLeaf: "leaf",
      },
      isSomeData: [],
    });
    let METHODS = reactive({
      // 节点展开触发
      handleNodeExpand(obj: any, node: any) {
        if (node.level == 3) {
          METHODS.handleClick(node);
        }
      },
      handleClick: async (node: any) => {
        if (node.level == 3 && !DATA.isSomeData.includes(node.id)) {
          DATA.isSomeData.push(node.id);
          let parentName = node.parent.data.label;
          let id = node.data.id;
          let indexCode = node.data.indexCode;
          if (indexCode) {
            if (node.data.children?.length > 0 && node.data.children[0].marking)
              return;
            let res = await encodeDevice({
              regionIndexCode: indexCode,
            });
            if (res.data.code === "0") {
              let devices: any = [];
              if (res.data.data.list.length > 0) {
                res.data.data.list.forEach((item: any) => {
                  devices.push({
                    // marking: 4,
                    label: item.cameraName,
                    channelNo: item.channelNo,
                    cameraTypeName: item.cameraTypeName,
                    leaf: true,
                    cameraIndexCode: item.cameraIndexCode,
                  });
                });
                STORE.commit("setCodeDeviceList", {
                  data: devices,
                  isReset: false,
                });
                nextTick(() => {
                  DATA.loading = true;
                  DATA.threeList[0].children.forEach((item: any) => {
                    if (item.label == parentName) {
                      item.children.forEach((item2: any) => {
                        if (item2.id == id) {
                          item2.children = devices;
                        }
                      });
                    }
                  });
                  DATA.loading = false;
                });

                // DATA.defaultIndex = 4;
              } else {
                ElMessage({
                  message: "该企业暂无监控设备",
                  type: "warning",
                });
              }
            }
          } else {
            ElMessage({
              message: "该企业暂无监控设备",
              type: "warning",
            });
          }
        }
      },
      // 获取设备树数据
      handleAidsThreeData: async () => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType === 1) {
          let { data } = await findAndTree();
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.threeList = METHODS.filterThreeData([], data.data);
            DATA.threeListCopy = JSON.parse(JSON.stringify(DATA.threeList));
          }
        } else {
          let { data } = await findByCompanyMonitorDevice({
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
              indexCode: data.data.indexCode,
              marking: 3,
              children: [],
            };
            if (
              data.data.monitorDeviceList != null &&
              data.data.monitorDeviceList.length > 0
            ) {
              data.data.monitorDeviceList.forEach((item: any) => {
                Obj.children.push({
                  label: item.name,
                  id: item.id,
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
      handleNodeClick: (data: any) => {
        emit("handleNodeClick", data);
      },
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
          });

          if (item.companyList.length > 0) {
            // 镇添加企业
            Obj.children.forEach((val: any, ind: number) => {
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
                    indexCode: key.indexCode,
                    marking: 3,
                    children: key.indexCode ? [{ label: "" }] : [],
                    name: key.name,
                  });
                  if (key.indexCode) {
                    val.isLeafAAA = true;
                  }
                }

                if (
                  key.monitorDeviceList != null &&
                  key.monitorDeviceList.length > 0
                ) {
                  key.monitorDeviceList.forEach((b: any) => {
                    val.children.forEach((a: any) => {
                      if (b.companyInfoId === a.id) {
                        a.children.push({
                          id: b.id,
                          label: b.name,
                          marking: 4,
                          indexCode: b.indexCode,
                          legalPerson: key.legalPerson,
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
      filterNode: (value: any, data: any) => {
        // if (!value) return true;
        // return data.label.indexOf(value) !== -1;
      },
      handleFilter: () => {
        // tree.value.filter(DATA.searchContent);
        DATA.threeList = JSON.parse(JSON.stringify(DATA.threeListCopy));

        let value = DATA.searchContent.trim();
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
          DATA.isRestart = false;
          nextTick(() => {
            DATA.isRestart = true;
            DATA.defaultIndex = 1;
          });
        }
      },
      loadNode: async (node: any, resolve: any) => {
        if (node.level === 0) {
          resolve([{ label: "英德市", marking: 1, children: [] }]);
        }
        if (node.level === 1) {
          let list: any[] = [];
          node.data.children.forEach((item: any) => {
            if (
              item.children.length === 0 &&
              STORE.state.user.personnel.unitType === 1
            ) {
              item.leaf = true;
            }
            list.push(item);
          });
          resolve(list);
        }
        if (node.level === 2) {
          if (STORE.state.user.personnel.unitType === 1) {
            if (node.data.children.length > 0) {
              let list: any[] = [];
              node.data.children.forEach((item: any) => {
                list.push(item);
              });
              resolve(list);
            } else {
              resolve([]);
            }
          } else {
            if (node.data.indexCode) {
              let res = await encodeDevice({
                regionIndexCode: node.data.indexCode,
              });
              if (res.data.code === "0") {
                let devices: any = [];
                if (res.data.data.list.length > 0) {
                  res.data.data.list.forEach((item: any) => {
                    devices.push({
                      marking: 4,
                      label: item.cameraName,
                      channelNo: item.channelNo,
                      cameraTypeName: item.cameraTypeName,
                      leaf: true,
                      cameraIndexCode: item.cameraIndexCode,
                    });
                  });
                  STORE.commit("setCodeDeviceList", {
                    data: devices,
                    isReset: false,
                  });
                  resolve(devices);
                } else {
                  ElMessage({
                    message: "该企业暂无监控设备",
                    type: "warning",
                  });
                  resolve([]);
                }
              }
            } else {
              ElMessage({
                message: "该企业暂无监控设备",
                type: "warning",
              });
              resolve([]);
            }
          }
        }
        if (node.level === 3) {
          if (STORE.state.user.personnel.unitType === 1) {
            if (node.data.indexCode) {
              let res = await encodeDevice({
                regionIndexCode: node.data.indexCode,
              });
              if (res.data.code === "0") {
                let devices: any = [];
                if (res.data.data.list.length > 0) {
                  res.data.data.list.forEach((item: any) => {
                    devices.push({
                      marking: 4,
                      label: item.cameraName,
                      channelNo: item.channelNo,
                      cameraTypeName: item.cameraTypeName,
                      leaf: true,
                      cameraIndexCode: item.cameraIndexCode,
                    });
                  });
                  STORE.commit("setCodeDeviceList", {
                    data: devices,
                    isReset: false,
                  });
                  resolve(devices);
                } else {
                  ElMessage({
                    message: "该企业暂无监控设备",
                    type: "warning",
                  });
                  resolve([]);
                }
              }
            } else {
              ElMessage({
                message: "该企业暂无监控设备",
                type: "warning",
              });
              resolve([]);
            }
          } else {
            resolve([]);
          }
        }
        if (node.level === 4) {
          resolve([]);
        }
      },
    });
    onMounted(() => {
      METHODS.handleAidsThreeData();
      // 获取英德市的镇名
      let list = STORE.state.globalData.townList.map((item: any) => item.name);
      DATA.filterWord = Object.assign(list, DATA.filterWord);
    });
    onUnmounted(() => {
      STORE.commit("setCodeDeviceList", { data: [], isReset: true });
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      tree,
    };
  },
});
</script>
<style scoped lang="scss">
.text-ellipsis {
  max-width: 206px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.el-icon-video-camera {
  color: #508ffc;
  margin-left: 10px;
  line-height: 26px;
  // position: absolute;
  // right: 0;
}
</style>