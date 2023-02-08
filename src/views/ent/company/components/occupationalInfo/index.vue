<template>
  <el-row>
    <el-col :span="24">
      <h3 class="mb-20">职业卫生信息</h3>
      <el-tabs
        tab-position="top"
        type="card"
        v-model="activeName"
      >
        <el-tab-pane
          label="单位检测"
          name="first"
        >
          <div class="w-100 d_flex d_flex_end mb-10">
            <el-button
              type="primary"
              size="small"
              :disabled="!isDisable"
              @click="handleUnitTestCreate"
            >添加</el-button>
          </div>
          <ele-table
            :tableData="unitTestTableData"
            :renderTable="unitTestRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleUnitTestBtnEvent"
            v-loading="unitTestTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="unitTestTitle"
            v-model="unitTestVisible"
            width="40%"
          >
            <ele-form
              :formData="unitTestFormData"
              :renderFormArr="unitTestRenderFormArr"
              :rules="unitTestRules"
              ref="unitTestFormRef"
            >
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="unitTestVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmunitTest"
                >确 定</el-button>
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane
          label="职业健康体检"
          name="two"
        >
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleCreateOccupation"
                :disabled="!isDisable"
              >添加</el-button>
            </div>
          </div>
          <ele-table
            :tableData="occupationTableData"
            :renderTable="occupationRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleOccupationBtnEvent"
            v-loading="occupationTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="occupationTitle"
            v-model="occupationVisible"
            width="40%"
          >
            <ele-form
              :formData="occupationFormData"
              :renderFormArr="occupationRenderFormArr"
              :rules="occupationRules"
              ref="occupationFormRef"
            >
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="occupationVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmOccupation"
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
import { RES_SUCCESS } from '@/api/common/common';
import {
  createOcTest,
  createUnitTest,
  deleteOcTest,
  deleteUnitTest,
  updateOcTest,
  updateUnitTest,
} from '@/api/company/occupationalInfo';
import EleForm from '@/components/eleForm/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import { filterTime } from '@/utils/filtration';
import { ElMessage } from 'element-plus';
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useStore } from 'vuex';
export default defineComponent({
  components: { EleForm, EleTable },
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
    let unitTestFormRef: any = ref(null);
    let occupationFormRef: any = ref(null);
    let DATA: any = reactive({
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
      // 单位检测
      unitTestTableData: [],
      unitTestRenderTable: [
        {
          label: '检测单位',
          type: 'text',
          prop: 'unit',
        },
        {
          label: '资质编号',
          type: 'text',
          prop: 'qualificationCode',
        },
        {
          label: '报告编号',
          type: 'text',
          prop: 'reportCode',
        },
        {
          label: '检测日期',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.time, '-', false);
          },
        },
        {
          label: '检测结论',
          type: 'text',
          prop: 'conclusion',
        },
        {
          label: '处理情况',
          type: 'text',
          prop: 'process',
        },
        {
          label: '备注',
          type: 'text',
          prop: 'remark',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      unitTestTableLoading: false,
      // 添加、编辑
      unitTestTitle: '',
      unitTestVisible: false,
      unitTestType: false,
      unitTestFormData: {},
      unitTestRenderFormArr: [
        {
          label: '检测单位',
          type: 'input',
          prop: 'unit',
          labelWidth: 120,
        },
        {
          label: '资质编号',
          type: 'input',
          prop: 'qualificationCode',
          labelWidth: 120,
        },
        {
          label: '报告编号',
          type: 'input',
          prop: 'reportCode',
          labelWidth: 120,
        },
        {
          label: '检测日期',
          type: 'date',
          prop: 'time',
          placeholder: '选择检测日期',
          labelWidth: 120,
        },
        {
          label: '检测结论',
          type: 'input',
          inputType: 'textarea',
          prop: 'conclusion',
          labelWidth: 120,
        },
        {
          label: '处理情况',
          type: 'input',
          inputType: 'textarea',
          prop: 'process',
          labelWidth: 120,
        },
        {
          label: '备注',
          type: 'input',
          inputType: 'textarea',
          prop: 'remark',
          labelWidth: 120,
        },
      ],
      unitTestRules: {
        unit: [
          {
            required: true,
            message: '请输入检测单位',
            trigger: 'change',
          },
        ],
        qualificationCode: [
          {
            required: true,
            message: '请输入资质编号',
            trigger: 'blur',
          },
        ],
        reportCode: [
          {
            required: true,
            message: '请输入报告编号',
            trigger: 'blur',
          },
        ],
        time: [
          {
            required: true,
            message: '请选择检测日期',
            trigger: 'change',
          },
        ],
      },
      // 职业健康体检
      occupationTableData: [],
      occupationRenderTable: [
        {
          label: '承检单位',
          type: 'text',
          prop: 'unit',
        },
        {
          label: '体检日期',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.healthTime, '-', false);
          },
        },
        {
          label: '报告日期',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.reportTime, '-', false);
          },
        },
        {
          label: '受检人数',
          type: 'text',
          prop: 'sum',
        },
        {
          label: '检测结论',
          type: 'text',
          prop: 'conclusion',
        },
        {
          label: '复检及处理情况',
          type: 'text',
          prop: 'process',
        },
        {
          label: '备注',
          type: 'text',
          prop: 'remark',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      occupationTableLoading: false,
      // 添加、编辑
      occupationTitle: '',
      occupationVisible: false,
      occupationType: false,
      occupationFormData: {},
      occupationRenderFormArr: [
        {
          label: '承检单位',
          type: 'input',
          prop: 'unit',
          labelWidth: 120,
        },
        {
          label: '体检日期',
          type: 'date',
          prop: 'healthTime',
          placeholder: '选择体检日期',
          labelWidth: 120,
        },
        {
          label: '报告日期',
          type: 'date',
          prop: 'reportTime',
          placeholder: '选择报告日期',
          labelWidth: 120,
        },
        {
          label: '受检人数',
          type: 'input',
          prop: 'sum',
          labelWidth: 120,
        },
        {
          label: '检查结论',
          type: 'input',
          inputType: 'textarea',
          prop: 'conclusion',
          labelWidth: 120,
        },
        {
          label: '复检及处理情况',
          type: 'input',
          inputType: 'textarea',
          prop: 'process',
          labelWidth: 120,
        },
        {
          label: '备注',
          type: 'input',
          inputType: 'textarea',
          prop: 'remark',
          labelWidth: 120,
        },
      ],
      occupationRules: {
        unit: [
          {
            required: true,
            message: '请输入承检单位',
            trigger: 'blur',
          },
        ],
        healthTime: [
          {
            required: true,
            message: '请选择体检日期',
            trigger: 'change',
          },
        ],
        reportTime: [
          {
            required: true,
            message: '请选择报告日期',
            trigger: 'change',
          },
        ],
        sum: [
          {
            required: true,
            message: '请输入受检人数',
            trigger: 'blur',
          },
        ],
      },
    });
    let METHODS = reactive({
      // 添加单位检测
      handleUnitTestCreate: () => {
        DATA.unitTestTitle = '添加单位检测';
        DATA.unitTestType = true;
        DATA.unitTestVisible = true;
        DATA.unitTestFormData = {};
        nextTick(() => {
          unitTestFormRef.value.clearForm();
        });
      },
      // 单位检测操作按钮
      handleUnitTestBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.unitTestTitle = '编辑单位检测';
            DATA.unitTestType = false;
            DATA.unitTestVisible = true;
            DATA.unitTestFormData = Object.assign({}, row);
            nextTick(() => {
              unitTestFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该单位检测?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteUnitTest({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '单位检测删除成功!',
                  });
                  DATA.unitTestTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmunitTest: () => {
        unitTestFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照基本信息',
                type: 'warning',
              });
              return;
            }
            DATA.unitTestFormData.time = filterTime(
              DATA.unitTestFormData.time,
              '/'
            );
            DATA.unitTestTableLoading = true;
            if (DATA.unitTestType) {
              let { data } = await createUnitTest({
                ...DATA.unitTestFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.unitTestTableLoading = false;
                ElMessage({
                  message: '添加单位检测成功',
                  type: 'success',
                });
                DATA.unitTestVisible = false;
                DATA.unitTestTableData = data.data;
              }
            } else {
              delete DATA.unitTestFormData.createTime;
              delete DATA.unitTestFormData.updateTime;
              let { data } = await updateUnitTest({
                ...DATA.unitTestFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.unitTestTableLoading = false;
                ElMessage({
                  message: '编辑单位检测成功',
                  type: 'success',
                });
                DATA.unitTestVisible = false;
                DATA.unitTestTableData = data.data;
              }
            }
          }
        });
      },
      // 添加职业健康体检
      handleCreateOccupation: () => {
        DATA.occupationTitle = '添加职业健康体检';
        DATA.occupationType = true;
        DATA.occupationVisible = true;
        DATA.occupationFormData = {};
        nextTick(() => {
          occupationFormRef.value.clearForm();
        });
      },
      // 职业健康体检操作按钮
      handleOccupationBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.occupationTitle = '编辑职业健康体检';
            DATA.occupationType = false;
            DATA.occupationVisible = true;
            DATA.occupationFormData = Object.assign({}, row);
            nextTick(() => {
              occupationFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该职业健康体检?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteOcTest({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '职业健康体检删除成功!',
                  });
                  DATA.occupationTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmOccupation: () => {
        occupationFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照基本信息',
                type: 'warning',
              });
              return;
            }
            DATA.occupationFormData.healthTime = filterTime(
              DATA.occupationFormData.healthTime,
              '/'
            );
            DATA.occupationFormData.reportTime = filterTime(
              DATA.occupationFormData.reportTime,
              '/'
            );
            DATA.occupationTableLoading = true;
            if (DATA.occupationType) {
              let { data } = await createOcTest({
                ...DATA.occupationFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.occupationTableLoading = false;
                ElMessage({
                  message: '添加单位检测成功',
                  type: 'success',
                });
                DATA.occupationVisible = false;
                DATA.occupationTableData = data.data;
              }
            } else {
              delete DATA.occupationFormData.createTime;
              delete DATA.occupationFormData.updateTime;
              let { data } = await updateOcTest({
                ...DATA.occupationFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.occupationTableLoading = false;
                ElMessage({
                  message: '编辑单位检测成功',
                  type: 'success',
                });
                DATA.occupationVisible = false;
                DATA.occupationTableData = data.data;
              }
            }
          }
        });
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.unitTestTableData = props.formData.unitHealthTest;
        DATA.occupationTableData = props.formData.occupationalHealthTest;
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
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      unitTestFormRef,
      occupationFormRef,
    };
  },
});
</script>
<style scoped lang="scss">
/deep/ .el-tabs__nav-wrap {
  display: flex;
  justify-content: center;
}
</style>