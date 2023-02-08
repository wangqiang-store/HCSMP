<template>
  <!-- 事故查处页面 -->
  <el-row class="container">
    <el-col :span="24">
      <el-row
        ><!-- 顶部的添加/搜索功能 -->
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
            <span>添加事故查处</span>
          </el-button>

          <div class="d_flex top_search">
            <el-input
              placeholder="请输入档案编号或被处罚单位"
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
              :labelWidth="120"
              ref="formRef"
            >
              <template #company>
                <el-select
                  v-model="formData.companyId"
                  style="width: 100%"
                  filterable
                  placeholder="请输入进行搜索"
                  @change="handleChangeCompany"
                >
                  <el-option
                    v-for="(item, index) in options.companyId"
                    :key="index"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </template>
              <template #place>
                <div class="flex">
                  <el-input
                    type="text"
                    v-model="formData.address1"
                    autocomplete="off"
                    disabled
                    style="padding-right: 4px"
                  ></el-input>
                  <el-input
                    type="text"
                    v-model="formData.place"
                    autocomplete="off"
                  ></el-input>
                </div>
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
                  multiple
                >
                  <el-button size="small" type="primary">点击上传</el-button>
                  <template #tip>
                    <div class="el-upload__tip">注意 : 可上传多个附件</div>
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
          </el-dialog> </el-col
      >
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
  ref,
} from "vue";
import {
  getIdentifiedPage,
  createIdentifiedInfo,
  deleteIdentifiedInfo,
  updateIdentifiedInfo,
} from "@/api/enforcement/punish";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime, formatDate } from "@/utils/filtration";
import { getProvince, getCity, getCounty, getTown } from "@/api/region";
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
          label: "档案编号",
          prop: "fileNumber",
          type: "text",
        },
        {
          label: "被处罚单位",
          type: "text",
          prop: "companyName",
          width: 300,
        },
        {
          label: "地址",
          type: "text",
          prop: "addressName",
          width: 300,
        },
        {
          label: "罚款金额",
          type: "text",
          prop: "penaltyAmount",
        },
        {
          label: "罚款缴纳期限",
          type: "text",
          prop: "payTime",
          formatter: (row: any) => {
            return formatDate(row.payTime);
          },
        },
        {
          label: "附件数量",
          type: "text",
          prop: "files",
          formatter: (row: any) => {
            let files = row.files != null ? row.files.length : 0;
            return files;
          },
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
          width: 250,
        },
      ],
      btnList: [],
      total: 0,
      row: [], //当前表格的行数据

      // 添加/编辑 模态框数据
      addOrEditTitle: "",
      addOrEditVisible: false,
      formData: {
        fileNumber: "",
        companyId: "",
        place: "",
        penaltyAmount: "",
        payTime: null,
        fileIds: "",
        files: [],
      },
      formDataCopy: {
        fileNumber: "",
        companyId: "",
        place: "",
        penaltyAmount: "",
        payTime: null,
        fileIds: "",
        files: [],
      },
      renderFormArr: [
        {
          label: "档案编号",
          type: "input",
          prop: "fileNumber",
          style: {
            width: "95%",
          },
        },
        {
          label: "被处罚单位",
          type: "slot",
          prop: "companyId",
          slotName: "company",
          style: {
            width: "95%",
          },
        },
        {
          label: "地址",
          type: "slot",
          prop: "place",
          slotName: "place",
          style: {
            width: "95%",
          },
        },
        {
          label: "处罚金额",
          type: "input",
          prop: "penaltyAmount",
          style: {
            width: "95%",
          },
        },
        {
          label: "罚款缴纳期限",
          prop: "payTime",
          type: "date",
          dateType: "date",
          style: {
            width: "95%",
          },
        },
        {
          label: "上传附件",
          type: "slot",
          slotName: "upload",
          style: {
            width: "95%",
          },
        },
      ],
      rules: {
        companyId: [{ required: true, message: "此为必填项", trigger: "blur" }],
        fileNumber: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        place: [{ required: true, message: "此为必填项", trigger: "blur" }],
        penaltyAmount: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        payTime: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },
      options: {
        companyId: STORE.state.globalData.companyList,
      },
      fileList: [],
      files: [],

      // 附件数据
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

        let { data } = await getIdentifiedPage(params);
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
        DATA.addOrEditTitle = "添加事故查处";
        DATA.addOrEditVisible = true;
        DATA.fileList = [];
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },
      //弹框取消按钮
      handleCancel: () => {
        DATA.addOrEditVisible = false;
        // 获取之前的文件数据
        let list = DATA.fileList.map((item: any) => {
          item.path = item.url;
          return item;
        });
        DATA.row.files = JSON.parse(JSON.stringify(list));

        proxy.$refs["formRef"].resetForm();
      },
      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs["formRef"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(",");
            }
            DATA.formData.payTime = filterTime(DATA.formData.payTime, "/");
            delete DATA.formData.files;

            if (DATA.formData.id) {
              let { data } = await updateIdentifiedInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success("编辑成功");
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createIdentifiedInfo(DATA.formData);
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
        DATA.row = row;
        switch (val.handleType) {
          case "accessory":
            DATA.dialogVisible = true;
            DATA.fileTableData = row.files || [];
            break;
          case "edit":
            DATA.addOrEditTitle = "编辑事故查处";
            DATA.addOrEditVisible = true;

            // 数据处理
            DATA.formData = Object.assign({}, row);

            DATA.fileList = [];
            DATA.files = [];
            DATA.formData.fileIds = [];
            if (DATA.formData.files != null) {
              DATA.files = DATA.formData.files;
              for (let item of DATA.formData.files) {
                DATA.formData.fileIds.push(item.id);
                DATA.fileList.push({
                  id: item.id,
                  name: item.name,
                  url: IMG_File + item.path,
                });
              }
            }
            //回显企业地址
            STORE.state.globalData.companyList.forEach((item: any) => {
              if (item.id == DATA.formData.companyId) {
                METHODS.handletProvinceCode(item.provinceCode);
                METHODS.handleCityCode(item.cityCode);
                METHODS.handleCountyCode(item.countyCode);
                METHODS.handleTownCode(item.townCode);
                // DATA.formData.place = item.address;
                return;
              }
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该事故查处?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteIdentifiedInfo({
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

      //添加/编辑 模态框---------------------
      handleUploadSuccess: (res: any) => {
        if (Array.isArray(DATA.formData.fileIds)) {
          DATA.formData.fileIds.push(res.data.id);
        } else {
          DATA.formData.fileIds =
            DATA.formData.fileIds === ""
              ? []
              : DATA.formData.fileIds.split(",");
          DATA.formData.fileIds.push(res.data.id);
        }

        DATA.files.push(res.data);
      },
      handleRemove: (res: any, fileList: any) => {
        let deleteUrl = "";
        if (res.response) {
          deleteUrl = res.response.data.path;
        } else {
          deleteUrl = res.url; //获取要删除的文件路径
        }
        let fileIds = [];
        // 获取删除文件在文件列表对应的索引值
        let i = DATA.files.findIndex((item: any) => item.path == deleteUrl);
        DATA.files.splice(i, 1);
        for (let item of DATA.files) {
          fileIds.push(item.id);
        }
        DATA.formData.fileIds = fileIds.join(",");
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

      // 选择企业
      handleChangeCompany: (val: any) => {
        STORE.state.globalData.companyList.forEach((item: any) => {
          if (item.id == val) {
            METHODS.handletProvinceCode(item.provinceCode);
            METHODS.handleCityCode(item.cityCode);
            METHODS.handleCountyCode(item.countyCode);
            METHODS.handleTownCode(item.townCode);
            DATA.formData.place = item.address;
            return;
          }
        });
      },
      // 根据省code回显数据
      handletProvinceCode: async (code: any) => {
        let { data } = await getProvince({
          code: code as number,
        });
        if (data.code === RES_SUCCESS) {
          if (data.data) {
            DATA.formData.address1 = data.data.name ? data.data.name : "";
          } else {
            DATA.formData.address1 = "";
          }
        }
      },
      // 根据市code回显数据
      handleCityCode: async (code: any) => {
        let { data } = await getCity({
          code: code as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) + " " + data.data.name;
        }
      },
      // 根据区、县code回显数据
      handleCountyCode: async (code: any) => {
        let { data } = await getCounty({
          code: code as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) + " " + data.data.name;
        }
      },
      // 根据乡、镇code回显数据
      handleTownCode: async (code: any) => {
        let { data } = await getTown({
          code: code as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) + " " + data.data.name;
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
  max-height: 500px;
  overflow-y: auto;
}
</style>