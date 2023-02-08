<template>
  <!-- 年度计划 - 年度监督检查计划tab页面 -->
  <el-row>
    <!-- 添加和搜索 -->
    <el-col
      :span="24"
      class="d_flex d_flex_sb search"
    >
      <el-button
        @click="handleCreate"
        type="primary"
        v-if="showBtnList.includes('create')"
      ><i class="el-icon-plus mr-5"></i>添加年度计划</el-button>
      <div v-else></div>
      <div>
        <el-date-picker
          class="mr-10"
          v-model="date"
          type="year"
          prefix-icon="el-icon-time"
          placeholder="请选择年份"
          :disabled-date="disabledDate"
          @change="(val) => handleChangeYear(val)"
        >
        </el-date-picker>
      </div>
    </el-col>

    <!-- 表格列表 -->
    <el-col
      :span="24"
      class="mt-10"
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
              handleGetPagingData
            )
        "
        @handleSizeChange="
          (val) =>
            handleSizeChange(
              val,
              pagingParams,
              pagingParamsCopy,
              handleGetPagingData,
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
        width="40%"
        :before-close="handleCancel"
        top="8vh"
      >
        <ele-form
          :formData="formData"
          :renderFormArr="renderFormArr"
          :rules="rules"
          :options="options"
          :radios="radios"
          ref="formRef"
        >
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

    <!-- 月份监督检查记录 - 模态框 -->
    <el-col :span="24">
      <el-dialog
        title="月份监督检查记录"
        v-model="recordVisible"
        width="50%"
      >
        <ele-table
          :tableData="recordTableData"
          :renderTable="recordRenderTable"
          :isborder="true"
          :btnList="btnRecordList"
          @handleBtnEvent="handleRecordBtnEvent"
          class="mb-20 file"
        ></ele-table>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  computed,
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import ElePagination from '@/components/elePagination/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import { filterTime, formatDate } from '@/utils/filtration';
import {
  currentChange,
  getByKey,
  RES_SUCCESS,
  sizeChange,
} from '@/api/common/common';
import {
  getYearSupervisePage,
  createYearSupervise,
  deleteYearSupervise,
  updateYearSupervise,
  getYearSuperviseMonth,
} from '@/api/dep/plan';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  components: {
    ElePagination,
    EleTable,
    EleForm,
  },
  props: {
    showBtnList: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();

    // 计划检查企业数规则
    let validateCheckCompany = (rule: any, value: string, callback: any) => {
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          callback();
        } else {
          callback(new Error('数据格式为0或正整数'));
        }
      } else {
        callback();
      }
    };

    let DATA: any = reactive({
      // 显示列表
      currentIndex: 0,
      date: new Date(),
      pagingParams: {
        limit: 10,
        page: 1,
        yearly: '',
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        yearly: '',
      },
      //表格
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: '月份',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return new Date(row.checkTime).getMonth() + 1 + '月';
          },
          width: 80,
        },
        {
          label: '部门',
          prop: 'department',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            for (let i of DATA.options.department) {
              if (i.value == row.department) {
                return i.name;
              }
            }
          },
        },
        {
          label: '具体工作内容',
          prop: 'workContent',
          type: 'text',
        },
        {
          label: '具体工作要求',
          prop: 'workRequirement',
          type: 'text',
        },
        {
          label: '检查方式',
          prop: 'checkMode',
          type: 'text',
        },
        {
          label: '协助单位',
          prop: 'assistanceUnit',
          type: 'text',
        },
        {
          label: '备注',
          prop: 'remark',
          type: 'text',
        },
        {
          label: '需检查企业数',
          type: 'text',
          prop: 'checkCompany',
        },
        {
          label: '完成状态',
          prop: 'isComplete',
          type: 'tag',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return row.isComplete
              ? {
                  text: '已完成',
                }
              : {
                  tagType: 'danger',
                  text: '未完成',
                };
          },
        },
        {
          label: '操作',
          type: STORE.state.user.personnel.unitType === 1 ? 'handle' : '',
          width: 300,
        },
      ],
      btnList: [
        {
          text: '查看记录',
          type: 'primary',
          handleType: 'check',
          size: 'small',
          isShow: true,
        },
        {
          text: '编辑',
          handleType: 'edit',
          type: 'primary',
          size: 'small',
          isShow: props.showBtnList.includes('edit'),
        },
        {
          text: '删除',
          type: 'danger',
          handleType: 'delete',
          size: 'small',
          isShow: props.showBtnList.includes('delete'),
        },
      ],
      total: 0,

      // 添加/编辑 模态框
      addOrEditTitle: '',
      addOrEditVisible: false,
      formData: {
        checkTime: '',
        department: null,
        workContent: '',
        workRequirement: '',
        checkCompany: null,
        isComplete: null,
        checkMode: '',
        assistanceUnit: '',
        remark: '',
      },
      formDataCopy: {
        checkTime: '',
        department: null,
        workContent: '',
        workRequirement: '',
        checkCompany: null,
        isComplete: null,
        checkMode: '',
        assistanceUnit: '',
        remark: '',
      },
      renderFormArr: [
        {
          label: '检查时间安排',
          type: 'date',
          prop: 'checkTime',
          dateType: 'month',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
        },
        {
          label: '部门',
          type: 'select',
          prop: 'department',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
          value: 'value',
          title: 'name',
        },
        {
          label: '具体工作内容',
          type: 'input',
          inputType: 'textarea',
          prop: 'workContent',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
        },
        {
          label: '具体工作要求',
          type: 'input',
          inputType: 'textarea',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
          prop: 'workRequirement',
        },
        {
          label: '计划检查企业数',
          type: 'input',
          prop: 'checkCompany',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
        },
        {
          label: '是否完成',
          prop: 'isComplete',
          type: 'radio',
          labelWidth: '130px',
          value: 'value',
          title: 'title',
          style: {
            width: '95%',
          },
        },
        {
          label: '检查方式',
          type: 'input',
          prop: 'checkMode',
          labelWidth: '130px',
          style: {
            width: '95%',
          },
        },
        {
          label: '协助单位',
          type: 'input',
          prop: 'assistanceUnit',
          labelWidth: '120px',
          style: {
            width: '95%',
          },
        },
        {
          label: '备注',
          type: 'input',
          inputType: 'textarea',
          labelWidth: '120px',
          style: {
            width: '95%',
          },
          prop: 'remark',
        },
      ],
      options: {
        department: [],
      },
      radios: {
        isComplete: [
          {
            title: '已完成',
            value: true,
          },
          {
            title: '未完成',
            value: false,
          },
        ],
      },
      rules: {
        checkTime: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        department: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        workContent: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        workRequirement: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        checkCompany: [
          { required: true, message: '此为必填项', trigger: 'blur' },
          { validator: validateCheckCompany },
        ],
        isComplete: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
      },

      // 月份监督检查记录
      recordVisible: false,
      recordTableData: [],
      recordRenderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: '企业',
          prop: 'companyName',
          type: 'text',
          width: 300,
        },
        {
          label: '监督检查类型',
          prop: 'checkType',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            for (const item of DATA.checkTypeList) {
              if (row.checkType == item.value) {
                return item.name;
              }
            }
          },
        },
        {
          label: '执法人员',
          prop: 'personnelNames',
          type: 'text',
        },
        {
          label: '创建时间',
          type: 'text',
          prop: 'checkTime',
          formatter: (row: any) => {
            return formatDate(row.checkTime);
          },
        },
        {
          label: '操作',
          type: STORE.state.user.personnel.unitType === 1 ? 'handle' : '',
        },
      ],
      btnRecordList: [
        {
          text: '查看记录',
          type: 'primary',
          handleType: 'check',
          size: 'small',
          isShow: true,
        },
      ],

      // 监督检查类型列表
      checkTypeList: [],
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (DATA.date) {
          pagingParams.yearly = new Date(DATA.date).getFullYear();
        }

        let { data } = await getYearSupervisePage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },

      // 改变年份获取数据
      handleChangeYear: (val: any) => {
        DATA.pagingParams = Object.assign({}, DATA.pagingParamsCopy);
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParams); //获取数据
      },

      // 添加按钮
      handleCreate: (index: number) => {
        DATA.addOrEditTitle = '添加年度监督检查计划';
        DATA.formData = Object.assign({}, DATA.formDataCopy);
        DATA.addOrEditVisible = true;
      },

      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check':
            DATA.recordVisible = true;
            let time = filterTime(row.checkTime, '/');
            let { data } = await getYearSuperviseMonth({ date: time });
            if (data.code === RES_SUCCESS) {
              DATA.addOrEditVisible = false;
              DATA.recordTableData = data.data;
            }

            break;
          case 'edit':
            DATA.addOrEditTitle = '编辑年度监督检查计划';
            DATA.addOrEditVisible = true;
            // 数据处理
            DATA.formData = Object.assign({}, row);
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该年度计划?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteYearSupervise({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message.success('删除成功');
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      // 查看记录表格中的按钮
      handleRecordBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check':
            await STORE.commit('setDailyInfo', { id: row.companyId, ...row });
            await STORE.commit('setTitle', '日常安全监管');
            await STORE.commit('setTwoTitle', '日常监督管理');
            ROUTER.push({
              name: 'dailyDetails',
              params: {
                // title: ROUTE.meta.title,
              },
            });
            break;
          default:
            break;
        }
      },

      //弹框取消按钮
      handleCancel: () => {
        DATA.addOrEditVisible = false;
        proxy.$refs['formRef'].resetForm();
      },

      // 确认按钮
      handleConfirm: () => {
        console.log('DATA.formData', DATA.formData);

        proxy.$refs['formRef']
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              DATA.formData.checkTime = filterTime(
                DATA.formData.checkTime,
                '/'
              );
              if (DATA.formData.id) {
                let { data } = await updateYearSupervise(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  DATA.addOrEditVisible = false;
                  proxy.$message.success('编辑成功');
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy); //刷新数据
                }
              } else {
                let { data } = await createYearSupervise(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  DATA.addOrEditVisible = false;
                  proxy.$message.success('添加成功');
                  console.log('添加', data);
                  DATA.pagingParams.page = 1
                  DATA.pagingParamsCopy.page = 1
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy); //刷新数据
                }
              }
            }
          })
          .catch((err: any) => {});
        // 添加请求
      },

      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handleGetPagingData);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handleGetPagingData,
          total
        );
      },

      // 获取 政府部门
      handleGovSector: async () => {
        let { data } = await getByKey({ key: 't_department_status' });
        if (data.code === RES_SUCCESS) {
          DATA.options.department = data.data;
        }
      },

      // 获取 监督检查类型
      handleCheckType: async () => {
        let { data } = await getByKey({
          key: 't_supervision_and_inspection_type',
        });
        if (data.code === RES_SUCCESS) {
          DATA.checkTypeList = data.data;
        }
      },
    });
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem('Admin-Token'),
      };
    });
    onMounted(async () => {
      //获取分页数据
      METHODS.handleGetPagingData(DATA.pagingParams);
      METHODS.handleGovSector();
      METHODS.handleCheckType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      getItemtoken,
    };
  },
});
</script>
<style scoped lang="scss">
.search {
  // padding: 20px 30px 10px;
  .el-button {
    margin-left: 0px;
  }
}

/deep/ textarea {
  height: 100px !important;
  resize: none;
  border: 1px solid #dcdfe6;
  overflow-y: scroll;
}

/deep/ .el-form-item__error {
  font-size: 12px;
  line-height: 1;
  padding-top: 2px !important;
  position: absolute;
}
/deep/.el-form-item {
  margin-bottom: 18px;
}
/deep/.el-dialog__body {
  padding-bottom: 10px !important;
}

.file {
  max-height: 550px;
  overflow-y: auto;
}
</style>
