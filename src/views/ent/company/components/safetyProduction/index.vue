<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>安全生产许可证信息</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            @click="disable=!disable"
            :disabled="!isDisable"
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
        :radios="radios"
        :isDisable="disable"
        ref="formRef"
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
      </EleForm>
    </el-col>
    <!-- 安全许可证 -->
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
        :btnList="btnList"
        :renderTable="renderTable"
        :isborder="true"
        v-loading="tableLoading"
        @handleBtnEvent="handleBtnEvent"
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
          ref="dialogFormRef"
        >
          <template #validity>
            <el-date-picker
              v-model="validityDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              @change="handleChangeDate"
            >
            </el-date-picker>
          </template>
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
import Region from '@/components/region/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { useStore } from 'vuex';
import { filterTime } from '@/utils/filtration';
import { ElMessage } from 'element-plus';
import { IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import {
  createSafetyLicense,
  createSafetyProductionInfo,
  deleteSafetyLicense,
  updateSafetyLicense,
  updateSafetyProductionInfo,
} from '@/api/company/safetyProduction';
export default defineComponent({
  components: { EleForm, EleTable, Region, EleUpload },
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
    let DATA: any = reactive({
      formData: {
        provinceCode: null,
        cityCode: null,
        countyCode: null,
        townCode: null,
        name: '',
        principal: '',
        address: '',
      },
      rules: {
        serviceLength: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
      },
      renderFormArr: [
        {
          label: '单位名称',
          prop: 'name',
          type: 'input',
          style: {
            width: '40%',
          },
        },
        {
          label: '主要负责人',
          prop: 'principal',
          type: 'input',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
        {
          label: '单位地址',
          type: 'slot',
          slotName: 'region',
          style: {
            width: '70%',
          },
        },
        {
          type: 'input',
          prop: 'address',
          labelWidth: '0px',
          placeholder: '详情地址',
          style: {
            width: '28%',
          },
        },
        {
          label: '经济类型',
          prop: 'economicType',
          type: 'select',
          value: 'value',
          title: 'name',
          style: {
            width: '40%',
          },
        },
        {
          label: '服务年限',
          prop: 'serviceLength',
          type: 'input',
          append: '年',
          style: {
            width: '40%',
          },
        },
        {
          label: '许可范围',
          prop: 'licenseScope',
          type: 'input',
          inputType: 'textarea',
          style: {
            width: '100%',
          },
        },
        {
          label: '是否注销',
          prop: 'isLogout',
          type: 'radio',
          value: 'value',
          title: 'title',
          style: {
            width: '100%',
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
      options: {},
      radios: {
        isLogout: [
          {
            title: '是',
            value: true,
          },
          {
            title: '否',
            value: false,
          },
        ],
      },
      disable: true,
      // 安全许可证
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
          label: '安全许可证号码',
          prop: 'code',
          type: 'text',
        },
        {
          label: '安全卫生许可证有效期',
          type: 'moreText',
          formatter: (row: any) => {
            return `${filterTime(row.startTime, '-', false)} - ${filterTime(
              row.endTime,
              '-',
              false
            )}`;
          },
        },
        {
          label: '发证机关',
          prop: 'unit',
          type: 'text',
        },
        {
          label: '扫描件',
          prop: 'filePath',
          type: 'file',
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
          label: '安全许可证号码',
          type: 'input',
          prop: 'code',
          labelWidth: 170,
        },
        {
          label: '安全卫生许可证有效期',
          type: 'slot',
          slotName: 'validity',
          prop: 'startTime',
          labelWidth: 170,
        },
        {
          label: '发证机关',
          type: 'input',
          prop: 'unit',
          labelWidth: 170,
        },
        {
          label: '扫描件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 170,
        },
      ],
      dialogRules: {
        code: [
          {
            required: true,
            message: '请输入安全许可证号码',
            trigger: 'blur',
          },
        ],
        startTime: [
          {
            required: true,
            message: '请选择安全卫生许可证有效期',
            trigger: 'change',
          },
        ],
        unit: [
          {
            required: true,
            message: '请输入核发单位',
            trigger: 'blur',
          },
        ],
      },
      fileList: [],
      tableLoading: false,
      validityDate: '',
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
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.companyInfoId) {
              if (DATA.formData.id) {
                let { data } = await updateSafetyProductionInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '安全生产许可证信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              } else {
                let { data } = await createSafetyProductionInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '安全生产许可证信息保存成功',
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
        DATA.dialogTitle = '添加安全生产许可证';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.fileList = [];
        DATA.dialogFormData = {};
        DATA.validityDate = '';
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑安全生产许可证';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
            DATA.validityDate = [row.startTime, row.endTime];
            DATA.dialogFormData.endTime = filterTime(row.endTime, '/');
            DATA.dialogFormData.startTime = filterTime(row.startTime, '/');
            DATA.fileList = [];
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
              .$confirm('是否确定删除该安全生产许可证?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteSafetyLicense({
                  id: row.id,
                  safetyProductionInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '安全生产许可证删除成功!',
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
            DATA.tableLoading = true;
            if (DATA.dialogType) {
              let { data } = await createSafetyLicense({
                ...DATA.dialogFormData,
                safetyProductionInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '添加安全生产许可证成功',
                  type: 'success',
                });
                DATA.dialogVisible = false;
                DATA.tableData = data.data;
              }
            } else {
              delete DATA.dialogFormData.createTime;
              delete DATA.dialogFormData.updateTime;
              let { data } = await updateSafetyLicense({
                ...DATA.dialogFormData,
                safetyProductionInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '编辑安全生产许可证成功',
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
        DATA.fileList = [];
        DATA.dialogFormData.fileId = null;
      },
      handleChangeDate: () => {
        if (DATA.validityDate != null && DATA.validityDate.length > 0) {
          DATA.dialogFormData.endTime = filterTime(DATA.validityDate[1], '/');
          DATA.dialogFormData.startTime = filterTime(DATA.validityDate[0], '/');
        } else {
          DATA.dialogFormData.endTime = null;
          DATA.dialogFormData.startTime = null;
        }
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.safetyProductionLicenseList;
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
      DATA.options.economicType = STORE.state.globalData.economicTypeList;
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