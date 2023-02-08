<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb mb-10">
        <h3>台账信息</h3>
        <el-button
          type="primary"
          size="small"
          :disabled="!isDisable"
          @click="handleCreate"
        >添加</el-button>
      </div>
      <ele-table
        :tableData="tableData"
        :btnList="btnList"
        :renderTable="renderTable"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
        v-loading="tableLoading"
      ></ele-table>
      <!-- 添加、编辑模态框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="40%"
      >
        <ele-form
          :formData="dialogFormData"
          :renderFormArr="dialogRenderFormArr"
          :rules="dialogRules"
          :options="options"
          ref="dialogFormRef"
        >
          <!-- <template #scanning>
            <EleUpload
              :fileList="fileList"
              @uploadSuccess="uploadSuccess"
              @uploadRemove="uploadRemove"
            />
          </template> -->
          <template #scanning>
            <el-upload
              class="upload-demo"
              drag
              :action="IMG_URL"
              :headers="getItemtoken"
              :on-remove="uploadRemove"
              :on-success="uploadSuccess"
              :file-list="fileList"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传单个文件</em></div>
              <template #tip>
                <!-- <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div> -->
              </template>
            </el-upload>
          </template>
        </ele-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import {
  createLedgerInfo,
  deleteLedgerInfo,
  updateLedgerInfo,
} from '@/api/company/parameterInfo';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
import {
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleTable, EleUpload, EleForm },
  props: {
    formData: {
      type: Object,
      default: {},
    },
    isDisable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let dialogFormRef: any = ref(null);
    let DATA: any = reactive({
      tableData: [],
      btnList: [
        {
          type: 'primary',
          text: '编辑',
          handleType: 'edit',
          size: 'small',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
        {
          type: 'danger',
          text: '删除',
          handleType: 'delete',
          size: 'small',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
      ],
      renderTable: [
        {
          label: '添加时间',
          prop: 'addTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.addTime, '-', false);
          },
        },
        {
          label: '台账类型',
          prop: 'type',
          type: 'text',
          formatter: (row: any) => {
            let type = '';
            DATA.options.type.forEach((item: any) => {
              if (item.value === row.type) {
                type = item.name;
              }
            });
            return type;
          },
        },
        // {
        //   label: '文件名',
        //   prop: 'fileName',
        //   type: 'text',
        // },
        // {
        //   label: '文件',
        //   prop: 'filePath',
        //   type: 'image',
        // },
        {
          label: '文件',
          type: 'file',
          prop: 'filePath',
          href: 'filePath',
          name: 'fileName',
        },
        {
          label: '备注',
          prop: 'remark',
          type: 'text',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      disable: true,
      formData: {},
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      options: {},
      dialogRenderFormArr: [
        {
          label: '添加时间',
          type: 'date',
          prop: 'addTime',
          placeholder: '请选择添加时间',
          labelWidth: 120,
        },
        {
          label: '台账类型',
          type: 'select',
          prop: 'type',
          value: 'value',
          title: 'name',
          labelWidth: 120,
        },
        // {
        //   label: '文件名',
        //   type: 'input',
        //   prop: 'fileName',
        //   labelWidth: 120,
        // },
        {
          label: '备注',
          type: 'input',
          prop: 'remark',
          inputType: 'textarea',
          labelWidth: 120,
        },
        {
          label: '文件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 120,
        },
      ],
      dialogRules: {
        addTime: [
          {
            required: true,
            message: '请选择添加时间',
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: '请选择台账类型',
            trigger: 'change',
          },
        ],
        // fileName: [
        //   {
        //     required: true,
        //     message: '请输入文件名',
        //     trigger: 'blur',
        //   },
        // ],
      },
      fileList: [],
      tableLoading: false,
    });
    let METHODS = reactive({
      // 获取台账类型
      handleGetLedgerType: async () => {
        if (sessionRead('t_company_ledger_type')) {
          DATA.options.type = sessionRead('t_company_ledger_type');
        } else {
          let { data } = await getByKey({ key: 't_company_ledger_type' });
          if (data.code === RES_SUCCESS) {
            DATA.options.type = data.data;
            sessionWrite('t_company_ledger_type', data.data);
          }
        }
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加台账信息';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.fileList = [];
        DATA.dialogFormData = {};
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑台账信息';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
            DATA.fileList = [];
            // DATA.fileList.push({ url: IMG_File + row.filePath });
            row.fileId &&
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteLedgerInfo({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '删除成功!',
                  });
                  DATA.tableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirm: () => {
        dialogFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照信息',
                type: 'warning',
              });
              return;
            }
            // if (!DATA.dialogFormData.fileId) {
            //   ElMessage({
            //     message: '请选择文件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            DATA.dialogFormData.addTime &&
              (DATA.dialogFormData.addTime = filterTime(
                DATA.dialogFormData.addTime,
                '/'
              ));
            DATA.tableLoading = true;
            if (DATA.dialogType) {
              let { data } = await createLedgerInfo({
                ...DATA.dialogFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '添加成功',
                  type: 'success',
                });
                DATA.dialogVisible = false;
                DATA.tableData = data.data;
              }
            } else {
              delete DATA.dialogFormData.createTime;
              delete DATA.dialogFormData.updateTime;
              let { data } = await updateLedgerInfo({
                ...DATA.dialogFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '编辑成功',
                  type: 'success',
                });
                DATA.dialogVisible = false;
                DATA.tableData = data.data;
              }
            }
          }
        });
      },
      uploadSuccess: (res: any) => {
        DATA.fileList = [];
        // DATA.fileList.push({ url: IMG_File + res.data.path });
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.dialogFormData.fileId = res.data.id;
      },
      uploadRemove: () => {
        DATA.fileList = [];
        DATA.dialogFormData.fileId = null;
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.ledgerInfoList;
      },
      {
        deep: true,
      }
    );
    watch(
      () => props.isDisable,
      () => {
        DATA.disable =
          STORE.state.user.personnel.unitType === 1
            ? props.isDisable
            : props.isDisable
            ? props.isDisable
            : !props.isDisable;
      },
      {
        immediate: true,
      }
    );
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem('Admin-Token'),
      };
    });
    onMounted(() => {
      METHODS.handleGetLedgerType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
      IMG_URL,
      getItemtoken,
    };
  },
});
</script>
<style scoped lang="scss">
</style>