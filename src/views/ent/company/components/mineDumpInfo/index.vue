<template>
  <el-row>
    <el-col
      :span="24"
      class="mb-10"
    >
      <div class="w-100 d_flex d_flex_sb mb-10">
        <h3>矿山排土场信息</h3>
      </div>
      <el-form
        ref="form"
        :model="dumpFormData"
        label-width="130px"
      >
        <el-form-item label="是否存在排土场">
          <el-radio-group
            v-model="dumpFormData.isDump"
            @change="handleChangeIsDump"
            :disabled="!isDisable"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col
      :span="24"
      v-if="dumpFormData.isDump"
    >
      <div class="w-100 d_flex d_flex_end mb-10">
        <el-button
          type="primary"
          size="small"
          :disabled="!isDisable"
          @click="handleCreate"
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
        width="45%"
      >
        <ele-form
          :formData="dialogFormData"
          :renderFormArr="dialogRenderFormArr"
          :rules="dialogRules"
          :radios="radios"
          ref="dialogFormRef"
          @handleChangeRadio="handleChangeRadio"
        >
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
import EleForm from '@/components/eleForm/index.vue';
import { filterTime } from '@/utils/filtration';
import {
  batchDeleteMineDumpingInfo,
  createMineDumpingInfo,
  deleteMineDumpingInfo,
  updateMineDumpingInfo,
} from '@/api/company/mineDumpInfo';
import { ElMessage } from 'element-plus';
import {
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { verifyDecimals } from '@/api/common/verify';
import { useStore } from 'vuex';
export default defineComponent({
  components: { EleTable, EleForm },
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
      renderTable: [
        {
          label: '排土场名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '设计服务年限',
          prop: 'serviceYear',
          type: 'text',
        },
        {
          label: '排土场是否关闭',
          prop: 'isClose',
          type: 'text',
          formatter: (row: any) => {
            return row.isClose ? '是' : '否';
          },
        },
        {
          label: '关闭时间',
          prop: 'closeTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.closeTime, '-', false);
          },
        },
        {
          label: '排土场分类',
          prop: 'mineDumpingType',
          type: 'text',
          formatter: (row: any) => {
            let mineDumpingType = '';
            DATA.radios.mineDumpingType &&
              DATA.radios.mineDumpingType.forEach((item: any) => {
                if (item.value === row.mineDumpingType) {
                  mineDumpingType = item.name;
                }
              });
            return mineDumpingType;
          },
        },
        {
          label: '排土场工艺',
          prop: 'dumpingProcess',
          type: 'text',
          formatter: (row: any) => {
            let dumpingProcess = '';
            DATA.radios.dumpingProcess &&
              DATA.radios.dumpingProcess.forEach((item: any) => {
                if (item.value === row.dumpingProcess) {
                  dumpingProcess = item.name;
                }
              });
            return dumpingProcess;
          },
        },
        {
          label: '总容量',
          prop: 'sum',
          type: 'text',
        },
        {
          label: '现状排土总容量',
          prop: 'currentSum',
          type: 'text',
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
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
      tableLoading: false,
      dumpFormData: {
        isDump: false,
      },
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      radios: {
        isClose: [
          {
            value: true,
            name: '是',
          },
          {
            value: false,
            name: '否',
          },
        ],
      },
      dialogRenderFormArr: [
        {
          label: '排土场名称',
          type: 'input',
          prop: 'name',
          placeholder: '请输入排土场名称',
          labelWidth: 130,
        },
        {
          label: '设计服务年限',
          type: 'input',
          append: '年',
          prop: 'serviceYear',
          labelWidth: 130,
        },
        {
          label: '排土场是否关闭',
          type: 'radio',
          prop: 'isClose',
          value: 'value',
          title: 'name',
          labelWidth: 130,
        },
        {
          label: '关闭时间',
          type: 'date',
          prop: 'closeTime',
          placeholder: '请选择时间',
          labelWidth: 130,
          condition: (row: any) => {
            return row.isClose;
          },
        },
        {
          label: '排土场分类',
          type: 'radio',
          prop: 'mineDumpingType',
          value: 'value',
          title: 'name',
          labelWidth: 130,
        },
        {
          label: '排土场工艺',
          type: 'radio',
          prop: 'dumpingProcess',
          value: 'value',
          title: 'name',
          labelWidth: 130,
        },
        {
          label: '总容量',
          type: 'input',
          prop: 'sum',
          append: '万m³',
          labelWidth: 130,
        },
        {
          label: '现状排土总容量',
          type: 'input',
          prop: 'currentSum',
          append: '万m³',
          labelWidth: 130,
        },
      ],
      dialogRules: {
        name: [
          {
            required: true,
            message: '请输入排土场名称',
            trigger: 'blur',
          },
        ],
        serviceYear: [
          {
            required: true,
            message: '请输入设计服务年限',
            trigger: 'blur',
          },
          {
            pattern: /^\d+$/,
            message: '数据格式为正整数数字',
          },
        ],
        isClose: [
          {
            required: true,
            message: '请选择排土场是否关闭',
            trigger: 'change',
          },
        ],
        sum: [
          {
            pattern: verifyDecimals,
            message: '数据格式为正数数字',
          },
        ],
        currentSum: [
          {
            pattern: verifyDecimals,
            message: '数据格式为正数数字',
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取字典字段数据
      handleDistData: async (key: string) => {
        let { data } = await getByKey({ key });
        if (data.code === RES_SUCCESS) {
          sessionWrite(key, data.data);
          return data.data;
        }
      },
      handleChangeIsDump: async () => {
        if (!DATA.dumpFormData.isDump) {
          proxy
            .$confirm('是否确定关闭矿山排土场,并且删除数据?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
            .then(async () => {
              let { data } = await batchDeleteMineDumpingInfo({
                companyInfoId: DATA.dumpFormData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                proxy.$message({
                  type: 'success',
                  message: '关闭矿山排土场成功!',
                });
                DATA.tableData = [];
              }
            })
            .catch(() => {
              DATA.dumpFormData.isDump = true;
            });
        }
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加矿山排土场信息';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.dialogFormData = {};
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑矿山排土场信息';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
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
                let { data } = await deleteMineDumpingInfo({
                  id: row.id,
                  companyInfoId: DATA.dumpFormData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '删除成功!',
                  });
                  DATA.tableData = data.data;
                  if (data.data.length === 0) {
                    DATA.dumpFormData.isDump = false;
                  }
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleChangeRadio: ({ data, item }: any) => {
        if (item.prop === 'isClose' && !data) {
          DATA.dialogFormData.closeTime = undefined;
        }
      },
      handleConfirm: () => {
        dialogFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.dumpFormData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照信息',
                type: 'warning',
              });
              return;
            }
            if (DATA.dialogFormData.closeTime && DATA.dialogFormData.isClose) {
              DATA.dialogFormData.closeTime = filterTime(
                DATA.dialogFormData.closeTime,
                '/'
              );
            } else {
              DATA.dialogFormData.closeTime = undefined;
            }

            DATA.tableLoading = true;
            if (DATA.dialogType) {
              let { data } = await createMineDumpingInfo({
                ...DATA.dialogFormData,
                companyInfoId: DATA.dumpFormData.companyInfoId,
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
              let { data } = await updateMineDumpingInfo({
                ...DATA.dialogFormData,
                companyInfoId: DATA.dumpFormData.companyInfoId,
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
    });
    watch(
      () => props.formData,
      () => {
        DATA.tableData = props.formData.mineDumpingInfo;
        props.formData.mineDumpingInfo.length > 0
          ? (DATA.dumpFormData.isDump = true)
          : (DATA.dumpFormData.isDump = false);
        DATA.dumpFormData.companyInfoId = props.formData.companyInfoId;
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
    onMounted(async () => {
      if (sessionRead('t_mine_dumping_type')) {
        DATA.radios.mineDumpingType = sessionRead('t_mine_dumping_type');
      } else {
        DATA.radios.mineDumpingType = await METHODS.handleDistData(
          't_mine_dumping_type'
        );
      }

      if (sessionRead('t_mine_dumping_process')) {
        DATA.radios.dumpingProcess = sessionRead('t_mine_dumping_process');
      } else {
        DATA.radios.dumpingProcess = await METHODS.handleDistData(
          't_mine_dumping_process'
        );
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
    };
  },
});
</script>
<style scoped lang="scss">
</style>