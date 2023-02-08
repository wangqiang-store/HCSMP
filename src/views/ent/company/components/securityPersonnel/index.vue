<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>安全人员信息</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            v-show="disable"
            @click="disable=!disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            v-show="!disable"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
      <ele-form
        :formData="formData"
        :rules="rules"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :isDisable="disable"
        ref="formRef"
      >
        <template #drawing>
          <EleUpload
            :imageList="imageList"
            @uploadSuccess="uploadSuccess"
            @uploadRemove="uploadRemove"
            :disabled="disable"
            :class="{imgAndVideo:disable}"
          />
        </template>
      </ele-form>
    </el-col>
    <el-col :span="24">
      <el-tabs
        tab-position="top"
        v-model="activeName"
        type="card"
      >
        <el-tab-pane
          label="人员明细"
          name="first"
        >
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleStaffInfoCreate"
                :disabled="!isDisable || !formData.id"
              >添加</el-button>
            </div>
          </div>
          <ele-table
            :tableData="staffInfoTableData"
            :renderTable="staffInfoRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleStaffInfoBtnEvent"
            v-loading="staffInfoTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="staffInfoTitle"
            v-model="staffInfoVisible"
            width="40%"
          >
            <ele-form
              :formData="staffInfoFormData"
              :renderFormArr="staffInfoRenderFormArr"
              :rules="staffInfoRules"
              :options="staffInfoOption"
              ref="staffInfoFormRef"
            >
              <template #scanning>
                <!-- <EleUpload
                  :imageList="fileList"
                  @uploadSuccess="staffInfoUploadSuccess"
                  @uploadRemove="staffInfoUploadRemove"
                /> -->
                <el-upload
                  class="upload-demo"
                  drag
                  :action="IMG_URL"
                  :headers="getItemtoken"
                  :on-remove="staffInfoUploadRemove"
                  :on-success="staffInfoUploadSuccess"
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
                <el-button @click="staffInfoVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmStaffInfo"
                >确 定</el-button>
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane
          label="人员培训"
          name="two"
        >
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleCreateTrain"
                :disabled="!isDisable || !formData.id"
              >添加</el-button>
            </div>
          </div>
          <ele-table
            :tableData="trainTableData"
            :renderTable="trainRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleTrainBtnEvent"
            v-loading="trainTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="trainTitle"
            v-model="trainVisible"
            width="40%"
          >
            <ele-form
              :formData="trainFormData"
              :renderFormArr="trainRenderFormArr"
              :rules="trainRules"
              ref="trainFormRef"
            >
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="trainVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmTrain"
                >确 定</el-button>
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
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
import EleUpload from '@/components/eleUpload/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import {
  createSafeStaff,
  createStaffInfo,
  createTraining,
  deleteStaffInfo,
  deleteTraining,
  updateSafeStaff,
  updateStaffInfo,
  updateTraining,
} from '@/api/company/securityPersonnel';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import {
  findById,
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
import { verifyIdCard, verifyPassport, verifyPhone } from '@/api/common/verify';
export default defineComponent({
  components: { EleForm, EleUpload, EleTable },
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
    let staffInfoFormRef: any = ref(null);
    let trainFormRef: any = ref(null);
    var validateIdCard = (rule: any, value: any, callback: any) => {
      if (value === '' || value === null || value === undefined) {
        callback();
      } else {
        if (verifyIdCard.test(value) || verifyPassport.test(value)) {
          callback();
        } else {
          callback('身份证号码或护照格式不正确');
        }
      }
    };
    let DATA: any = reactive({
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      formData: {},
      rules: {
        employeeSum: [
          {
            pattern: /^\d+$/,
            message: '数据格式为正整数数字',
          },
        ],
        safeManagerSum: [
          {
            pattern: /^\d+$/,
            message: '数据格式为正整数数字',
          },
        ],
        safeEngineerSum: [
          {
            pattern: /^\d+$/,
            message: '数据格式为正整数数字',
          },
        ],
        specialOperationSum: [
          {
            pattern: /^\d+$/,
            message: '数据格式为正整数数字',
          },
        ],
        outsourceSum: [
          {
            pattern: /^\d+$/,
            message: '数据格式为正数数字',
          },
        ],
      },
      renderFormArr: [
        {
          label: '从业人数',
          type: 'input',
          prop: 'employeeSum',
          labelWidth: '150px',
          append: '人',
          style: {
            width: '40%',
          },
        },
        {
          label: '专职安全管理人数',
          type: 'input',
          prop: 'safeManagerSum',
          labelWidth: '150px',
          append: '人',
          style: {
            width: '40%',
          },
        },
        {
          label: '注册安全工程师人数',
          type: 'input',
          prop: 'safeEngineerSum',
          append: '人',
          labelWidth: '150px',
          style: {
            width: '40%',
          },
        },
        {
          label: '特种作业人数',
          type: 'input',
          prop: 'specialOperationSum',
          append: '人',
          labelWidth: '150px',
          style: {
            width: '40%',
          },
        },
        {
          label: '外包队伍人数',
          type: 'input',
          prop: 'outsourceSum',
          append: '人',
          labelWidth: '150px',
          style: {
            width: '40%',
          },
        },
        {
          label: '安全机构设置(图)',
          type: 'slot',
          slotName: 'drawing',
          labelWidth: '150px',
          style: {
            width: '100%',
          },
        },
      ],
      imageList: [],
      disable: true,
      staffTrainingTableData: [],
      activeName: 'first',
      btnList: [
        {
          text: '编辑',
          type: 'primary',
          size: 'small',
          handleType: 'edit',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
        {
          text: '删除',
          type: 'danger',
          size: 'small',
          handleType: 'delete',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
      ],
      // 人员明细
      staffInfoTableData: [],
      staffInfoRenderTable: [
        {
          label: '姓名',
          type: 'text',
          prop: 'name',
        },
        {
          label: '岗位',
          type: 'text',
          prop: 'job',
          formatter: (row: any) => {
            let job = '';
            DATA.staffInfoOption.job?.forEach((item: any) => {
              if (row.job === item.value) {
                job = item.name;
              }
            });
            return job;
          },
        },
        {
          label: '电话',
          type: 'text',
          prop: 'phone',
        },
        {
          label: '身份证号(护照号)',
          type: 'text',
          prop: 'idCard',
        },
        {
          label: '资格证书',
          type: 'text',
          prop: 'certificate',
        },
        {
          label: '证书编号',
          type: 'text',
          prop: 'certificateCode',
        },
        {
          label: '证书有效期',
          type: 'text',
          prop: 'expirationTime',
          formatter: (row: any) => {
            return filterTime(row.expirationTime, '-', false);
          },
        },
        {
          label: '扫描件',
          prop: 'filePath',
          type: 'file',
          href: 'filePath',
          name: 'fileName',
        },
        {
          label: '年审信息',
          type: 'text',
          prop: 'annualReviewInfo',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      staffInfoTableLoading: false,
      // 添加、编辑
      staffInfoOption: {},
      fileList: [],
      staffInfoTitle: '',
      staffInfoVisible: false,
      staffInfoType: false,
      staffInfoFormData: {},
      staffInfoRenderFormArr: [
        {
          label: '姓名',
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
          placeholder: '证书有效期',
          labelWidth: 150,
        },
        {
          label: '年审信息',
          type: 'input',
          prop: 'annualReviewInfo',
          inputType: 'textarea',
          labelWidth: 150,
        },
        {
          label: '扫描件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 150,
        },
      ],
      staffInfoRules: {
        name: [
          {
            required: true,
            message: '请输入姓名',
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
        idCard: [{ validator: validateIdCard, trigger: 'change' }],
      },
      // 人员培训
      trainTableData: [],
      trainRenderTable: [
        {
          label: '人员名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '培训时间',
          type: 'text',
          prop: 'trainingTime',
          formatter: (row: any) => {
            return filterTime(row.trainingTime, '-', false);
          },
        },
        {
          label: '培训内容',
          type: 'text',
          prop: 'content',
        },
        {
          label: '考核结果',
          type: 'text',
          prop: 'result',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      trainTableLoading: false,
      // 添加、编辑
      trainTitle: '',
      trainVisible: false,
      trainType: false,
      trainFormData: {},
      trainRenderFormArr: [
        {
          label: '人员名称',
          type: 'input',
          prop: 'name',
          labelWidth: 150,
        },
        {
          label: '培训时间',
          type: 'date',
          prop: 'trainingTime',
          placeholder: '培训时间',
          labelWidth: 150,
        },
        {
          label: '培训内容',
          type: 'input',
          prop: 'content',
          inputType: 'textarea',
          labelWidth: 150,
        },
        {
          label: '考核结果',
          type: 'input',
          prop: 'result',
          inputType: 'textarea',
          labelWidth: 150,
        },
      ],
      trainRules: {
        name: [
          {
            required: true,
            message: '请输入人员名称',
            trigger: 'blur',
          },
        ],
        trainingTime: [
          {
            required: true,
            message: '请选择培训时间',
            trigger: 'change',
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取人员明细岗位
      handleGetJob: async () => {
        if (sessionRead('t_staff_job')) {
          DATA.staffInfoOption.job = sessionRead('t_staff_job');
        } else {
          let { data } = await getByKey({ key: 't_staff_job' });
          if (data.code === RES_SUCCESS) {
            DATA.staffInfoOption.job = data.data;
            sessionWrite('t_staff_job', data.data);
          }
        }
      },
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.companyInfoId) {
              if (DATA.formData.id) {
                let { data } = await updateSafeStaff(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '安全人员信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              } else {
                let { data } = await createSafeStaff(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '安全人员信息保存成功',
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
      uploadSuccess: (res: any) => {
        DATA.imageList = [];
        DATA.formData.safeOrgSetFile = res.data.id;
        DATA.imageList.push({
          url: IMG_File + res.data.path,
        });
      },
      uploadRemove: () => {
        DATA.imageList = [];
        DATA.formData.safeOrgSetFile = null;
      },
      // 人员明细
      handleStaffInfoCreate: () => {
        DATA.staffInfoTitle = '添加人员明细信息';
        DATA.staffInfoType = true;
        DATA.staffInfoVisible = true;
        DATA.fileList = [];
        DATA.staffInfoFormData = {};
        nextTick(() => {
          staffInfoFormRef.value.clearForm();
        });
      },
      handleStaffInfoBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.staffInfoTitle = '编辑人员明细信息';
            DATA.staffInfoType = false;
            DATA.staffInfoVisible = true;
            DATA.staffInfoFormData = Object.assign({}, row);
            DATA.fileList = [];
            row.fileId &&
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });
            nextTick(() => {
              staffInfoFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该人员明细信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteStaffInfo({
                  id: row.id,
                  safeStaffInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '人员明细信息删除成功!',
                  });
                  DATA.staffInfoTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmStaffInfo: () => {
        staffInfoFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照基本信息',
                type: 'warning',
              });
              return;
            }
            if (!DATA.formData.id) {
              ElMessage({
                message: '请先填写保存安全人员信息',
                type: 'warning',
              });
              return;
            }
            if (DATA.staffInfoFormData.expirationTime) {
              DATA.staffInfoFormData.expirationTime = filterTime(
                DATA.staffInfoFormData.expirationTime,
                '/'
              );
            } else {
              DATA.staffInfoFormData.expirationTime = undefined;
            }

            DATA.staffInfoTableLoading = true;
            if (DATA.staffInfoType) {
              let { data } = await createStaffInfo({
                ...DATA.staffInfoFormData,
                safeStaffInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.staffInfoTableLoading = false;
                ElMessage({
                  message: '添加人员明细信息成功',
                  type: 'success',
                });
                DATA.staffInfoVisible = false;
                DATA.staffInfoTableData = data.data;
              }
            } else {
              delete DATA.staffInfoFormData.createTime;
              delete DATA.staffInfoFormData.updateTime;
              let { data } = await updateStaffInfo({
                ...DATA.staffInfoFormData,
                safeStaffInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.staffInfoTableLoading = false;
                ElMessage({
                  message: '编辑人员明细信息成功',
                  type: 'success',
                });
                DATA.staffInfoVisible = false;
                DATA.staffInfoTableData = data.data;
              }
            }
          }
        });
      },
      staffInfoUploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.staffInfoFormData.fileId = res.data.id;
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
      },
      staffInfoUploadRemove: () => {
        DATA.fileList = [];
        DATA.staffInfoFormData.fileId = null;
      },
      // 人员培训
      handleCreateTrain: () => {
        DATA.trainTitle = '添加人员培训信息';
        DATA.trainType = true;
        DATA.trainVisible = true;
        DATA.trainFormData = {};
        nextTick(() => {
          trainFormRef.value.clearForm();
        });
      },
      handleTrainBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.trainTitle = '编辑人员培训信息';
            DATA.trainType = false;
            DATA.trainVisible = true;
            DATA.trainFormData = Object.assign({}, row);
            // DATA.trainImageList = [];
            // DATA.trainImageList.push({
            //   name: row.fileName,
            //   url: IMG_File + row.filePath,
            // });
            nextTick(() => {
              trainFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该人员培训信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteTraining({
                  id: row.id,
                  safeStaffInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '人员培训信息删除成功!',
                  });
                  DATA.trainTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmTrain: () => {
        trainFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照基本信息',
                type: 'warning',
              });
              return;
            }
            if (!DATA.formData.id) {
              ElMessage({
                message: '请先填写保存安全人员信息',
                type: 'warning',
              });
              return;
            }
            DATA.trainFormData.trainingTime &&
              (DATA.trainFormData.trainingTime = filterTime(
                DATA.trainFormData.trainingTime,
                '/'
              ));
            DATA.trainTableLoading = true;
            if (DATA.trainType) {
              let { data } = await createTraining({
                ...DATA.trainFormData,
                safeStaffInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.trainTableLoading = false;
                ElMessage({
                  message: '添加人员培训信息成功',
                  type: 'success',
                });
                DATA.trainVisible = false;
                DATA.trainTableData = data.data;
              }
            } else {
              delete DATA.trainFormData.createTime;
              delete DATA.trainFormData.updateTime;
              let { data } = await updateTraining({
                ...DATA.trainFormData,
                safeStaffInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.trainTableLoading = false;
                ElMessage({
                  message: '编辑人员培训信息成功',
                  type: 'success',
                });
                DATA.trainVisible = false;
                DATA.trainTableData = data.data;
              }
            }
          }
        });
      },
    });
    watch(
      () => props.formData,
      async () => {
        DATA.formData = Object.assign({}, props.formData);
        if (props.formData.safeOrgSetFile) {
          let { data } = await findById({ id: props.formData.safeOrgSetFile });
          if (data.code === RES_SUCCESS) {
            DATA.imageList.push({
              url: IMG_File + data.data?.path,
            });
          }
        }
        DATA.staffInfoTableData = props.formData.staffInfoList;
        DATA.trainTableData = props.formData.staffTrainingList;
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
      METHODS.handleGetJob();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formRef,
      staffInfoFormRef,
      trainFormRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
.imgAndVideo:hover /deep/.el-upload{
  cursor: not-allowed;
  border: 1px dotted #cfd8e3;
}
</style>