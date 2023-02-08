<template>
  <!-- 救护协议页面 -->
  <el-row class="container" style="height: 100%">
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
            <span>添加救护协议</span>
          </el-button>

          <div class="d_flex top_search">
            <el-date-picker
              v-model="date"
              type="year"
              placeholder="选择年份"
              class="mr-10"
              prefix-icon="el-icon-date"
              :disabled-date="disabledDate"
            >
            </el-date-picker>
            <el-input
              placeholder="请输入企业名称"
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
        <el-col :span="24" style="padding: 20px 0" v-loading="loading">
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
            width="35%"
            :before-close="handleCancel"
          >
            <ele-form
              :formData="formData"
              :renderFormArr="renderFormArr"
              :rules="rules"
              :options="options"
              ref="formRef"
            >
              <!-- 金额 -->
              <template #amount>
                <el-input
                  type="text"
                  v-model="formData.amount"
                  autocomplete="off"
                >
                  <template #append>元</template>
                </el-input>
              </template>
              <!-- 附件 -->
              <template #upload>
                <el-upload
                  class="upload-demo"
                  :action="IMG_URL"
                  :headers="getItemtoken"
                  :on-remove="handleRemove"
                  :on-success="handleUploadSuccess"
                  :file-list="fileList"
                  ref="upload"
                  multiple
                >
                  <el-button size="small" type="primary">添加附件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">注意 : 只能上传单个附件</div>
                  </template>
                </el-upload>
              </template>
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
import {
  currentChange,
  IMG_URL,
  IMG_File,
  RES_SUCCESS,
  sizeChange,
} from "@/api/common/common";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  computed,
  nextTick,
  ref,
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime, formatDate } from "@/utils/filtration";
import { useRoute, useRouter } from "vue-router";
import {
  getRescueAgreementPage,
  createAgreement,
  deleteAgreement,
  updateAgreement,
} from "@/api/company/mineProductionServe";
import { findAllCompany } from "@/api/company";
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
        yearly: null,
        companyId: undefined,
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: "",
        yearly: null,
        companyId: undefined,
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
          label: "企业名称",
          prop: "companyName",
          type: "text",
          width: 350,
        },
        {
          label: "年份日期",
          type: "text",
          prop: "startTime",
          formatter: (row: any) => {
            return formatDate(row.startTime);
          },
        },
        {
          label: "金额",
          type: "text",
          prop: "amount",
          formatter: (row: any) => {
            return parseFloat(row.amount)
              ? parseFloat(row.amount) + " 元"
              : "0 元";
          },
        },
        {
          label: "救护协议",
          type: "file",
          prop: "fileName",
          href: "filePath",
          name: "fileName",
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
          width: 300,
        },
      ],
      btnList: [],
      total: 0,

      // 添加/编辑 模态框数据
      addOrEditTitle: "",
      addOrEditVisible: false,
      formData: {
        companyInfoId: "",
        startTime: "",
        amount: "",
        fileId: "",
      },
      formDataCopy: {
        companyInfoId: "",
        startTime: "",
        amount: "",
        fileId: "",
      },
      renderFormArr: [
        {
          label: "企业名称",
          type: "select",
          prop: "companyInfoId",
          filterable: true,
          placeholder: "可进行输入搜索",
          style: {
            width: "95%",
          },
          value: "id",
          title: "name",
        },
        {
          label: "时间",
          prop: "startTime",
          type: "date",
          dateType: "date",
          style: {
            width: "95%",
          },
          disabledDate: (value: any) => {
            return value.getTime() > Date.now();
          },
        },
        {
          label: "金额",
          type: "slot",
          slotName: "amount",
          prop: "amount",
          style: {
            width: "95%",
          },
        },
        {
          label: "附件",
          type: "slot",
          slotName: "upload",
          prop: "fileId",
          style: {
            width: "95%",
          },
        },
      ],
      rules: {
        companyInfoId: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        startTime: [{ required: true, message: "此为必填项", trigger: "blur" }],
        // fileId: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },
      options: {
        companyInfoId: [],
      },
      fileList: [],
    });
    let METHODS = reactive({
      disabledDate: (value: any) => {
        return value.getTime() > Date.now();
      },
      // 获取分页数据
      handlePagingData: async (params: any) => {
        DATA.loading = true;
        if (DATA.date) {
          params.yearly = new Date(DATA.date).getFullYear();
        }

        if (STORE.state.user.personnel.unitType !== 1) {
          params.companyId = STORE.state.user.personnel.companyId;
        }

        let { data } = await getRescueAgreementPage(params);
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
        DATA.addOrEditTitle = "添加救护协议信息";
        DATA.addOrEditVisible = true;
        DATA.fileList = [];
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
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(",");
            }

            DATA.formData.startTime = filterTime(DATA.formData.startTime, "/");

            // 发起请求
            if (DATA.formData.id) {
              let { data } = await updateAgreement(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success("编辑成功");
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createAgreement(DATA.formData);
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
            DATA.addOrEditTitle = "编辑救护协议信息";
            DATA.addOrEditVisible = true;
            // 数据处理
            DATA.formData = Object.assign({}, row);

            DATA.fileList = [];
            if (row.fileId) {
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });
            }

            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该救护协议?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteAgreement({
                  id: row.id,
                  companyInfoId: row.companyInfoId,
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

      handleUploadSuccess: (res: any, file: any, fileList: any) => {
        DATA.formData.fileId = res.data.id;
        DATA.formData.fileName = res.data.name;

        // 上传列表控制
        if (fileList.length > 0) {
          DATA.fileList = [fileList[fileList.length - 1]];
        }
      },
      handleRemove: (res: any, fileList: any) => {
        DATA.fileList = [];
        DATA.formData.fileId = undefined;
      },

      // 获取启用的企业列表
      getCompanyList: async () => {
        let { data } = await findAllCompany();
        if (data.code === RES_SUCCESS) {
          DATA.options.companyInfoId = data.data;
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
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token"),
      };
    });
    onMounted(() => {
      // 获取启用的企业列表（救护协议和应急备案）
      METHODS.getCompanyList();

      //获取分页数据
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
      IMG_URL,
      getItemtoken,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
}
</style>