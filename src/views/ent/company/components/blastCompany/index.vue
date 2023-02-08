<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>爆破公司信息</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            @click="disable=!disable"
            v-show="disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            v-show="!disable"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
      <EleForm
        :formData="formData"
        :rules="rules"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :options="options"
        :isDisable="disable"
        ref="formRef"
      >
      </EleForm>
    </el-col>
    <el-col :span="24">
      <div class="mb-10 tar">
        <el-button
          type="primary"
          size="small"
          @click="handleCreate"
          :disabled="!isDisable || !formData.id"
        >添加</el-button>
      </div>
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        :btnList="btnList"
        @handleBtnEvent="handleBtnEvent"
        v-loading="tableLoading"
      >
      </ele-table>
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
          ref="dialogFormRef"
          :options="dialogOptions"
        >
          <template #scanning>
            <!-- <EleUpload
              :fileList="fileList"
              @uploadSuccess="uploadSuccess"
              @uploadRemove="uploadRemove"
            /> -->
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
import EleForm from '@/components/eleForm/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import {
  createBlastInfo,
  createStaff,
  deleteStaff,
  updateBlastInfo,
  updateStaff,
} from '@/api/company/blastCompany';
import {
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
import { verifyIdCard, verifyPassport, verifyPhone } from '@/api/common/verify';
export default defineComponent({
  components: { EleForm, EleTable, EleUpload },
  props: {
    formData: {
      type: Object,
      default: {},
    },
    isDisable: {
      type: Boolean,
    },
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let formRef: any = ref(null);
    let dialogFormRef: any = ref(null);
    var validateIdCard = (rule: any, value: any, callback: any) => {
      if (verifyIdCard.test(value) || verifyPassport.test(value)) {
        callback();
      } else {
        callback('身份证号码或护照格式不正确');
      }
    };
    let DATA: any = reactive({
      formData: {},
      rules: {},
      renderFormArr: [
        {
          label: '作业单位名称',
          type: 'input',
          prop: 'name',
          style: {
            width: '40%',
          },
        },
        {
          label: '单位资质',
          type: 'select',
          prop: 'qualification',
          value: 'value',
          title: 'name',
          style: {
            width: '40%',
          },
        },
      ],
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      disable: true,
      options: {},
      // 爆破表格
      tableData: [],
      btnList: [
        {
          text: '编辑',
          type: 'primary',
          handleType: 'edit',
          size: 'small',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
        {
          text: '删除',
          type: 'danger',
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
          label: '爆破员姓名',
          prop: 'name',
          type: 'text',
        },
        {
          label: '岗位',
          prop: 'job',
          type: 'text',
          formatter: (row: any) => {
            let job = '';
            DATA.dialogOptions.job?.forEach((item: any) => {
              if (row.job === item.value) {
                job = item.name;
              }
            });
            return job;
          },
        },
        {
          label: '电话',
          prop: 'phone',
          type: 'text',
        },
        {
          label: '身份证号码(护照号)',
          prop: 'idCard',
          type: 'text',
        },
        {
          label: '资格证书',
          prop: 'certificate',
          type: 'text',
        },
        {
          label: '证书编号',
          prop: 'certificateCode',
          type: 'text',
        },
        {
          label: '评价时间',
          prop: 'expirationTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.expirationTime, '-', false);
          },
        },
        {
          label: '扫描件',
          type: 'file',
          prop: 'filePath',
          href: 'filePath',
          name: 'fileName',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      dialogRenderFormArr: [
        {
          label: '爆破员姓名',
          type: 'input',
          prop: 'name',
          labelWidth: 150,
        },
        {
          label: '岗位',
          type: 'select',
          prop: 'job',
          value: 'value',
          title: 'name',
          labelWidth: 150,
        },
        {
          label: '电话',
          type: 'input',
          prop: 'phone',
          labelWidth: 150,
        },
        {
          label: '身份证号(护照号)',
          type: 'input',
          prop: 'idCard',
          labelWidth: 150,
        },
        {
          label: '资格证书',
          type: 'input',
          prop: 'certificate',
          labelWidth: 150,
        },
        {
          label: '证书编号',
          type: 'input',
          prop: 'certificateCode',
          labelWidth: 150,
        },
        {
          label: '证书有效期',
          type: 'date',
          prop: 'expirationTime',
          placeholder: '选择有效期',
          labelWidth: 150,
        },
        {
          label: '扫描件',
          type: 'slot',
          slotName: 'scanning',
          prop: 'fileId',
          labelWidth: 150,
        },
      ],
      dialogRules: {
        name: [
          {
            required: true,
            message: '请输入爆破人员姓名',
            trigger: 'blur',
          },
        ],
        job: [
          {
            required: true,
            message: '请选择岗位',
            trigger: 'change',
          },
        ],
        phone: [
          {
            pattern: verifyPhone,
            message: '电话格式不正确',
          },
        ],
        idCard: [
          {
            required: true,
            message: '请输入身份证号或护照号',
            trigger: 'blur',
          },
          { validator: validateIdCard, trigger: 'blur' },
        ],
        certificate: [
          {
            required: true,
            message: '请输入资格证书',
            trigger: 'blur',
          },
        ],
        certificateCode: [
          {
            required: true,
            message: '请输入资格证书编号',
            trigger: 'blur',
          },
        ],
        expirationTime: [
          {
            required: true,
            message: '请选择证书有效期',
            trigger: 'change',
          },
        ],
      },
      fileList: [],
      tableLoading: false,
      dialogOptions: {},
    });
    let METHODS = reactive({
      // 获取爆破单位资质
      handleGetQualification: async () => {
        if (sessionRead('t_blast_qualification_type')) {
          DATA.options.qualification = sessionRead(
            't_blast_qualification_type'
          );
        } else {
          let { data } = await getByKey({ key: 't_blast_qualification_type' });
          if (data.code === RES_SUCCESS) {
            DATA.options.qualification = data.data;
            sessionWrite('t_blast_qualification_type', data.data);
          }
        }
      },
      // 获取爆破人员岗位
      handleGetBlastStaffJob: async () => {
        if (sessionRead('t_blast_staff_job')) {
          DATA.dialogOptions.job = sessionRead('t_blast_staff_job');
        } else {
          let { data } = await getByKey({ key: 't_blast_staff_job' });
          if (data.code === RES_SUCCESS) {
            DATA.dialogOptions.job = data.data;
            sessionWrite('t_blast_staff_job', data.data);
          }
        }
      },
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.companyInfoId) {
              if (DATA.formData.id) {
                let { data } = await updateBlastInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '爆破公司信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              } else {
                let { data } = await createBlastInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '爆破公司信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              }
            } else {
              ElMessage({
                message: '请先填写保存营业执照信息',
                type: 'warning',
              });
            }
          }
        });
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加爆破人员信息';
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
            DATA.dialogTitle = '编辑爆破人员信息';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
            DATA.dialogFormData.expirationTime = filterTime(
              row.expirationTime,
              '/'
            );
            DATA.fileList = [];
            row.fileId &&
              DATA.fileList.push({ name: row.fileName, url: row.filePath });
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该爆破人员信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteStaff({
                  id: row.id,
                  blastCompanyId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '爆破人员信息删除成功!',
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
            if (!DATA.formData.id) {
              ElMessage({
                message: '请先填写保存爆破公司信息',
                type: 'warning',
              });
              return;
            }
            DATA.tableLoading = true;
            DATA.dialogFormData.expirationTime = filterTime(
              DATA.dialogFormData.expirationTime,
              '/'
            );
            if (DATA.dialogType) {
              let { data } = await createStaff({
                ...DATA.dialogFormData,
                blastCompanyId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '添加爆破人员信息成功',
                  type: 'success',
                });
                DATA.dialogVisible = false;
                DATA.tableData = data.data;
              }
            } else {
              delete DATA.dialogFormData.createTime;
              delete DATA.dialogFormData.updateTime;
              let { data } = await updateStaff({
                ...DATA.dialogFormData,
                blastCompanyId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '编辑爆破人员信息成功',
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
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.dialogFormData.fileId = res.data.id;
      },
      uploadRemove: () => {
        DATA.dialogFormData.fileId = null;
        DATA.fileList = [];
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.blastStaffInfoList;
      },
      {
        deep: true,
        immediate: true,
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
      METHODS.handleGetQualification();
      METHODS.handleGetBlastStaffJob();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formRef,
      dialogFormRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
</style>