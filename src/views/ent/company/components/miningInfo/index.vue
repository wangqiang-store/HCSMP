<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>采矿许可证信息</h3>
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
        :options="options"
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
            ref="regionRef"
          />
        </template>
        <template #miningDepth>
          <div class="d_flex">
            <el-input
              type="text"
              :disabled="disable"
              clearable
              v-model="formData.startDepth"
            >
              <template #append>米</template>
            </el-input>
            <span class="ml-5 mr-5"> - </span>
            <el-input
              type="text"
              :disabled="disable"
              v-model="formData.endDepth"
              clearable
            >
              <template #append>米</template>
            </el-input>
          </div>
        </template>
      </ele-form>
    </el-col>
    <!-- 采矿许可证 -->
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
        @handleBtnEvent="handleBtnEvent"
        v-loading='tableLoading'
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
import Region from '@/components/region/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { filterTime } from '@/utils/filtration';
import { verifyPositive } from '@/api/common/verify';
import {
  createLicense,
  createMiningInfo,
  deleteLicense,
  updateLicense,
  updateMiningInfo,
} from '@/api/company/miningInfo';
import {
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
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
    const STORE = useStore();
    const regionRef: any = ref(null);
    const formRef: any = ref(null);
    const dialogFormRef: any = ref(null);
    let DATA: any = reactive({
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      formData: {
        provinceCode: null,
        cityCode: null,
        countyCode: null,
        townCode: null,
        rightHolder: '',
        name: '',
        address: '',
        productionScale: '',
        acreage: '',
        mineType: '',
        startDepth: '',
        endDepth: '',
      },
      rules: {
        acreage: [
          {
            pattern: verifyPositive,
            message: '数据格式为正整数或精确2个小数点',
          },
        ],
        productionScale: [
          {
            pattern: verifyPositive,
            message: '数据格式为正整数或精确2个小数点',
          },
        ],
      },
      renderFormArr: [
        {
          label: '采矿权人',
          type: 'input',
          prop: 'rightHolder',
          style: {
            width: '40%',
          },
        },
        {
          label: '矿山名称',
          type: 'input',
          prop: 'name',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
        {
          label: '地址',
          type: 'slot',
          slotName: 'region',
          style: {
            width: '70%',
          },
        },
        {
          type: 'input',
          prop: 'address',
          labelWidth: '0',
          placeholder: '详细地址',
          style: {
            width: '28%',
          },
        },
        {
          label: '生产规模',
          type: 'input',
          append: '万吨/年',
          prop: 'productionScale',
          style: {
            width: '40%',
          },
        },
        {
          label: '矿区面积',
          type: 'input',
          prop: 'acreage',
          labelWidth: '120px',
          append: 'km²',
          style: {
            width: '40%',
          },
        },
        {
          label: '开采矿种',
          type: 'select',
          prop: 'mineType',
          value: 'value',
          title: 'name',
          style: {
            width: '40%',
          },
        },
        {
          label: '开采深度',
          type: 'slot',
          slotName: 'miningDepth',
          labelWidth: '120px',
          style: {
            width: '40%',
          },
        },
      ],
      options: {},
      disable: true,
      // 采矿许可证
      tableData: [],
      btnList: [
        {
          type: 'primary',
          handleType: 'edit',
          text: '编辑',
          size: 'small',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
        {
          type: 'danger',
          handleType: 'delete',
          text: '删除',
          size: 'small',
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
      ],
      renderTable: [
        {
          label: '采矿许可证号码',
          type: 'text',
          prop: 'code',
        },
        {
          label: '采矿许可证有效期',
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
          label: '核发单位',
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
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      dialogRenderFormArr: [
        {
          label: '采矿许可证号码',
          type: 'input',
          prop: 'code',
          labelWidth: 150,
        },
        {
          label: '采矿许可证有效期',
          type: 'slot',
          slotName: 'validity',
          prop: 'startTime',
          labelWidth: 150,
        },
        {
          label: '核发单位',
          type: 'input',
          prop: 'unit',
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
        code: [
          {
            required: true,
            message: '请输入采矿许可证号码',
            trigger: 'blur',
          },
        ],
        startTime: [
          {
            required: true,
            message: '请选择采矿许可证有效期',
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
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.startDepth || DATA.formData.endDepth) {
              if (
                !verifyPositive.test(DATA.formData.startDepth) ||
                !verifyPositive.test(DATA.formData.endDepth)
              ) {
                ElMessage({
                  message: '采矿深度为正整数或精确2个小数点',
                  type: 'warning',
                });
                return;
              }
            }
            if (DATA.formData.companyInfoId) {
              let {
                province: provinceCode,
                city: cityCode,
                county: countyCode,
                town: townCode,
              } = regionRef.value;
              if (DATA.formData.id) {
                let { data } = await updateMiningInfo({
                  ...DATA.formData,
                  provinceCode,
                  cityCode,
                  countyCode,
                  townCode,
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '采矿许可证保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              } else {
                let { data } = await createMiningInfo({
                  ...DATA.formData,
                  provinceCode,
                  cityCode,
                  countyCode,
                  townCode,
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '采矿许可证保存成功',
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
      //获取开采矿种
      handleGetMineType: async () => {
        if (sessionRead('t_mine_type')) {
          DATA.options.mineType = sessionRead('t_mine_type');
        } else {
          let { data } = await getByKey({ key: 't_mine_type' });
          DATA.options.mineType = data.data;
          sessionWrite('t_mine_type', data.data);
        }
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加采矿许可证';
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
            DATA.dialogTitle = '编辑采矿许可证';
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
              .$confirm('是否确定删除该采矿许可证?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteLicense({
                  id: row.id,
                  miningInfoId: DATA.formData.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '采矿许可证删除成功!',
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
                message: '请先填写保存采矿许可证信息',
                type: 'warning',
              });
              return;
            }
            // if (!DATA.dialogFormData.fileId) {
            //   ElMessage({
            //     message: '请选择扫描件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            DATA.tableLoading = true;
            // delete DATA.dialogFormData.validity;
            if (DATA.dialogType) {
              let { data } = await createLicense({
                ...DATA.dialogFormData,
                miningInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '添加采矿许可证成功',
                  type: 'success',
                });
                DATA.dialogVisible = false;
                DATA.tableData = data.data;
              }
            } else {
              delete DATA.dialogFormData.createTime;
              delete DATA.dialogFormData.updateTime;
              let { data } = await updateLicense({
                ...DATA.dialogFormData,
                miningInfoId: DATA.formData.id,
              });
              if (data.code === RES_SUCCESS) {
                DATA.tableLoading = false;
                ElMessage({
                  message: '编辑采矿许可证成功',
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
        DATA.tableData = props.formData.miningLicenseList;
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
      METHODS.handleGetMineType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
      formRef,
      regionRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
</style>