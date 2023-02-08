<template>
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <el-col
          :span="24"
          class="d_flex top"
          style="padding-bottom: 10px"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            @click="handleCreate"
            type="primary"
            v-if="showBtnList.includes('create')"
          >
            <i class="el-icon-circle-plus-outline mr-5"></i>
            <span>添加监管信息</span>
          </el-button>

          <div class="d_flex top_search">
            <el-date-picker
              v-model="date"
              type="year"
              placeholder="选择年"
              :disabled-date="disabledDate"
              @change="(val) => handleChangeYear(val, 'search')"
              class="mr-10"
            >
            </el-date-picker>
            <el-input
              placeholder="请输入标题名称"
              v-model="pagingParams.content"
              clearable
              class="mr-10"
            ></el-input>
            <el-button type="primary" @click="handleSearch">
              <span>搜索</span>
            </el-button>
          </div>
        </el-col>
        <el-col
          :span="24"
          v-loading="loading"
        >
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleBtnEvent"
            class="mb-10"
          ></ele-table>
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleCurrentChange="
              (val) =>
                handleCurrentChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingSupervise
                )
            "
            @handleSizeChange="
              (val) =>
                handleSizeChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingSupervise,
                  total
                )
            "
          ></ele-pagination>
        </el-col>
        <el-col :span="24">
          <!-- 附件模态框 -->
          <el-dialog title="附件" v-model="dialogVisible" width="40%">
            <!-- 附件 -->
            <div class="mb-20 file">
              <ele-table
                :tableData="fileTableData"
                :renderTable="fileRanderTable"
                :isborder="true"
                :iconList="iconList"
                @handleBtnEvent="handleFileBtnEvent"
                class="mb-20"
              ></ele-table>
              <!-- 视频 -->
              <ele-table
                :tableData="videoTableData"
                :renderTable="videoRanderTable"
                :isborder="true"
                :iconList="iconList"
                @handleBtnEvent="handleVideoBtnEvent"
              ></ele-table>
            </div>
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { findByPageDepartSupervision } from "@/api/dep/supervision";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime } from "@/utils/filtration";
import { useRoute, useRouter } from "vue-router";
import { deleteDepartSupervision } from "@/api/dep/supervision";
import { useStore } from "vuex";
export default defineComponent({
  components: { EleTable, ElePagination, EleForm },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      date: "",
      pagingParams: {
        content: "",
        yearly: null,
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: "",
        yearly: null,
        limit: 10,
        page: 1,
      },
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
          label: "名称",
          prop: "name",
          type: "text",
        },
        {
          label: "类型",
          type: "text",
          prop: "typeName",
        },
        {
          label: "行业",
          type: "text",
          prop: "companyName",
        },
        {
          label: "时间",
          type: "text",
          prop: "checkTime",
          formatter: (row: any) => {
            return filterTime(row.checkTime);
          },
        },
        {
          label: "组织人",
          type: "text",
          prop: "organizer",
        },
        {
          label: "参加人",
          type: "text",
          prop: "participant",
        },
        {
          label: "内容概要",
          type: "text",
          prop: "summary",
        },
        {
          label: "附件数量",
          type: "text",
          prop: "summary",
          formatter: (row: any) => {
            let files = row.files != null ? row.files.length : 0;
            let videos = row.videos != null ? row.videos.length : 0;
            return files + videos;
          },
        },
        {
          label: "操作",
          type: "handle",
          width: 300,
        },
      ],
      btnList: [],
      total: 0,
      dialogVisible: false,
      // 附件表格
      fileTableData: [],
      fileRanderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: "附件名称",
          type: "file",
          prop: "name",
          href: "path",
          name: "name",
        },
        {
          label: "操作",
          type: "iconHandle",
          width: 100,
        },
      ],
      iconList: [
        {
          handleType: "download",
          isShow: true,
          condition: (row: any) => {
            let iconOption = {
              text: `${row.name}`,
              icon: "icon-zhihuihuanbao_xiazai",
              color: "#bfbfbf",
            };
            return iconOption;
          },
        },
      ],
      // 视频
      videoTableData: [],
      videoRanderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: "视频名称",
          type: "file",
          prop: "name",
          href: "path",
          name: "name",
        },
        {
          label: "操作",
          type: "iconHandle",
          width: 100,
        },
      ],
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      // 改变年份或者日期
      handleChangeYear: (val: any, clickType: String) => {
        switch (clickType) {
          case "search": //主页的搜索条件
            if (!val) {
              //处理字段为null的默认情况
              // DATA.pagingParams.yearly = Number(new Date().getFullYear());
              DATA.pagingParams.yearly = undefined;
              return;
            }
            DATA.pagingParams.yearly = Number(new Date(val).getFullYear());
            break;
          default:
            break;
        }
      },
      handleChange(val: any) {},

      // 获取分页数据
      handlePagingSupervise: async (params: any) => {
        DATA.loading = true;
        let { data } = await findByPageDepartSupervision(params);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);

        // DATA.pagingParamsCopy.yearly = DATA.pagingParams.yearly;
        DATA.pagingParamsCopy.page = 1;
        METHODS.handlePagingSupervise(DATA.pagingParamsCopy);
      },
      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingSupervise: any
      ) => {
        currentChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handlePagingSupervise
        );
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingSupervise: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handlePagingSupervise,
          total
        );
      },
      // 添加
      handleCreate: async () => {
        await STORE.commit("setSupervisionInfo", {
          checkTime: null,
          companyType: null,
          fileIds: [],
          name: "",
          organizer: "",
          participant: "",
          summary: "",
          type: null,
          videoIds: [],
        });
        ROUTER.push({
          name: "supervisionInfo",
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
        sessionStorage.setItem(
          "supervisionPageParams",
          JSON.stringify(DATA.pagingParams)
        );
      },
      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "accessory":
            DATA.dialogVisible = true;
            DATA.fileTableData = row.files || [];
            DATA.videoTableData = row.videos || [];
            break;
          case "edit":
            await STORE.commit("setSupervisionInfo", row);
            ROUTER.push({
              name: "supervisionInfo",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            sessionStorage.setItem(
              "supervisionPageParams",
              JSON.stringify(DATA.pagingParams)
            );
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该监管信息?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteDepartSupervision({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!",
                  });
                  METHODS.handlePagingSupervise(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleFileBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "download":
            var a = document.createElement("a");
            var filename = row.name;
            a.href = row.path;
            a.download = filename;
            a.click();
            break;

          default:
            break;
        }
      },
      handleVideoBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "download":
            var a = document.createElement("a");
            var filename = row.name;
            a.href = row.path;
            a.download = filename;
            a.click();
            break;

          default:
            break;
        }
      },
    });
    onMounted(() => {
      let params: any = sessionStorage.getItem("supervisionPageParams");
      if (params) {
        params = JSON.parse(params as string);
        DATA.pagingParams = Object.assign({}, params);
        DATA.date = new Date(String(params.yearly));

        setTimeout(() => {
          DATA.pagingParamsCopy = Object.assign({}, params);
          sessionStorage.removeItem("supervisionPageParams");
        }, 500);
      }

      METHODS.handlePagingSupervise(DATA.pagingParams);

      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        {
          text: "附件",
          type: "info",
          handleType: "accessory",
          size: "small",
          isShow: true,
        },
        {
          text: "编辑",
          type: "primary",
          handleType: "edit",
          size: "small",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          text: "删除",
          type: "danger",
          handleType: "delete",
          size: "small",
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
.top_search {
  /deep/ .el-input {
    width: 200px;
  }
  /deep/ .el-input__inner {
    width: 100%;
  }
}

.file {
  max-height: 500px;
  overflow-y: auto;
}
// .top{
//   height: 80px;
//   line-height: 80px;
// }
</style>