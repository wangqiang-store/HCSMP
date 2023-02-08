<template>
  <!-- 行政审批事项 -->
  <el-row class="page container">
    <!-- 政府 -->
    <el-col :span="24">
      <el-row>
        <!-- 添加和搜索 -->
        <el-col
          :span="24"
          class="d_flex mb-10"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            v-if="showBtnList.includes('create')"
            @click="handleCreate"
          ><i class="el-icon-edit mr-5"></i>添加审批事项</el-button>
          <div>
            <el-date-picker
              class="mr-10"
              v-model="date"
              type="year"
              prefix-icon="el-icon-time"
              placeholder="请选择年份"
              @change="(val) => handleChangeYear(val, 'search')"
            >
            </el-date-picker>
            <el-input
              placeholder="可搜索企业名称"
              v-model="pagingParams.content"
              style="width: 300px"
              class="mr-10"
              clearable
            ></el-input>
            <el-button
              type="primary"
              @click="handleSearch"
            ><i class="el-icon-search mr-5"></i>搜索</el-button>
          </div>
        </el-col>

        <!-- 表格数据显示 -->
        <el-col
          :span="24"
          class="mt-10"
          v-loading="loading"
        >
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :btnList="btnList"
            :isborder="true"
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

        <!-- 审批事项 - 模态框 -->
        <el-col :span="24">
          <el-dialog
            :title="isAdd ? '添加审批事项' : '编辑审批事项'"
            v-model="DialogVisible"
            width="30%"
            :before-close="handleCancel"
          >
            <el-form
              :model="formData"
              status-icon
              :rules="rules"
              ref="formRef"
              label-width="120px"
              class="demo-ruleForm form"
            >
              <el-form-item
                label="企业名称"
                prop="companyInfoId"
              >
                <el-select
                  v-model="formData.companyInfoId"
                  style="width: 100%"
                  filterable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in companyNameOptions"
                    :key="index"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="审批项目"
                prop="item"
              >
                <el-input
                  type="text"
                  v-model="formData.item"
                  autocomplete="off"
                >
                </el-input>
              </el-form-item>
              <el-form-item
                label="受理时间"
                prop="processingTime"
              >
                <el-date-picker
                  v-model="formData.processingTime"
                  type="date"
                  style="width: 100%"
                  @change="(val) => handleChangeYear(val, 'processing')"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item
                label="审批进展情况"
                prop="approvalProgress"
              >
                <el-input
                  type="textarea"
                  v-model="formData.approvalProgress"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="办结情况"
                prop="finishStatus"
              >
                <el-input
                  type="text"
                  v-model="formData.finishStatus"
                  autocomplete="off"
                >
                </el-input>
              </el-form-item>
              <el-form-item
                label="办结时间"
                prop="finishTime"
              >
                <el-date-picker
                  v-model="formData.finishTime"
                  type="date"
                  style="width: 100%"
                  @change="(val) => handleChangeYear(val, 'finish')"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <div style="float: right">
                  <el-button @click="handleCancel">取消</el-button>
                  <el-button
                    type="primary"
                    @click="handleConfirm"
                  >提交</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
    <!-- 企业 -->
    <!-- <el-col :span="24" v-else>
      <el-empty description="无访问页面权限"></el-empty>
    </el-col> -->
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
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { filterTime, formatDate } from '@/utils/filtration';
import Company from '@/views/ent/company/index.vue';
import { currentChange, RES_SUCCESS, sizeChange } from '@/api/common/common';
import {
  getPageApprova,
  deleteApprovalItems,
  createApprovalItems,
  updateApprovalItems,
} from '@/api/dep/approval';

import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    Company,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    // 显示 按钮列表
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      date: '',
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        yearly: '',
        companyId: undefined,
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        yearly: '',
        companyId: undefined,
      },
      //表格
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
          type: 'text',
          prop: 'companyName',
          width: 350,
        },
        {
          label: '审批项目',
          type: 'text',
          prop: 'item',
        },
        {
          label: '受理时间',
          type: 'text',
          formatter: (row: any) => {
            return formatDate(row.processingTime);
          },
        },
        {
          label: '审批进展情况',
          type: 'text',
          prop: 'approvalProgress',
          width: 400,
        },
        // {
        //   label: "采矿证核发单位",
        //   type: "text",
        //   prop: "miningUnit",
        // },
        {
          label: '办证情况',
          type: 'text',
          prop: 'finishStatus',
        },
        {
          label: '办结时间',
          type: 'text',
          formatter: (row: any) => {
            return formatDate(row.finishTime);
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

      isAdd: true, //是否是添加状态
      DialogVisible: false,
      formData: {
        id: '',
        approvalProgress: '',
        companyInfoId: '',
        finishStatus: '',
        finishTime: null,
        item: '',
        processingTime: '',
      },
      formDataCopy: {
        id: '',
        approvalProgress: '',
        companyInfoId: '',
        finishStatus: '',
        finishTime: null,
        item: '',
        processingTime: '',
      },
      companyNameOptions: [],
      // 企业数据
      // 模态框检验规则
      rules: {
        companyInfoId: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        item: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        processingTime: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        approvalProgress: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
      },
    });
    let METHODS = reactive({
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }

        //发起请求 -----------
        getPageApprova(pagingParams).then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.tableData = res.data.data.records;
            DATA.total = res.data.data.total;
            DATA.loading = false;
          }
        });
      },

      // 改变年份或者日期
      handleChangeYear: (val: any, clickType: String) => {
        switch (clickType) {
          case 'search': //主页的搜索条件
            if (!val) {
              //处理字段为null的默认情况
              // DATA.pagingParams.yearly = Number(new Date().getFullYear());
              DATA.pagingParams.yearly = undefined;
              return;
            }
            DATA.pagingParams.yearly = Number(new Date(val).getFullYear());
            break;
          case 'processing': //模态框 - 受理时间
            DATA.formData.processingTime = val;
            break;
          case 'finish': //模态框 - 办结时间
            DATA.formData.finishTime = val;
            break;
          default:
            break;
        }
      },

      //点击搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        // METHODS.handleGetPagingData(DATA.pagingParams);
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
      // 点击 - 添加审批事项按钮
      handleCreate: async () => {
        DATA.DialogVisible = true;
        DATA.isAdd = true;
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },
      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check':
            let companyType: any;
            DATA.companyNameOptions.forEach((item: any) => {
              if (row.companyInfoId === item.id) {
                companyType = item.type;
              }
            });
            await STORE.commit('setCompanyInfo', {
              type: companyType,
              companyId: row.companyInfoId,
            });
            if (companyType === 4) {
              STORE.commit('setTwoTitle', '工贸行业管理');
              ROUTER.push({
                name: 'tradeDetails',
                params: {
                  title: ROUTE.meta.title,
                },
              });
            } else {
              STORE.commit('setTwoTitle', '非煤矿山企业管理');
              ROUTER.push({
                name: 'companyDetails',
                params: {
                  title: ROUTE.meta.title,
                },
              });
            }
            break;
          case 'edit':
            DATA.DialogVisible = true;
            DATA.isAdd = false;
            delete row.miningUnit;
            DATA.formData = Object.assign({}, row);
            delete DATA.formData.companyName;
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该审批事项?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                deleteApprovalItems({ itemId: row.id }).then((res) => {
                  //判断是否请求成功
                  ElMessage({
                    message: '删除成功',
                    type: 'success',
                  });
                  // 刷新数据
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                });
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      //弹框取消按钮
      handleCancel: () => {
        DATA.DialogVisible = false;
        proxy.$refs['formRef'].clearValidate();
      },
      // 弹框确认按钮
      handleConfirm: () => {
        // console.log(DATA.formData);
        proxy.$refs['formRef']
          .validate()
          .then((valid: boolean) => {
            if (valid) {
              if (DATA.formData.finishTime) {
                DATA.formData.finishTime = filterTime(
                  DATA.formData.finishTime,
                  '/'
                );
              } else {
                DATA.formData.finishTime = undefined;
              }

              DATA.formData.processingTime = filterTime(
                DATA.formData.processingTime,
                '/'
              );
              // delete DATA.formData.companyName
              // 添加
              if (DATA.isAdd) {
                createApprovalItems(DATA.formData).then((res) => {
                  if (res.data.code === RES_SUCCESS) {
                    DATA.DialogVisible = false;
                    proxy.$message.success('成功添加审批事项');
                    DATA.pagingParams.page = 1
                    DATA.pagingParamsCopy.page = 1
                    METHODS.handleGetPagingData(DATA.pagingParams);
                  }
                });
              } else {
                //编辑
                updateApprovalItems(DATA.formData).then((res) => {
                  if (res.data.code === RES_SUCCESS) {
                    DATA.DialogVisible = false;
                    proxy.$message.success('成功编辑审批事项');
                    METHODS.handleGetPagingData(DATA.pagingParams);
                  }
                });
              }
            }
          })
          .catch((err: boolean) => {});
      },
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);
      //获取所有公司列表
      DATA.companyNameOptions = STORE.state.globalData.companyList;
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        {
          text: '查看企业',
          handleType: 'check',
          type: 'success',
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
      formatDate,
      filterTime,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
/deep/ .el-table .cell {
  white-space: pre-line; /*保留换行符*/
}

/deep/ textarea {
  height: 100px;
  resize: none;
  border: 1px solid #dcdfe6;
  &:focus {
    border: 1px solid #409eff;
  }
  overflow-y: scroll;
}
</style>
