<template>
  <el-row style="height: 100%" class="container">
    <el-col
      :span="4"
      style="padding-right: 10px; border-right: 1px solid #dcdfe6"
      class="tree"
    >
      <el-input
        v-model="searchContent"
        placeholder="请输入企业名查找"
        @input="handleFilter"
      ></el-input>
      <el-tree
        v-if="isRestart"
        :data="threeList"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        node-key="marking"
        :default-expanded-keys="[defaultIndex]"
        highlight-current
        v-loading="loading"
        ref="tree"
        accordion
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
              (node.data.indexCode && node.level == 3) ||
              (node.level == 2 && node.data.isLeafAAA)
            "
            class="el-icon-video-camera"
          ></i>
        </template>
      </el-tree>
    </el-col>
    <!-- 地图 -->
    <el-col :span="20" style="padding-left: 10px" v-if="isShowMap">
      <Amap
        class="amap"
        module="monitoringAids"
        AmapId="monitoringAids"
        :companyList="companyLists"
        :regionName="regionName"
        @handleClickMarker="handleClickMarker"
        :isShowSearch="true"
        placeholder="可搜索具体位置"
      />
    </el-col>
    <el-col
      v-if="!isShowMap"
      :span="16"
      style="
        padding-right: 10px;
        border-right: 1px solid #dcdfe6;
        padding-left: 10px;
      "
    >
      <el-card v-if="isSyncData === true" v-loading="syncLoading">
        <h3 class="mb-10">同步海康平台数据</h3>
        <el-form
          ref="syncForm"
          :model="syncFormData"
          label-width="80px"
          :rules="syncRules"
          class="mt-10"
        >
          <el-form-item label="根区域">
            <el-select v-model="syncFormData.rootZone" clearable>
              <el-option
                v-for="item in rootZoneList"
                :key="item.indexCode"
                :label="item.name"
                :value="item.indexCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="下级区域">
            <el-select
              v-model="syncFormData.lowerArea"
              @change="handleChangeLowerArea(syncFormData.lowerArea)"
              clearable
            >
              <el-option
                v-for="item in lowerAreaList"
                :key="item.indexCode"
                :label="item.name"
                :value="item.indexCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域企业" prop="areaCompany">
            <el-select v-model="syncFormData.areaCompany" clearable>
              <el-option
                v-for="item in areaCompanyList"
                :key="item.value"
                :label="item.name"
                :value="item.indexCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: right">
            <el-button
              :disabled="syncFormData.areaCompany ? false : true"
              type="primary"
              @click="handleSyncData"
              v-if="showBtnList.includes('create')"
              >同步</el-button
            >
          </el-form-item>
        </el-form>
      </el-card>
      <el-card v-if="isSyncData === false">
        <template #header>
          <div class="card-header d_flex d_flex_sb">
            <el-button
              class="button"
              type="text"
              @click="setSyncHronizing"
              v-if="showBtnList.includes('edit')"
              >修改同步信息</el-button
            >
            <el-button
              class="button"
              style="color: #d46c6b"
              type="text"
              @click="unsynchronizing"
              v-if="showBtnList.includes('delete')"
              >取消同步信息</el-button
            >
          </div>
        </template>
        <el-empty
          description="企业已同步"
          :image-size="255"
          :image="require('@/assets/image/u8764.svg')"
        ></el-empty>
      </el-card>
    </el-col>
    <el-col :span="4" style="padding-left: 10px" v-if="!isShowMap">
      <el-descriptions
        class="margin-top"
        title="企业信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(companyInfo) !== '{}'"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>企业名称</h4>
          </template>
          {{ companyInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>法人代表</h4>
          </template>
          {{ companyInfo.legalPerson }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <h4>法人代表联系方式</h4>
          </template>
          {{ companyInfo.legalPhone }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>地址</h4>
          </template>
          {{ companyInfo.address }}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import {
  cascadeRegion,
  findAllAlreadySync,
  findAndTree,
  findByCompanyMonitorDevice,
  findOneMonitorDevice,
  findRegionInfo,
  synchronization,
} from "@/api/monitor/monitoringAids";
import EleForm from "@/components/eleForm/index.vue";
import { RES_SUCCESS } from "@/api/common/common";
import { verifyIp, verifyPort } from "@/api/common/verify";
import Amap from "@/components/amap/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { EleForm, Amap },
  setup(props) {
    var validateAreaCompany = (rule: any, value: any, callback: any) => {
      DATA.syncCompanyList.includes(value)
        ? callback(new Error("该企业已同步"))
        : callback();
    };
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let tree: any = ref(null);
    let syncForm: any = ref(null);
    let DATA: any = reactive({
      defaultIndex: 1,
      isRestart: true,
      // 地区名
      regionName: '',
      isShowMap: true,
      threeListCopy: [],
      filterWord: ["英德市", "英德", "市", "镇", "传感器", "监控"],
      companyLists: [], //传给地图的数据
      searchContent: "",
      loading: false,
      syncLoading: false,
      threeList: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      // isshow: false,
      companyInfo: {},
      // isCreateAids: false,
      // isdelete: false,
      // isCreate: false,
      // 设备表单
      formData: {
        name: "",
        monitorNode: "",
        ip: "",
        port: "",
        devicePort: "",
        rtsp: "",
      },
      renderFormArr: [
        {
          label: "设备名称",
          type: "input",
          prop: "name",
          clearable: true,
          style: {
            width: "45%",
          },
        },
        {
          label: "监控节点",
          type: "input",
          prop: "monitorNode",
          clearable: true,
          style: {
            width: "45%",
          },
        },
        {
          label: "IP地址",
          type: "input",
          prop: "ip",
          clearable: true,
          style: {
            width: "45%",
          },
        },
        {
          label: "端口号",
          type: "input",
          prop: "port",
          clearable: true,
          style: {
            width: "45%",
          },
        },
        {
          label: "设备端口",
          type: "input",
          prop: "devicePort",
          clearable: true,
          style: {
            width: "45%",
          },
        },
        {
          label: "RTSP",
          type: "input",
          prop: "rtsp",
          clearable: true,
          style: {
            width: "45%",
          },
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
        monitorNode: [
          { required: true, message: "请输入监控节点", trigger: "blur" },
        ],
        ip: [
          { required: true, message: "请输入ip地址", trigger: "blur" },
          {
            pattern: verifyIp,
            message: "ip格式不正确",
          },
        ],
        port: [
          { required: true, message: "请输入端口号", trigger: "blur" },
          {
            pattern: verifyPort,
            message: "端口为1~65535数字",
          },
        ],
        devicePort: [
          { required: true, message: "请输入设备端口", trigger: "blur" },
          {
            pattern: verifyPort,
            message: "端口为1~65535数字",
          },
        ],
        rtsp: [{ required: true, message: "请输入rtsp", trigger: "blur" }],
      },
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      syncFormData: {
        rootZone: "root000000",
        lowerArea: "",
        areaCompany: "",
      },
      rootZoneList: [
        {
          name: "根区域",
          indexCode: "root000000",
        },
      ],
      lowerAreaList: [],
      areaCompanyList: [],
      isSyncData: null,
      syncCompanyList: [],
      syncRules: {
        areaCompany: [{ validator: validateAreaCompany, trigger: "change" }],
      },
    });
    let METHODS = reactive({
      handleClickMarker: async (item: any) => {
        DATA.isShowMap = false;
        if (DATA.companyInfo.id != item.id) {
          // DATA.lowerAreaList = [];
          // DATA.areaCompanyList = [];
          DATA.syncFormData = Object.assign(
            {},
            {
              rootZone: "root000000",
              lowerArea: "",
              areaCompany: item.indexCode || "",
            }
          );
        }
        DATA.companyInfo = Object.assign({}, item);
        if (item.indexCode === null || item.indexCode === "") {
          DATA.isSyncData = true;
        } else {
          DATA.isSyncData = false;
        }
      },
      // 获取树的数据给到地图
      getTreeToAmap(data: any) {
        DATA.companyLists = [];
        data.data.forEach((item: any) => {
          item.companyList.forEach((val: any) => {
            DATA.companyLists.push(val);
          });
        });
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

            METHODS.getTreeToAmap(data);
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
              // deviceList: data.data.deviceList,
              indexCode: data.data.indexCode,
              // monitorDeviceList: data.data.monitorDeviceList,
              name: data.data.name,
              marking: 3,
              children: [],
            };
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
      // 获取已同步企业
      handleSyncCompany: async () => {
        let { data } = await findAllAlreadySync();
        if (data.code === RES_SUCCESS) {
          DATA.syncCompanyList = data.data;
        }
      },
      // 获取设备数据
      handleGetAidsData: async (id: number) => {
        let { data } = await findOneMonitorDevice({ id });
        if (data.code === RES_SUCCESS) {
          DATA.formData = data.data;
        }
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
                    indexCode: key.indexCode,
                    monitorDeviceList: key.monitorDeviceList,
                    marking: 3,
                    children: [],
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
      handleNodeClick: async (data: any) => {
        switch (data.marking) {
          case 1:
            DATA.companyInfo = {};
            DATA.isSyncData = null;
            DATA.regionName = data.label;
            DATA.isShowMap = true
            break;
          case 2:
            DATA.companyInfo = {};
            DATA.isSyncData = null;
            DATA.regionName = data.label;
            DATA.isShowMap = true
            break;
          case 3:
            DATA.isShowMap = false;
            if (DATA.companyInfo.id != data.id) {
              // DATA.lowerAreaList = [];
              // DATA.areaCompanyList = [];
              DATA.syncFormData = Object.assign(
                {},
                {
                  rootZone: "root000000",
                  lowerArea: "",
                  areaCompany: data.indexCode || "",
                }
              );
            }
            DATA.companyInfo = Object.assign({}, data);
            if (data.indexCode === null || data.indexCode === "") {
              DATA.isSyncData = true;
            } else {
              DATA.isSyncData = false;
            }
            break;
          case 4:
            DATA.companyInfo = Object.assign({}, data);
            await METHODS.handleGetAidsData(data.id);
            proxy.$refs["formRef"].clearForm();
            break;
          default:
            break;
        }
      },
      // 切换根区域
      handleChangeRootZone: async () => {
        DATA.lowerAreaList = [];
        DATA.areaCompanyList = [];
        DATA.syncFormData.lowerArea = "";
        DATA.syncFormData.areaCompany = "";
        if (DATA.syncFormData.rootZone) {
          let { data } = await cascadeRegion({
            indexCode: DATA.syncFormData.rootZone,
          });
          if (data.code === "0") {
            DATA.lowerAreaList = data.data.list;
          }
        }
      },
      handleChangeLowerArea: async (
        lowerArea: string,
        areaCompany: string = ""
      ) => {
        DATA.areaCompanyList = [];
        if (lowerArea) {
          let { data } = await cascadeRegion({
            indexCode: lowerArea,
          });
          if (data.code === "0") {
            DATA.areaCompanyList = data.data.list;
          }
        }
        DATA.syncFormData.areaCompany = areaCompany;
      },
      // 回显下级 区域
      regionDetails: async (regionIndexCode: string) => {
        DATA.syncLoading = true;
        let { data } = await findRegionInfo({ regionIndexCode });
        if (data.code === "0") {
          DATA.syncFormData.lowerArea = data.data.list[0].parentIndexCode;
          await METHODS.handleChangeLowerArea(
            data.data.list[0].parentIndexCode,
            data.data.list[0].indexCode
          );
        }
        DATA.syncLoading = false;
      },
      // 同步
      handleSyncData: () => {
        syncForm.value.validate(async (valid: boolean) => {
          if (valid) {
            let { data } = await synchronization({
              indexCode: DATA.syncFormData.areaCompany,
              companyId: DATA.companyInfo.id,
            });
            if (data.code === RES_SUCCESS) {
              ElMessage({
                message: "同步成功",
                type: "success",
              });
              DATA.companyInfo = {};
              DATA.isSyncData = null;
              METHODS.handleAidsThreeData();
              METHODS.handleSyncCompany();
            }
          }
        });
      },
      // 修改同步
      setSyncHronizing: () => {
        DATA.isSyncData = !DATA.isSyncData;
        METHODS.regionDetails(DATA.syncFormData.areaCompany);
      },
      // 取消同步
      unsynchronizing: () => {
        ElMessageBox.confirm("是否取消该企业同步信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { data } = await synchronization({
              indexCode: null,
              companyId: DATA.companyInfo.id,
            });
            if (data.code === RES_SUCCESS) {
              ElMessage({
                message: "取消同步成功",
                type: "success",
              });
              DATA.companyInfo = {};
              DATA.isSyncData = null;
              METHODS.handleAidsThreeData();
              METHODS.handleSyncCompany();
            }
          })
          .catch(() => {});
      },
      filterNode: (value: any, data: any) => {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
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
          if (DATA.threeList) {
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
      METHODS.handleAidsThreeData();
      METHODS.handleSyncCompany();
      METHODS.handleChangeRootZone();
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }

      // 获取英德市的镇名
      let list = STORE.state.globalData.townList.map((item: any) => {
        return item.name;
      });
      DATA.filterWord = Object.assign(list, DATA.filterWord);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      tree,
      syncForm,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}
.baseInfo {
  border-left: 5px solid #666666;
  padding-left: 5px;
}

.el-icon-video-camera{
  color: #508ffc;
  margin-left: 5px;
  // position: absolute;
  // right: 0;
}

.amap {
  width: 100%;
  height: calc(100vh - 170px);
}
</style>