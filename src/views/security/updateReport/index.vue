<template>
  <!-- 整改上报管理页面 -->
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <!-- 显示列表 -->
        <el-col :span="24" class="d_flex d_flex_sb">
          <div class="list mb-10">
            <ul class="d_flex">
              <li
                v-for="(item, index) in pageList"
                :key="index"
                :class="{ active: currentIndex == index }"
                @click="handleClickList(item.value, index)"
              >
                {{ item.title }}
              </li>
              <div class="line"></div>
            </ul>
            <div
              class="create"
              @click="handleCreate"
              v-if="showBtnList.includes('create')"
            >
              <i class="el-icon-circle-plus-outline mr-5"></i>添加整改上报
            </div>
          </div>
        </el-col>

        <!-- 搜索 -->
        <el-col :span="24" class="d_flex d_flex_sb mb-10 mt-10">
          <div></div>
          <div>
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
          <QuickPosition @handleClickTwon="handleClickTwon" />

          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :iconList="currentIndex == 0 ? iconList : iconList2"
            :isborder="true"
            @handleBtnEvent="handleBtnEvent"
          ></ele-table>

          <div class="mt-10">
            <span
              class="iconfont mr-20"
              v-for="(val, i) of currentIndex == 0 ? iconLists : iconLists2"
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
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import { getByGovPage } from "@/api/ent/noncoalmine";
import {
  getRectificationReportPage,
  updateRectificationReportStatus,
  deleteRectificationReport,
} from "@/api//security/updateReport";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { filterTime, formatDate } from "@/utils/filtration";
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
      // 显示列表
      pageList: [
        { title: "未完成整改", value: false },
        { title: "已完成整改", value: true },
      ],
      currentIndex: 0, //当前索引
      pagingParams: {
        content: "",
        limit: 10,
        page: 1,
        isRectification: false,
        townCode: "",
        companyId: undefined,
      },
      pagingParamsCopy: {
        content: "",
        limit: 10,
        page: 1,
        isRectification: false,
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
          label: "存在隐患数",
          type: "text",
          prop: "hiddenDangerExists",
        },
        {
          label: "已消除隐患数",
          type: "text",
          prop: "hiddenDangerElimination",
        },
        {
          label: "是否存在重大隐患",
          type: "text",
          prop: "isMajorHiddenDanger",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            if (row.isMajorHiddenDanger) {
              return "是";
            } else {
              return "否";
            }
          },
        },
        {
          label: "执法人员",
          type: "text",
          prop: "personnelNames",
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
          label: "整改到期时间",
          type: "text",
          prop: "expireTime",
          formatter: (row: any) => {
            return formatDate(row.expireTime);
          },
        },
        {
          label: "操作",
          type: "iconHandle",
          width: 300,
        },
      ],
      iconList: [],
      iconLists: [],
      iconList2: [],
      iconLists2: [],
      total: 0,
      townList: [],
    });
    let METHODS = reactive({
      // 点击菜单列表
      handleClickList: (value: any, index: Number) => {
        DATA.currentIndex = index;
        DATA.pagingParams.page = 1;
        DATA.pagingParams.isRectification = value;
        DATA.pagingParams.content = "";

        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.isRectification = value;
        DATA.pagingParamsCopy.content = "";

        METHODS.handleGetPagingData(DATA.pagingParams); //刷新数据
      },

      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        if (!pagingParams.townCode) {
          pagingParams.townCode = undefined;
        }
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }

        DATA.loading = true;
        let { data } = await getRectificationReportPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
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
        await STORE.commit("setUpdateReportInfo", {
          companyId: null,
          personnel: "",
          hiddenDangerExists: null,
          hiddenDangerElimination: null,
          checkTime: null,
          expireTime: undefined,
          isMajorHiddenDanger: false,
          isRectification: false,
          describe: "",
          fileIds: "",
          files: [],
        });
        ROUTER.push({
          name: "updateReportInfo",
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
                  title: ROUTE.meta.title,
                },
              });
            } else {
              await STORE.commit("setTwoTitle", "非煤矿山企业管理");
              ROUTER.push({
                name: "companyDetails",
                params: {
                  title: ROUTE.meta.title,
                },
              });
            }
            break;
          case "check2":
            await STORE.commit("setUpdateReportInfo", row);
            ROUTER.push({
              name: "updateReportDetails",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case "edit":
            await STORE.commit("setUpdateReportInfo", row);
            ROUTER.push({
              name: "updateReportInfo",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case "update":
            proxy
              .$confirm("是否已完成整改?", "修改整改状态", {
                confirmButtonText: "是",
                cancelButtonText: "否",
              })
              .then(async () => {
                let { data } = await updateRectificationReportStatus({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "修改成功",
                    type: "success",
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy); //刷新数据
                }
              })
              .catch(() => {});
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该整改上报?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteRectificationReport({ id: row.id });
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
      //获取分页数据
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
          text: "查看企业详情信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          handleType: "check2",
          color: "#3fb41b",
          text: "查看整改记录",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          handleType: "edit",
          color: "#1296db",
          text: "编辑整改记录",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-wancheng",
          handleType: "update",
          color: "#3fb41b",
          text: "修改整改状态",
          isShow: showBtnList.value.includes("update"),
        },
        {
          icon: "icon-cha",
          handleType: "delete",
          text: "删除整改记录",
          color: "#ff5454",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
      DATA.iconLists = [
        {
          icon: "icon-chakan",
          color: "#a686ba",
          text: "查看企业详情信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          color: "#3fb41b",
          text: "查看整改记录",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          handleType: "edit",
          color: "#1296db",
          text: "编辑整改记录",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-wancheng",
          color: "#3fb41b",
          text: "修改整改状态",
          isShow: showBtnList.value.includes("update"),
        },
        {
          icon: "icon-cha",
          text: "删除整改记录",
          color: "#ff5454",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
      DATA.iconList2 = [
        {
          icon: "icon-chakan",
          handleType: "check1",
          color: "#a686ba",
          text: "查看企业详情信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          handleType: "check2",
          color: "#3fb41b",
          text: "查看整改记录",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          handleType: "edit",
          color: "#1296db",
          text: "编辑整改记录",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-cha",
          handleType: "delete",
          text: "删除整改记录",
          color: "#ff5454",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
      DATA.iconLists2 = [
        {
          icon: "icon-chakan",
          color: "#a686ba",
          text: "查看企业详情信息",
          isShow: true,
        },
        {
          icon: "icon-chakan2",
          color: "#3fb41b",
          text: "查看整改记录",
          isShow: true,
        },
        {
          icon: "icon-bianji",
          handleType: "edit",
          color: "#1296db",
          text: "编辑整改记录",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          icon: "icon-cha",
          text: "删除整改记录",
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
  font-size: 32px;
}
.icon-chakan2::before {
  font-size: 20px;
}
/deep/.icon-wancheng {
  font-size: 26px;
}
.icon-wancheng::before {
  font-size: 18px;
}
</style>
