<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>营业执照信息</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            @click="disable = !disable"
            v-show="disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            :disabled="!isDisable"
            @click="handleSaveCompany"
            v-show="!disable"
          >保存</el-button>
        </div>
      </div>
      <ele-form
        :formData="formData"
        :rules="rules"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :options="options"
        :isDisable="disable"
        ref="companyInfoRef"
        v-loading="loading"
      >
        <template #region>
          <Region
            :province="formData.provinceCode"
            :city="formData.cityCode"
            :county="formData.countyCode"
            :town="formData.townCode"
            :isDisable="disable"
            @handleChangeProvince="handleChangeProvince"
            @handleChangeCity="handleChangeCity"
            @handleChangeCounty="handleChangeCounty"
            @handleChangeTown="handleChangeTown"
          />
        </template>
        <template #companyType>
          <el-select
            v-model="formData.type"
            :disabled="true"
          >
            <el-option
              :label="'工贸行业企业'"
              :value="4"
            ></el-option>
          </el-select>
        </template>
      </ele-form>
    </el-col>
    <el-col :span="24">
      <div class="mb-10 tar">
        <el-button
          type="primary"
          size="small"
          @click="handleCreateBusiness"
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
        >
          <!-- 文件上传 -->
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
          <!-- 营业执照有效期 -->
          <template #validity>
            <!-- <el-date-picker
              v-model="validityDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              @change="handleChangeDate"
            >
            </el-date-picker> -->
            <div class="d_flex">
              <el-date-picker
                v-model="dialogFormData.startTime"
                type="datetime"
                placeholder="选择开始日期时间"
                clearable
                style="flex: 4"
              >
              </el-date-picker>
              <span>&nbsp;至&nbsp; </span>
              <el-date-picker
                v-if="!isLongtime"
                v-model="dialogFormData.endTime"
                type="datetime"
                placeholder="选择结束日期时间"
                clearable
                style="flex: 4"
              >
              </el-date-picker>
              <el-input
                v-if="isLongtime"
                v-model="longTerm"
                style="flex: 4"
                disabled
              ></el-input>
              <el-select
                v-model="isLongtime"
                style="flex: 2; margin-left: 5px"
                placeholder="  "
                @change="handleChangeIsLongtime"
              >
                <el-option
                  v-for="item in isLongtimeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
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
import Region from '@/components/region/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { verifyEmail, verifyRelation } from '@/api/common/verify';
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import {
  createBusinessLicense,
  createCompany,
  deleteBusinessLicense,
  updateBusinessLicense,
  updateCompany,
} from '@/api/ent/trade';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleForm, Region, EleTable, EleUpload },
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
    const ROUTE = useRoute();
    const STORE = useStore();
    const companyInfoRef: any = ref(null);
    const dialogFormRef: any = ref(null);
    // 长期 - 日期 检验规则
    let validateTime = (rule: any, value: number, callback: any) => {
      if (!DATA.isLongtime) {
        if (!DATA.dialogFormData.endTime) {
          callback(new Error('请完整输入营业执照有效期'));
          return;
        }
        if (
          new Date(DATA.dialogFormData.startTime).getTime() >
          new Date(DATA.dialogFormData.endTime).getTime()
        ) {
          callback(new Error('营业执照有效期结束时间不能小于开始时间'));
          return;
        }
        callback();
      } else {
        callback();
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
      loading: false,
      tableLoading: false,
      formData: {
        address: '',
        businessScope: '',
        economicType: null,
        companyType: null,
        email: '',
        fax: '',
        legalPerson: '',
        legalPhone: '',
        name: '',
        phone: '',
        postalCode: '',
        isAuthorize: false,
        registerCapital: '',
        shortName: '',
        isEnable: true,
        provinceCode: null,
        cityCode: null,
        countyCode: null,
        riskLevel: 5,
        townCode: null,
        type: 4,
      },
      rules: {
        name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
        shortName: [
          { required: true, message: '请输入企业简称', trigger: 'blur' },
        ],
        legalPerson: [
          { required: true, message: '请输入法人代表', trigger: 'blur' },
        ],
        legalPhone: [
          // { required: true, message: '请输入法人联系方式', trigger: 'blur' },
          {
            pattern: verifyRelation,
            message: '联系方式格式不正确',
          },
        ],
        registerCapital: [
          { required: true, message: '请输入注册资本', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '请选择企业类型', trigger: 'change' },
        ],
        economicType: [
          { required: true, message: '请选择经济类型', trigger: 'change' },
        ],
        phone: [
          {
            pattern: verifyRelation,
            message: '联系方式格式不正确',
          },
        ],
        businessScope: [
          { required: true, message: '请输入经济范围', trigger: 'blur' },
        ],
        postalCode: [
          {
            pattern: /^[0-9]\d{5}(?!\d)$/,
            message: '邮政编码数据格式不正确',
          },
        ],
        fax: [
          {
            pattern: /^(?:\d{3,4}-)?\d{7,8}(?:-\d{1,6})?$/,
            message: '传真格式不正确',
          },
        ],
        email: [
          {
            pattern: verifyEmail,
            message: '邮箱格式不正确',
          },
        ],
      },
      renderFormArr: [
        {
          label: '企业名称',
          type: 'input',
          prop: 'name',
          style: {
            width: '40%',
          },
        },
        {
          label: '企业简称',
          type: 'input',
          prop: 'shortName',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
        {
          label: '法人代表',
          type: 'input',
          prop: 'legalPerson',
          style: {
            width: '40%',
          },
        },
        {
          label: '法人联系方式',
          type: 'input',
          prop: 'legalPhone',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
        {
          label: '企业类型',
          type: 'slot',
          slotName: 'companyType',
          style: {
            width: '40%',
          },
        },
        {
          label: '经济类型',
          type: 'select',
          prop: 'economicType',
          labelWidth: '120px',
          value: 'value',
          title: 'name',
          style: {
            width: '40%',
          },
        },
        {
          label: '注册资本',
          type: 'input',
          prop: 'registerCapital',
          style: {
            width: '40%',
          },
        },
        {
          label: '成立日期',
          type: 'date',
          prop: 'establishTime',
          labelWidth: '120px',
          placeholder: '成立日期',
          style: {
            width: '40%',
          },
        },
        {
          label: '经营范围',
          type: 'input',
          inputType: 'textarea',
          prop: 'businessScope',
          style: {
            width: '100%',
          },
        },
        {
          label: '企业注册地址',
          type: 'slot',
          slotName: 'region',
          style: {
            width: '70%',
          },
        },
        {
          type: 'input',
          prop: 'address',
          placeholder: '详细地址',
          labelWidth: '0',
          style: {
            width: '28%',
          },
        },
        {
          label: '邮政编码',
          type: 'input',
          prop: 'postalCode',
          style: {
            width: '40%',
          },
        },
        {
          label: '企业电话',
          type: 'input',
          prop: 'phone',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
        {
          label: '企业传真',
          type: 'input',
          prop: 'fax',
          style: {
            width: '40%',
          },
        },
        {
          label: '电子邮箱',
          type: 'input',
          prop: 'email',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
      ],
      options: {
        companyType: [],
        disabled: true,
      },
      disable: true,
      // 表格
      tableData: [],
      renderTable: [
        {
          label: '统一社会信用代码',
          type: 'text',
          prop: 'code',
        },
        {
          label: '营业执照有效期',
          type: 'text',
          formatter: (row: any) => {
            return `${filterTime(row.startTime, '-', false)} - ${
              row.endTime ? filterTime(row.endTime, '-', false) : '长期'
            }`;
          },
        },
        {
          label: '登记机关',
          type: 'text',
          prop: 'unit',
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
      btnList: [
        {
          handleType: 'edit',
          isShow: true,
          condition: (row: any) => {
            let btnOption = {
              text: '编辑',
              type: 'primary',
              isdisable: !props.isDisable,
              size: 'small',
            };
            return btnOption;
          },
        },
        {
          handleType: 'delete',
          isShow: true,
          condition: (row: any) => {
            let btnOption = {
              text: '删除',
              type: 'danger',
              isdisable: !props.isDisable,
              size: 'small',
            };
            return btnOption;
          },
        },
      ],
      // 添加、编辑模态框
      dialogTitle: '',
      dialogVisible: false,
      dialogFormData: {},
      isLongtime: null,
      longTerm: null,
      isLongtimeOptions: [
        {
          label: '日期',
          value: false,
        },
        {
          label: '长期',
          value: true,
        },
      ],
      dialogRenderFormArr: [
        {
          label: '统一社会信用代码',
          type: 'input',
          prop: 'code',
          labelWidth: 150,
        },
        {
          label: '营业执照有效期',
          type: 'slot',
          slotName: 'validity',
          prop: 'startTime',
          labelWidth: 150,
        },
        {
          label: '登记机关',
          type: 'input',
          prop: 'unit',
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
      dialogRules: {
        code: [
          {
            required: true,
            message: '请输入统一社会信用代码',
            trigger: 'blur',
          },
        ],
        startTime: [
          {
            required: true,
            message: '请完整输入营业执照有效期',
            trigger: 'change',
          },
          { validator: validateTime, trigger: 'change' },
        ],
        unit: [
          {
            required: true,
            message: '请输入登记机关',
            trigger: 'blur',
          },
        ],
      },
      dialogType: false,
      fileList: [],
    });
    let METHODS = reactive({
      // 切换营业执照省、市区
      handleChangeProvince: (province: number) => {
        DATA.formData.provinceCode = province;
      },
      handleChangeCity: (city: number) => {
        DATA.formData.cityCode = city;
      },
      handleChangeCounty: (county: number) => {
        DATA.formData.countyCode = county;
      },
      handleChangeTown: (town: number) => {
        DATA.formData.townCode = town;
      },

      handleChangeIsLongtime: () => {
        DATA.longTerm = DATA.isLongtime && '长期';
      },

      // 保存企业信息
      handleSaveCompany: () => {
        if (!DATA.formData.townCode) {
          ElMessage({
            message: '请填写完整企业注册地址',
            type: 'warning',
          });
          return;
        }
        proxy.$refs['companyInfoRef']
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              DATA.loading = true;
              // 修改
              DATA.formData.establishTime &&
                (DATA.formData.establishTime = filterTime(
                  DATA.formData.establishTime,
                  '/'
                ));
              if (DATA.formData.id) {
                DATA.formData.isAuthorize = false;
                DATA.formData.riskLevel = 5;
                let { data } = await updateCompany(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                  STORE.dispatch('handleGetAllCompany');
                  DATA.loading = false;
                  ElMessage({
                    message: '企业信息已录入',
                    type: 'success',
                  });
                  STORE.commit('setCompanyInfo', {
                    type: data.data.type,
                    companyId: data.data.id,
                  });
                }
                // 添加
              } else {
                DATA.formData.isAuthorize = false;
                DATA.formData.riskLevel = 5;
                let { data } = await createCompany(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  DATA.loading = false;
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                  STORE.dispatch('handleGetAllCompany');
                  ElMessage({
                    message: '企业信息已录入',
                    type: 'success',
                  });
                  await STORE.commit('setCompanyInfo', {
                    type: data.data.type,
                    companyId: data.data.id,
                  });
                }
              }
            }
          });
      },
      // 添加营业执照
      handleCreateBusiness: () => {
        if (STORE.state.globalData.companyInfo.companyId) {
          DATA.dialogTitle = '添加营业执照';
          DATA.dialogFormData = {};
          DATA.fileList = [];
          DATA.dialogVisible = true;
          DATA.isLongtime = false;
          DATA.longTerm = null;
          DATA.dialogType = true;
          nextTick(() => {
            dialogFormRef.value.clearForm();
          });
        } else {
          // 政府进入并进行刷新后, 是无STORE.state.globalData.companyInfo.companyId
          let companyId = sessionStorage.getItem('companyId');
          if (companyId) {
            DATA.dialogTitle = '添加营业执照';
            DATA.dialogFormData = {};
            DATA.fileList = [];
            DATA.dialogVisible = true;
            DATA.isLongtime = false;
            DATA.longTerm = null;
            DATA.dialogType = true;
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
          } else {
            // 营业执照信息未填写
            ElMessage({
              message: '请先填写营业执照',
              type: 'warning',
            });
          }
        }
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑营业执照';
            DATA.dialogFormData = Object.assign({}, { ...row });
            DATA.fileList = [];
            if (row.filePath) {
              DATA.fileList.push({ name: row.fileName, url: row.filePath });
            }
            // 长期判断
            if (row.longTerm === 1) {
              DATA.isLongtime = true;
              DATA.longTerm = '长期';
            } else {
              DATA.isLongtime = false;
              DATA.longTerm = null;
              DATA.dialogFormData.endTime = filterTime(row.endTime, '/');
            }
            DATA.dialogFormData.startTime = filterTime(row.startTime, '/');

            DATA.dialogVisible = true;
            DATA.dialogType = false;
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该营业执照?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteBusinessLicense({
                  id: row.id,
                  companyInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '营业执照删除成功!',
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
        dialogFormRef.value
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              DATA.tableLoading = true;
              if (DATA.isLongtime) {
                DATA.dialogFormData.longTerm = 1;
                DATA.dialogFormData.endTime = undefined;
              } else {
                DATA.dialogFormData.longTerm = null;
                DATA.dialogFormData.endTime = filterTime(
                  DATA.dialogFormData.endTime,
                  '/'
                );
              }
              DATA.dialogFormData.startTime = filterTime(
                DATA.dialogFormData.startTime,
                '/'
              );
              delete DATA.dialogFormData.validity;
              if (DATA.dialogType) {
                let { data } = await createBusinessLicense({
                  ...DATA.dialogFormData,
                  companyInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '添加营业执照成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              } else {
                // delete DATA.dialogFormData.createTime;
                // delete DATA.dialogFormData.updateTime;
                let { data } = await updateBusinessLicense({
                  ...DATA.dialogFormData,
                  companyInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '编辑营业执照成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              }
            }
          })
          .catch((error: any) => {});
      },
      uploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });

        DATA.dialogFormData.fileId = res.data.id;
        DATA.dialogFormData.fileName = res.data.name;
        DATA.dialogFormData.filePath = res.data.path;
      },
      //移除照片
      uploadRemove: (file: any, fileList: any) => {
        DATA.fileList = [];
        if (!fileList.length) {
          DATA.dialogFormData.fileId = null;
        }
      },
    });

    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.businessLicenseList;
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
    onMounted(async () => {
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);
      DATA.options.economicType = STORE.state.globalData.economicTypeList;

      // if(STORE.state.globalData.companyInfo.companyId){
      //   localStorage.setItem('companyId',STORE.state.globalData.companyInfo.companyId)
      // }
      // console.log(2222,STORE.state.globalData.companyInfo.companyId);

      //   METHODS.handleGetCompanyType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      companyInfoRef,
      dialogFormRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
a {
  display: inline-block;
}
</style>