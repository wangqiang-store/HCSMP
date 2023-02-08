<template>
  <!-- 监督检查记录 -->
  <el-row class="container">
    <!-- 政府 -->
    <el-col :span="24">
      <el-row>
        <!-- 编辑和搜索 -->
        <el-col
          :span="24"
          class="d_flex mb-10"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            v-if="showBtnList.includes('create')"
            @click="handleCreate"
            ><i class="el-icon-edit mr-5"></i>添加监督检查</el-button
          >
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
            <el-button type="primary" @click="handleSearch"
              ><i class="el-icon-search mr-5"></i>搜索</el-button
            >
          </div>
        </el-col>

        <!-- 表格数据显示 -->
        <el-col :span="24" class="mt-10" v-loading="loading">
          <el-table
            :data="tableData"
            border
            style="width: 100%"
            :header-cell-style="headFirst"
            :index="hIndex"
            class="mb-10"
          >
            <el-table-column
              type="index"
              align="center"
              label="序号"
              width="60"
            >
            </el-table-column>

            <el-table-column
              prop="companyName"
              align="center"
              width="200"
              label="企业名称"
            >
            </el-table-column>
            <el-table-column align="center" label="记录">
              <el-table-column
                align="center"
                v-for="(item, i) of list"
                :key="i"
              >
                <template v-slot="scope">
                  <div v-if="scope.row.supervisionRecords[i]">
                    <p>
                      {{
                        formatDate(scope.row.supervisionRecords[i].checkTime)
                      }}
                    </p>
                    <p>{{ scope.row.supervisionRecords[i].personnelName }}</p>
                    <p>{{ scope.row.supervisionRecords[i].otherPersonnel }}</p>
                  </div>
                  <div v-else></div>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="操作" width="230">
              <template v-slot="scope">
                <el-button
                  type="success"
                  @click="handleCheck(scope.row)"
                  size="small"
                  >查看企业</el-button
                >
                <el-button size="small" type="primary" @click="handleClickDetails(scope.row)"
                  >审批详情</el-button
                >
              </template>
            </el-table-column>
          </el-table>

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

        <!-- 监督检查(添加 编辑) - 模态框 -->
        <el-col :span="24">
          <el-dialog
            :title="isAdd ? '添加监督检查记录' : '编辑监督检查记录'"
            v-model="checkDialogVisible"
            width="30%"
            :before-close="handleCancel"
          >
            <el-form
              :model="checkFormData"
              status-icon
              :rules="rules"
              ref="formRef"
              label-width="120px"
              class="demo-ruleForm"
            >
              <el-form-item label="企业名称" prop="companyName">
                <el-select
                  v-model="checkFormData.companyName"
                  style="width: 100%"
                  filterable
                  placeholder="请选择"
                  @change="handleChangeCompany"
                >
                  <el-option
                    v-for="(item, index) in companyNameOptions"
                    :key="index"
                    :label="item.name"
                    :value="item.name"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="检查时间" prop="checkTime">
                <el-date-picker
                  v-model="checkFormData.checkTime"
                  type="date"
                  style="width: 100%"
                  @change="(val) => handleChangeYear(val, 'check')"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="监管人员" prop="personnel">
                <el-select
                  v-model="checkFormData.personnel"
                  style="width: 100%"
                  multiple
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in personOptions"
                    :key="index"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="其他监管人员" prop="otherPersonnel">
                <el-input
                  type="text"
                  v-model="checkFormData.otherPersonnel"
                  autocomplete="off"
                >
                </el-input>
              </el-form-item>
              <el-form-item>
                <div style="float: right">
                  <el-button @click="handleCancel">取消</el-button>
                  <el-button type="primary" @click="handleConfirm"
                    >提交</el-button
                  >
                </div>
              </el-form-item>
            </el-form>
          </el-dialog>
        </el-col>

        <!-- 审批详情 - 模态框 -->
        <el-col :span="24">
          <el-dialog
            :title="currentCompanyName"
            v-model="detailsDialogVisible"
            width="30%"
          >
            <ul class="detailsList">
              <li v-for="(item, index) in detailsListData" :key="index">
                <el-card>
                  <div class="d_flex d_flex_sb ">
                    <div class="detailsListLeft">
                      <div>检查时间 : {{ item.checkTime }}</div>
                      <div>
                        监管人员 : {{ item.personnelName }},{{
                          item.otherPersonnel
                        }}
                      </div>
                    </div>
                    <div class="detailsListRight">
                      <i
                        class="el-icon-edit-outline"
                        @click="handleBtnEvent(item, 'edit')"
                        v-if="showBtnList.includes('edit')"
                      ></i>
                      <i
                        class="el-icon-delete"
                        @click="handleBtnEvent(item, 'delete')"
                        v-if="showBtnList.includes('delete')"
                      ></i>
                    </div>
                  </div>
                </el-card>
              </li>
            </ul>
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
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { filterTime, formatDate } from "@/utils/filtration";
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import {
  getPageRecords,
  createSupervisionRecords,
  updateSupervisionRecords,
  deleteSupervisionRecords,
  getSupervisionAllRecords,
} from "@/api/dep/inspection";
import { getGovEnablePersonnel } from "@/api/system/personnel";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      date: "",
      pagingParams: {
        content: "",
        limit: 10,
        page: 1,
        yearly: "",
        companyId: undefined,
      },
      pagingParamsCopy: {
        content: "",
        limit: 10,
        page: 1,
        yearly: "",
        companyId: undefined,
      },
      currentCompanyName: "",
      //表格
      loading: false,
      list: [1, 2, 3, 4, 5, 6, 7, 8], //用于遍历使用索引
      tableData: [],

      total: 0,

      //检查模态框数据
      isAdd: true, //是否是添加状态
      checkDialogVisible: false,
      checkFormData: {
        companyInfoId: "",
        companyName: "",
        checkTime: "",
        personnel: "",
        personnelName: "",
        otherPersonnel: "",
      },
      checkFormDataCopy: {
        companyInfoId: "",
        companyName: "",
        checkTime: "",
        personnelName: "",
        otherPersonnel: "",
      },
      companyNameOptions: [],
      personOptions: [],
      // 模态框检验规则
      rules: {
        companyName: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        checkTime: [{ required: true, message: "此为必填项", trigger: "blur" }],
        personnel: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },

      //审批模态框数据
      detailsDialogVisible: false,
      detailsListData: [],
    });

    let METHODS = reactive({
      // 表头处理
      headFirst: ({ row, colunm, rowIndex, columnIndex }: any) => {
        if (rowIndex === 1) {
          //这里为了是将第二列的表头隐藏，就形成了合并表头的效果
          return { display: "none" };
        }
        return "background:#fff";
      },
      // 表格序号处理
      hIndex: (index: number) => {
        // index索引从零开始，index +1即为当前数据序号
        let page = DATA.pagingParams.page;
        page <= 0 ? (page = 1) : page;
        // 如果当前不是第一页数据
        if (page != 1) {
          // index + 1 + (( 当前页 - 1) * 每页展示条数)
          // 比如是第二页数据 1 + ((2 - 1)*5) = 6,第二页数据也就是从序号6开始
          return index + 1 + (page - 1) * DATA.pagingParams.limit;
        }
        // 否则直接返回索引+1作为序号
        return index + 1;
      },
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        //
        // if (STORE.state.user.personnel.unitType === 1) {
        // 政府获取的数据

        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }

        getPageRecords(DATA.pagingParams).then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.tableData = res.data.data.records;

            DATA.loading = false;
            DATA.total = res.data.data.total;
          }
        });
        // } else {
        //   //企业数据
        //   let companyId = STORE.state.user.personnel.companyId;
        //   getSupervisionAllRecords({ companyId }).then((res) => {
        //     if (res.data.code == RES_SUCCESS) {
        //       DATA.tableData = [];
        //       DATA.tableData[0] = {
        //         supervisionRecords: res.data.data,
        //         companyName: STORE.state.user.personnel.companyName,
        //       };
        //       DATA.loading = false;
        //       DATA.total = res.data.data.total;
        //     }
        //   });
        // }
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

      //模态框的企业下拉
      handleChangeCompany: (val: any) => {
        DATA.companyNameOptions.forEach((item: any) => {
          if (item.name == val) {
            DATA.checkFormData.companyInfoId = item.id;
            return;
          }
        });
      },

      // change改变年份或者日期
      handleChangeYear: (val: any, clickType: String) => {
        switch (clickType) {
          case "search": //主页的搜索条件
            if (!val) {
              //处理字段值为null的默认情况
              DATA.pagingParams.yearly = undefined;
              return;
            }
            DATA.pagingParams.yearly = Number(new Date(val).getFullYear());
            break;
          case "check": //模态框 - 检查时间
            DATA.checkFormData.checkTime = val;
            break;
          default:
            break;
        }
      },
      //点击搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParams.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 点击按钮 - 添加监督检查记录
      handleCreate: () => {
        DATA.checkDialogVisible = true;
        DATA.isAdd = true;
        DATA.checkFormData = Object.assign({}, DATA.checkFormDataCopy);
      },
      // 详情模态框 - 按钮
      handleBtnEvent: async (data: any, type: string) => {
        switch (type) {
          case "edit":
            DATA.isAdd = false;
            DATA.checkDialogVisible = true;
            DATA.checkFormData = Object.assign({}, data);
            DATA.checkFormData.companyName = DATA.currentCompanyName;

            DATA.checkFormData.personnel = DATA.checkFormData.personnel
              .split(",")
              .map((item: any) => {
                return Number(item);
              });
            // DATA.checkFormData.personnel.map((item:any)=>{

            // })
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该审批详情?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                deleteSupervisionRecords({ recordId: data.id }).then((res) => {
                  if (res.data.code == RES_SUCCESS) {
                    proxy.$message.success("删除成功");
                    // 刷新数据
                    METHODS.handleGetPagingData(DATA.pagingParams);
                    DATA.detailsDialogVisible = false;
                  }
                });
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      // 点击表格 - 详情按钮
      handleClickDetails: (row: any) => {
        DATA.detailsDialogVisible = true;

        let companyId = row.companyInfoId;
        DATA.currentCompanyName = row.companyName;
        DATA.loading = true;
        // 获取当前企业的监督检查记录全列表
        getSupervisionAllRecords({ companyId }).then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.detailsListData = res.data.data;
            DATA.loading = false;
          }
        });
      },
      // 点击表格 - 查看企业按钮
      handleCheck: async (row: any) => {
        await STORE.commit("setCompanyInfo", {
          type: row.type,
          companyId: row.companyInfoId,
        });
        await STORE.commit("setTitle", "企业档案管理");
        if (row.type == 4) {
          await STORE.commit("setTwoTitle", "工贸行业管理");
          ROUTER.push({
            name: "tradeDetails",
            params: {
              // title: ROUTE.meta.title,
            },
          });
        } else {
          await STORE.commit("setTwoTitle", "非煤矿山企业管理");
          ROUTER.push({
            name: "companyDetails",
            params: {
              // title: ROUTE.meta.title,
            },
          });
        }
      },

      //弹框取消按钮
      handleCancel: () => {
        DATA.checkDialogVisible = false;
        proxy.$refs["formRef"].clearValidate();
      },
      // 检查记录弹框 - 确认按钮
      handleConfirm: () => {
        proxy.$refs["formRef"]
          .validate()
          .then((valid: boolean) => {
            if (valid) {
              DATA.checkFormData.checkTime = filterTime(
                DATA.checkFormData.checkTime,
                "/"
              );
              DATA.checkFormData.personnelName = String(
                DATA.checkFormData.personnelName
              );
              DATA.checkFormData.personnel = String(
                DATA.checkFormData.personnel
              );
              if (DATA.isAdd) {
                // 添加
                createSupervisionRecords(DATA.checkFormData).then((res) => {
                  if (res.data.code == RES_SUCCESS) {
                    DATA.checkDialogVisible = false;
                    proxy.$message.success("成功添加监督检查记录");
                    DATA.pagingParams.page = 1;
                    DATA.pagingParamsCopy.page = 1;
                    METHODS.handleGetPagingData(DATA.pagingParams);
                  }
                });
              } else {
                //编辑
                updateSupervisionRecords(DATA.checkFormData).then((res) => {
                  if (res.data.code == RES_SUCCESS) {
                    DATA.checkDialogVisible = false;
                    DATA.detailsDialogVisible = false;
                    proxy.$message.success("成功编辑监督检查记录");
                    METHODS.handleGetPagingData(DATA.pagingParams);
                  }
                });
              }
            }
          })
          .catch((err: boolean) => {});
      },

      //获取监管人员
      getPerson: () => {
        getGovEnablePersonnel().then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.personOptions = res.data.data;
          }
        });
      },
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);
      DATA.companyNameOptions = STORE.state.globalData.companyList;
      METHODS.getPerson(); //获取监管人员

      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      filterTime,
      formatDate,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
}
.page {
  margin: 40px 30px;
}
/deep/.el-table th,
/deep/.el-table td {
  text-align: center;
}
/deep/.el-dialog__header{
  width: 95%;
}

.detailsList {
  height: 310px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 6px;
  }
  /*定义滑块 内阴影+圆角*/
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 0px rgba(240, 240, 240, 0.5);
    background-color: rgba(29, 93, 211, 0.5);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(29, 93, 211, 0.8);
  }
  li {
    padding: 10px 0;
    // border-top: 1px solid #d6dceb;
    // border-bottom: 1px solid #d6dceb;
    .detailsListLeft{
      width: 95%;
    }
    .detailsListRight{
      width: 70px !important;
      display: flex;
      justify-content: center;
    }
    div {
      line-height: 20px;
      i {
        font-size: 24px;
        margin-left: 5px;
        cursor: pointer;
        &:first-child {
          color: #f8e097;
        }
        &:last-child {
          color: #fe6060;
        }
      }
    }
  }
}
</style>
