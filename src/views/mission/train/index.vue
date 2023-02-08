<template>
  <!-- 培训管理页面 -->
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <!-- 添加  搜索 -->
        <el-col
          :span="24"
          class="d_flex"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            @click="handleCreate"
            type="primary"
            v-if="showBtnList.includes('create')"
          >
            <i class="el-icon-circle-plus-outline mr-5"></i>
            <span>添加培训管理</span>
          </el-button>

          <div class="d_flex top_search">
            <el-date-picker
              v-model="date"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="mr-10"
              style="width: 400px"
              prefix-icon="el-icon-date"
            >
            </el-date-picker>
            <el-input
              placeholder="请输入标题关键词或组织人(团体)"
              v-model="pagingParams.content"
              clearable
              class="mr-10"
              style="width: 300px"
            ></el-input>
            <el-button type="primary" @click="handleSearch">
              <span>搜索</span>
            </el-button>
          </div>
        </el-col>

        <!-- 表格数据显示 -->
        <el-col
          :span="24"
          style="padding: 20px 0"
          v-loading="loading"
        >
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleBtnEvent"
            :cellStyle="tableCellStyle"
            class="mb-10"
          ></ele-table>

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
                  handlePagingData
                )
            "
            @handleSizeChange="
              (val) =>
                handleSizeChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingData,
                  total
                )
            "
          ></ele-pagination>
        </el-col>

        <!-- 附件模态框 -->
        <el-col :span="24">
          <el-dialog
            title="附件"
            v-model="dialogVisible"
            width="40%"
            top="10vh"
          >
            <div class="mb-20 file">
              <!-- 附件 -->
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
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import {
  getTrainRecordsPage,
  deleteTrainRecordsInfo,
} from "@/api/mission/train";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime } from "@/utils/filtration";
import { useRoute, useRouter } from "vue-router";
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
      date: null,
      pagingParams: {
        limit: 10,
        page: 1,
        content: "",
        startTime: null,
        endTime: null,
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: "",
        startTime: null,
        endTime: null,
      },

      // 表格
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
          label: "标题",
          type: "text",
          prop: "title",
        },
        {
          label: "组织人(团体)",
          type: "text",
          prop: "organizer",
        },
        {
          label: "参与人(团体)",
          type: "text",
          prop: "participant",
        },
        {
          label: "时间",
          type: "text",
          prop: "happenTime",
          formatter: (row: any) => {
            return row.happenTime ? row.happenTime.replace(/\//g, "-") : "";
          },
        },
        {
          label: "概要",
          type: "text",
          prop: "contentSummary",
          width: 300,
        },
        {
          label: "总结",
          type: "text",
          prop: "summary",
          width: 300,
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

      // 附件数据
      dialogVisible: false,
      // 附件
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
      // 获取分页数据
      handlePagingData: async (params: any) => {
        DATA.loading = true;
        if (DATA.date) {
          params.startTime = filterTime(DATA.date[0], "/");
          params.endTime = filterTime(DATA.date[1], "/");
        }
        let { data } = await getTrainRecordsPage(params);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },

      // 搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handlePagingData(DATA.pagingParamsCopy);
      },

      // 点击添加按钮
      handleCreate: async () => {
        await STORE.commit("setTrainInfo", {
          title: "",
          organizer: "",
          happenTime: null,
          participant: "",
          contentSummary: "",
          summary: "",
          fileIds: [],
          videoIds: [],
        });
        ROUTER.push({
          name: "trainInfo",
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
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
            await STORE.commit("setTrainInfo", row);
            ROUTER.push({
              name: "trainInfo",
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该培训信息?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteTrainRecordsInfo({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!",
                  });
                  METHODS.handlePagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      // 附件下载
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

      // 单元格样式处理
      tableCellStyle: ({ row, column, rowIndex, columnIndex }: any) => {
        // 总结
        // if (columnIndex == 6) {
        //   return "text-align: left;";
        // }
      },

      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingData: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handlePagingData);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingData: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handlePagingData,
          total
        );
      },
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);

      METHODS.handlePagingData(DATA.pagingParams);
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

/deep/ .el-table .cell {
  white-space: pre-line; /*保留换行符*/
}

.file {
  max-height: 600px;
  overflow-y: auto;
}
</style>