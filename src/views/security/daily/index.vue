<template>
  <!-- 日常监督检查页面 -->
  <el-row  class="container">
    <el-col :span="24">
      <el-row>
        <!-- 添加/搜索 -->
        <el-col
          :span="24"
          class="d_flex mb-10"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="showBtnList.includes('create')"
            ><i class="el-icon-circle-plus-outline mr-5"></i>添加日常监督
          </el-button>
          <div>
            <el-select
              v-model="pagingParams.checkType"
              placeholder="请选择监督检查类型"
              class="mr-10"
              clearable
            >
              <el-option
                v-for="(item, index) in checkTypeList"
                :key="index"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请输入企业名称"
              v-model="pagingParams.content"
              style="width: 300px"
              class="mr-10"
              clearable
            ></el-input>
            <el-button type="primary" @click="handleSearch"
              ><i class="el-icon-search mr-5"></i>搜索</el-button
            >
          </div>
        </el-col>

        <!-- 快速定位 表格显示  分页 -->
        <el-col :span="24" class="mt-10" v-loading="loading">
          <QuickPosition @handleClickTwon="handleClickTwon" class="mb-20" />

          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :iconList="iconList"
            :isborder="true"
            @handleBtnEvent="handleBtnEvent"
          >
            <template #personnelNames="scope">
              {{ scope.row.personnelNames }}
              <span v-if="scope.row.personnelNames && scope.row.otherPersonnel"
                >,</span
              >
              <span>{{ scope.row.otherPersonnel }}</span>
            </template>
          </ele-table>

          <div class="mt-10">
            <span
              class="iconfont mr-20"
              v-for="(val, i) of iconLists"
              :key="i"
              :class="val.icon"
              :style="{ color: val.color }"
              style="font-size: 14px"
              v-show="val.isShow"
            >
              <i style="color: #cccccc"> {{ val.text }}</i>
            </span>
          </div>
          <!-- 分页 -->
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleCurrentChange="
              (val) =>
                handleCurrentChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handleGetPagingData
                )
            "
            @handleSizeChange="
              (val) =>
                handleSizeChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handleGetPagingData,
                  total
                )
            "
          ></ele-pagination>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import QuickPosition from "@/components/quickPosition/index.vue";
import {
  currentChange,
  RES_SUCCESS,
  sizeChange,
  getByKey,
} from "@/api/common/common";
import { filterTime, formatDate } from "@/utils/filtration";
import {
  getDailySupervisionPage,
  deleteDailySupervision,
} from "@/api/security/daily";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    QuickPosition,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      pagingParams: {
        limit: 10,
        page: 1,
        content: "",
        checkType: "",
        townCode: "",
        companyId: undefined,
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: "",
        checkType: "",
        townCode: "",
        companyId: undefined,
      },
      //表格
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: "行政区域",
          type: "text",
          prop: "townName",
        },
        {
          label: "企业名称",
          type: "text",
          prop: "companyName",
          width: 350,
        },
        {
          label: "监督检查类型",
          type: "text",
          prop: "checkType",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            for (const item of DATA.checkTypeList) {
              if (row.checkType == item.value) {
                return item.name;
              }
            }
          },
        },
        {
          label: "执行人员",
          prop: "personnelNames",
          type: "slot",
          slotName: "personnelNames",
        },
        {
          label: "巡检时间",
          type: "text",
          prop: "checkTime",
          formatter: (row: any) => {
            return formatDate(row.checkTime);
          },
        },
        {
          label: "备注",
          type: "text",
          prop: "remark",
        },
        {
          label: "操作",
          type: "iconHandle",
          width: 300,
        },
      ],
      iconList: [],
      iconLists: [],
      checkTypeList: [],
      total: 0,
      townList: [],
    });
    let METHODS = reactive({
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }

        let { data } = await getDailySupervisionPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
          DATA.loading = false;
        }
      },
      // 点击搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },

      // 点击快速定位
      handleClickTwon: (code: number) => {
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.content = DATA.pagingParams.content;
        DATA.pagingParams.townCode = code;
        DATA.pagingParamsCopy.townCode = code;
        METHODS.handleGetPagingData({
          ...DATA.pagingParamsCopy,
          townCode: code,
        });
      },

      // 点击添加
      handleCreate: async () => {
        await STORE.commit("setDailyInfo", {
          id: "",
          companyId: null,
          checkType: null,
          personnel: undefined,
          otherPersonnel: null,
          expert: null,
          hiddenDanger: null,
          checkTime: null,
          remark: null,
          basicDescribe: null,
          fileIds: "",
          files: null,
          isMajorHiddenDanger: false,
          isLawEnforcement: true,
        });
        ROUTER.push({
          name: "dailyInfo",
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
      },
      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "check1":
            await STORE.commit("setCompanyInfo", {
              type: row.companyType,
              companyId: row.companyId,
            });
            await STORE.commit("setTitle", "企业档案管理");
            if (row.companyType == 4) {
              await STORE.commit("setTwoTitle", "工贸行业管理");
              ROUTER.push({
                name: "tradeDetails",
                params: {
                  // title: ROUTE.meta.title,
                },
              });
            } else {
              await STORE.commit("setTwoTitle", "非煤矿山企业管理");
              ROUTER.push({
                name: "companyDetails",
                params: {
                  // title: ROUTE.meta.title,
                },
              });
            }
            break;
          case "check2":
            await STORE.commit("setDailyInfo", row);
            ROUTER.push({
              name: "dailyDetails",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case "edit":
            await STORE.commit("setDailyInfo", row);
            ROUTER.push({
              name: "dailyInfo",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });

            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该日常监督?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteDailySupervision({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "删除成功",
                    type: "success",
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      // 获取 监督检查类型
      handleCheckType: async () => {
        let { data } = await getByKey({
          key: "t_supervision_and_inspection_type",
        });
        if (data.code === RES_SUCCESS) {
          DATA.checkTypeList = data.data;
        }
      },

      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handleGetPagingData);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handleGetPagingData,
          total
        );
      },
    });
    onMounted(() => {
      // 获取 监督检查类型
      METHODS.handleCheckType();

      METHODS.handleGetPagingData(DATA.pagingParams);
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.iconList = [
        {
          icon: "icon-chakan",
          handleType: "check1",
          color: "#a686ba",
          text: "查看企业详细信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          handleType: "check2",
          color: "#3fb41b",
          text: "查看日常监督检查",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          handleType: "edit",
          color: "#1296db",
          text: "编辑日常监督检查",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-cha",
          handleType: "delete",
          text: "删除日常监督检查",
          color: "#ff5454",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
      DATA.iconLists = [
        {
          icon: "icon-chakan",
          color: "#a686ba",
          text: "查看企业详细信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          color: "#3fb41b",
          text: "查看日常监督检查",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          color: "#1296db",
          text: "编辑日常监督检查",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-cha",
          text: "删除日常监督检查",
          color: "#ff5454",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
.list {
  position: relative;
  width: 100%;
  font-size: 14px;
  ul {
    li {
      padding-bottom: 10px;
      margin-right: 30px;

      width: 84px;
      text-align: center;
      &:hover {
        cursor: pointer;
      }
      &:nth-child(5) {
        margin-right: 0;
      }
    }
    .active {
      //   padding-bottom: 5px;
      color: #409eff;
      border-bottom: 2px solid #409eff;
      z-index: 99;
    }
  }
  .line {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    border-bottom: 2px solid #e0e0e0;
  }
  .create {
    position: absolute;
    right: 0;
    top: 0;
    color: #40a9ff;
    &:hover {
      cursor: pointer;
    }
  }
}

/deep/.icon-chakan2 {
  font-size: 30px;
}
.icon-chakan2::before {
  font-size: 20px;
}
</style>
