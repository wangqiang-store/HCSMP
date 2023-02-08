<template>
  <!-- 应急备案页面 -->
  <el-row class="container" style="height:100%">
    <!-- 顶部的添加/搜索功能 -->
    <el-col :span="24">
      <el-row>
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
            <span>添加应急备案</span>
          </el-button>

          <div class="d_flex top_search">
            <el-input
              placeholder="请输入企业名称或备案单位"
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
              <!-- 有效日期 -->
              <template #validity>
                <el-date-picker
                  v-model="formData.date"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                  @change="handleChangeTime"
                >
                </el-date-picker>
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

        <!-- 附件模态框 -->
        <el-col :span="24">
          <el-dialog title="附件" v-model="dialogVisible" width="40%">
            <!-- 附件 -->
            <ele-table
              :tableData="fileTableData"
              :renderTable="fileRanderTable"
              :isborder="true"
              :iconList="iconList"
              @handleBtnEvent="handleFileBtnEvent"
              empty-text="暂无文件"
              class="mb-20 file"
            ></ele-table>
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
import {
  getMineServePage,
  createPlan,
  deletePlan,
  updatePlan,
} from "@/api/company/mineProductionServe";
import { findAllCompany } from "@/api/company";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime, formatDate } from "@/utils/filtration";
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
        companyId: undefined,
      },
      pagingParamsCopy: {
        content: "",
        limit: 10,
        page: 1,
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
          type: "text",
          prop: "companyName",
          width: 350,
        },
        {
          label: "备案单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "备案有效期",
          type: "text",
          prop: "startTime",
          formatter: (row: any) => {
            return formatDate(row.startTime) + " - " + formatDate(row.endTime);
          },
        },
        {
          label: "附件",
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
        unit: "",
        date: "",
        startTime: "",
        endTime: "",
        fileId: "",
      },
      formDataCopy: {
        companyInfoId: "",
        unit: "",
        date: "",
        startTime: "",
        endTime: "",
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
          label: "备案单位",
          type: "select",
          prop: "unit",
          style: {
            width: "95%",
          },
          value: "value",
          title: "value",
        },
        {
          label: "有效日期",
          type: "slot",
          slotName: "validity",
          prop: "startTime",
          style: {
            width: "95%",
          },
        },
        {
          label: "上传附件",
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
        unit: [{ required: true, message: "此为必填项", trigger: "blur" }],
        startTime: [
          { required: true, message: "此为必填项", trigger: "change" },
        ],
      },
      options: {
        companyInfoId: [],
        unit: [
          {
            value: "英德市安全生产监督管理局",
          },
          {
            value: "清远市安全生产监督管理局",
          },
          {
            value: "广东省安全生产监督管理局",
          },
        ],
      },
      fileList: [],

      // 附件模态框数据
      dialogVisible: false,
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
    });
    let METHODS = reactive({
      // 获取分页数据
      handlePagingData: async (params: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          params.companyId = STORE.state.user.personnel.companyId;
        }

        let { data } = await getMineServePage(params);
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
        DATA.addOrEditTitle = "添加备案信息";
        DATA.addOrEditVisible = true;
        DATA.fileList = [];
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },

      // 弹框改变时间
      handleChangeTime: (val: any) => {
        if (val) {
          DATA.formData.startTime = val[0];
          DATA.formData.endTime = val[1];
        } else {
          DATA.formData.startTime = "";
          DATA.formData.endTime = "";
        }
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
            DATA.formData.endTime = filterTime(DATA.formData.endTime, "/");
            delete DATA.formData.date;
            delete DATA.formData.files;
            delete DATA.formData.createTime;
            delete DATA.formData.updateTime;

            //发起请求
            if (DATA.formData.id) {
              let { data } = await updatePlan(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success("编辑成功");
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createPlan(DATA.formData);
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
          // case "accessory":
          //   DATA.dialogVisible = true;
          //   DATA.fileTableData = row.files || [];
          //   break;
          case "edit":
            DATA.addOrEditTitle = "编辑备案信息";
            DATA.addOrEditVisible = true;

            // 数据处理
            DATA.formData = Object.assign({}, row);
            DATA.formData.date = [row.startTime, row.endTime];

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
              .$confirm("是否确定删除该应急备案?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deletePlan({
                  id: row.id,
                  companyInfoId: row.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message.success("删除成功");
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

      METHODS.handlePagingData(DATA.pagingParams);
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        // {
        //   text: "附件",
        //   type: "primary",
        //   handleType: "accessory",
        //   size: "small",
        // },
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
.container{
  height: calc(100% - 40px) !important;
}
.file {
  height: 400px;
  overflow-y: auto;
}
</style>