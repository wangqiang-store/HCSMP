<template>
  <!-- 应急演练页面 -->
  <el-row class="container">
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
        <span>添加应急演练</span>
      </el-button>

      <div class="d_flex top_search">
        <el-input
          placeholder="请输入企业名称"
          v-model="pagingParams.content"
          clearable
          class="mr-10"
          style="width: 300px"
        ></el-input>
        <el-button
          type="primary"
          @click="handleSearch"
        >
          <span>搜索</span>
        </el-button>
      </div>
    </el-col>

    <!-- 表格数据显示 -->
    <el-col
      :span="24"
      style="padding: 10px 0"
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
        top="4vh"
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
          <template #money>
            <el-input
              type="text"
              v-model="formData.money"
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
              <el-button
                size="small"
                type="primary"
              >添加附件</el-button>
              <template #tip>
                <div class="el-upload__tip">注意 : 可上传多个附件</div>
              </template>
            </el-upload>
          </template>
        </ele-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>

    <!-- 应急演练信息 - 模态框 -->
    <el-col :span="24">
      <el-dialog
        title="应急演练信息"
        v-model="checkVisible"
        width="50%"
      >
        <EleDescriptions
          :column="4"
          :border="true"
          :renderDescriptionsArr="renderDescriptionsArr"
          :listData="checkData"
          class="file"
        >
          <template #drillTime="scope">
            <div>{{ filterTime(scope.scope.drillTime) }}</div>
          </template>
          <template #createTime="scope">
            <div>{{ filterTime(scope.scope.createTime) }}</div>
          </template>
          <template #file="scope">
            <a
              v-for="(item, index) in scope.scope.files"
              :key="index"
              :href="item.path"
              target="_blank"
              style="display: block; color: #333333"
              class="mb-5"
              :title="item.name"
            >
              {{ index + 1 }} 、{{ item.name }}
            </a>
          </template>
        </EleDescriptions>
      </el-dialog>
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
} from '@/api/common/common';
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  computed,
  nextTick,
  ref,
} from 'vue';
import {
  getEmergencyDrillPage,
  createEmergencyDrillInfo,
  deleteEmergencyDrillInfo,
  updateEmergencyDrillInfo,
} from '@/api/emergency/drillRecord';
import { findAllCompany } from '@/api/company';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import { filterTime } from '@/utils/filtration';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import EleDescriptions from '@/components/eleDescriptions/index.vue';
export default defineComponent({
  components: { EleTable, ElePagination, EleForm, EleDescriptions },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        companyId: undefined,
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        companyId: undefined,
      },

      // 表格数据
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: '企业名称',
          prop: 'companyName',
          type: 'text',
          width: 350,
        },
        {
          label: '演练时间',
          type: 'text',
          prop: 'drillTime',
          formatter: (row: any) => {
            return row.drillTime ? row.drillTime.replace(/\//g, '-') : '';
          },
        },
        {
          label: '演练内容',
          type: 'text',
          prop: 'content',
        },
        {
          label: '填报人(创建人员)',
          type: 'text',
          prop: 'createIdName',
        },
        {
          label: '创建时间',
          type: 'text',
          prop: 'createTime',
          formatter: (row: any) => {
            return row.createTime ? row.createTime.replace(/\//g, '-') : '';
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: 300,
        },
      ],
      btnList: [],
      total: 0,
      row: [], //当前表格的行数据

      // 添加/编辑 模态框数据
      addOrEditTitle: '',
      addOrEditVisible: false,
      formData: {
        companyInfoId: '',
        drillTime: '',
        content: '',
        participant: '',
        result: '',
        files: [],
        fileIds: '',
      },
      formDataCopy: {
        companyInfoId: '',
        drillTime: '',
        content: '',
        participant: '',
        result: '',
        files: [],
        fileIds: '',
      },
      renderFormArr: [
        {
          label: '企业名称',
          type: 'select',
          prop: 'companyInfoId',
          filterable: true,
          placeholder: '可进行输入搜索',
          style: {
            width: '95%',
          },
          value: 'id',
          title: 'name',
        },
        {
          label: '演练时间',
          prop: 'drillTime',
          type: 'date',
          dateType: 'date',
          style: {
            width: '95%',
          },
        },
        {
          label: '演练内容',
          type: 'input',
          inputType: 'textarea',
          prop: 'content',
          style: {
            width: '95%',
          },
        },
        {
          label: '参与人员',
          type: 'input',
          prop: 'participant',
          style: {
            width: '95%',
          },
        },
        {
          label: '演练情况效果',
          type: 'input',
          inputType: 'textarea',
          prop: 'result',
          style: {
            width: '95%',
          },
        },
        {
          label: '附件',
          type: 'slot',
          slotName: 'upload',
          prop: 'fileIds',
          style: {
            width: '95%',
          },
        },
      ],
      rules: {
        companyInfoId: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        drillTime: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        content: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        participant: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        // fileIds: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },
      options: {
        companyInfoId: [],
      },
      fileList: [],
      files:[],

      // 查看演练信息 模态框
      checkVisible: false,
      renderDescriptionsArr: [
        {
          label: '企业名称',
          span: 4,
          prop: 'companyName',
        },
        {
          label: '演练时间',
          span: 4,
          prop: 'drillTime',
          type: 'slot',
          slotName: 'drillTime',
        },
        {
          label: '创建时间',
          span: 4,
          prop: 'createTime',
          type: 'slot',
          slotName: 'createTime',
        },
        {
          label: '演练内容',
          span: 4,
          prop: 'content',
        },
        {
          label: '演练情况效果',
          span: 4,
          prop: 'result',
        },
        {
          label: '参与人',
          span: 4,
          prop: 'participant',
        },
        {
          label: '填报人(创建人员)',
          span: 4,
          prop: 'createIdName',
        },
        {
          label: '附件',
          span: 4,
          prop: 'fileIds',
          type: 'slot',
          slotName: 'file',
        },
      ],
      checkData: {},
    });
    let METHODS = reactive({
      // 获取分页数据
      handlePagingData: async (params: any) => {
        DATA.loading = true;

        if (STORE.state.user.personnel.unitType !== 1) {
          params.companyId = STORE.state.user.personnel.companyId;
        }

        let { data } = await getEmergencyDrillPage(params);
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
        DATA.addOrEditTitle = '添加应急演练';
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

        proxy.$refs['formRef'].resetForm();
      },
      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs['formRef'].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(',');
            }
            DATA.formData.drillTime = filterTime(DATA.formData.drillTime, '/');
            DATA.formData.creator = STORE.state.user.personnel.id;

            delete DATA.formData.files;

            //发起请求
            if (DATA.formData.id) {
              let { data } = await updateEmergencyDrillInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success('编辑成功');
                DATA.addOrEditVisible = false;
                METHODS.handlePagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createEmergencyDrillInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success('添加成功');
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
          case 'check':
            DATA.checkVisible = true;
            // 数据处理
            DATA.checkData = row;

            break;
          case 'edit':
            DATA.addOrEditTitle = '编辑应急演练';
            DATA.addOrEditVisible = true;

            // 数据处理
            DATA.formData = Object.assign({}, row);

            DATA.fileList = [];
            DATA.formData.fileIds = [];
            DATA.files = [];
            if (DATA.formData.files != null) {
              DATA.files = DATA.formData.files;
              for (let item of DATA.formData.files) {
                DATA.formData.fileIds.push(item.id);
                DATA.fileList.push({
                  id:item.id,
                  name: item.name,
                  url: IMG_File + item.path,
                });
              }
            }
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该应急演练?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteEmergencyDrillInfo({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '删除成功!',
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
        if (Array.isArray(DATA.formData.fileIds)) {
          DATA.formData.fileIds.push(res.data.id);
        } else {
          DATA.formData.fileIds =
            DATA.formData.fileIds === ''
              ? []
              : DATA.formData.fileIds.split(',');
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
        Authorization: localStorage.getItem('Admin-Token'),
      };
    });
    onMounted(() => {
      // 获取非煤启用的企业列表
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
          text: '查看',
          type: 'success',
          handleType: 'check',
          size: 'small',
          isShow: true,
        },
        {
          text: '编辑',
          handleType: 'edit',
          type: 'primary',
          size: 'small',
          isShow: showBtnList.value.includes('edit'),
        },
        {
          text: '删除',
          type: 'danger',
          handleType: 'delete',
          size: 'small',
          isShow: showBtnList.value.includes('delete'),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      IMG_URL,
      getItemtoken,
      filterTime,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
  padding-top: 20px;
}
/deep/ textarea {
  height: 120px !important;
  resize: none;
  border: 1px solid #dcdfe6;
  overflow-y: scroll;
}

/deep/ table td.is-bordered-label.is-left {
  width: 30%;
  text-align: center;
  font-weight: 700;
  background-color: #f3f5fa;
  color: #333333;
}
/deep/table td.el-descriptions__content.is-left {
  text-align: left;
  color: #333333;
}
// /deep/ .el-table .cell {
//   white-space: pre-line; /*保留换行符*/
// }
a:hover {
  color: #0099ff !important;
  text-decoration: underline;
}
.file {
  min-height: 380px;
  max-height: 500px;
  overflow-y: auto;
}
</style>