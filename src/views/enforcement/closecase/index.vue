<template>
  <!-- 结案处理页面 -->
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <!-- 顶部的添加/搜索功能 -->
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
            <span>添加结案处理</span>
          </el-button>

          <div class="d_flex top_search">
            <el-input
              placeholder="请输入案卷编号或案件名称关键字、被处罚人"
              v-model="pagingParams.content"
              clearable
              class="mr-10"
              style="width: 400px"
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

        <!-- 添加/编辑 - 模态框 -->
        <el-col :span="24">
          <el-dialog
            :title="addOrEditTitle"
            v-model="addOrEditVisible"
            :before-close="handleCancel"
            width="35%"
          >
            <ele-form
              :formData="formData"
              :renderFormArr="renderFormArr"
              :rules="rules"
              :labelWidth="120"
              ref="formRef"
            >
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="handleCancel">取 消</el-button>
                <el-button type="primary" @click="handleConfirm"
                  >确 定</el-button
                >
              </span>
            </template>
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
  toRefs,
  computed,
  ref,
} from "vue";
import {
  getCaseSettlementPage,
  createCaseSettlementInfo,
  deleteCaseSettlementInfo,
  updateAccountabilityInfo,
} from "@/api/enforcement/closecase";
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
      pagingParams: {
        content: "",
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: "",
        limit: 10,
        page: 1,
      },

      // 表格数据
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
          label: "案卷编号",
          prop: "fileNumber",
          type: "text",
        },
        {
          label: "案件名称",
          type: "text",
          prop: "caseName",
        },
        {
          label: "被处罚人(单位)",
          type: "text",
          prop: "punishedPerson",
        },
        {
          label: "地址",
          type: "text",
          prop: "place",
        },
        {
          label: "处理结果",
          type: "text",
          prop: "processingResult",
        },
        {
          label: "执行情况",
          type: "text",
          prop: "implementation",
        },
        {
          label: "创建时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return row.createTime ? row.createTime.replace(/\//g, "-") : "";
          },
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      btnList: [
        {
          text: "编辑",
          type: "primary",
          handleType: "edit",
          size: "small",
        },
        {
          text: "删除",
          type: "danger",
          handleType: "delete",
          size: "small",
        },
      ],
      total: 0,

      // 添加/编辑 模态框数据
      addOrEditTitle: "",
      addOrEditVisible: false,
      formData: {
        fileNumber: "",
        caseName: "",
        punishedPerson: "",
        processingResult: "",
        place: "",
        implementation: "",
      },
      formDataCopy: {
        fileNumber: "",
        caseName: "",
        punishedPerson: "",
        processingResult: "",
        place: "",
        implementation: "",
      },
      renderFormArr: [
        {
          label: "案卷编号",
          type: "input",
          prop: "fileNumber",
          style: {
            width: "95%",
          },
        },
        {
          label: "案件名称",
          type: "input",
          prop: "caseName",
          style: {
            width: "95%",
          },
        },
        {
          label: "被处罚人(单位)",
          type: "input",
          prop: "punishedPerson",
          style: {
            width: "95%",
          },
        },
        {
          label: "处理结果",
          type: "input",
          prop: "processingResult",
          inputType: "textarea",
          style: {
            width: "95%",
          },
        },
        {
          label: "地址",
          type: "input",
          prop: "place",
          style: {
            width: "95%",
          },
        },
        {
          label: "执行情况",
          type: "input",
          prop: "implementation",
          style: {
            width: "95%",
          },
        },
      ],
      rules: {
        fileNumber: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        caseName: [{ required: true, message: "此为必填项", trigger: "blur" }],
        punishedPerson: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        processingResult: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
      },
    });
    let METHODS = reactive({
      // 获取分页数据
      handlePagingData: async (params: any) => {
        DATA.loading = true;
        if (params.yearly) {
          params.yearly = new Date(params.yearly).getFullYear();
        }
        let { data } = await getCaseSettlementPage(params);
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
        DATA.addOrEditTitle = "添加结案处理";
        DATA.addOrEditVisible = true;
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },
      //弹框取消按钮
      handleCancel: () => {
        DATA.addOrEditVisible = false;
        proxy.$refs["formRef"].resetForm();
      },
      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs["formRef"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.id) {
              let { data } = await updateAccountabilityInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success("编辑成功");
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createCaseSettlementInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success("添加成功");
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            }
          }
        });
      },

      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.addOrEditTitle = "编辑结案处理";
            DATA.addOrEditVisible = true;

            //数据处理
            DATA.formData = Object.assign({}, row);
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该结案处理?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteCaseSettlementInfo({
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
      METHODS.handlePagingData(DATA.pagingParams);
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
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

/deep/ textarea {
  height: 120px !important;
  resize: none;
  border: 1px solid #dcdfe6;
  &:focus {
    border: 1px solid #409eff;
  }
  overflow-y: scroll;
}

// /deep/ .el-table .cell {
//   white-space: pre-line; /*保留换行符*/
// }
</style>