<template>
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <el-col
          :span="24"
          class="d_flex"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            @click="handleCreatePersonnel"
            v-if="showBtnList.includes('create')"
            ><i class="el-icon-plus mr-5"></i>添加人员信息</el-button
          >
          <div class="right">
            <el-select
              v-model="pagingParams.unitType"
              placeholder="单位类型"
              class="ml-5 mr-5"
              clearable
            >
              <el-option
                v-for="item in unitTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-select
              v-model="pagingParams.isOfficers"
              placeholder="是否执法人员"
              class="ml-5 mr-5"
              clearable
            >
              <el-option
                v-for="item in officers"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-select
              v-model="pagingParams.isEnable"
              placeholder="是否启用"
              class="ml-5 mr-5"
              clearable
            >
              <el-option
                v-for="item in enables"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请输入姓名"
              v-model="pagingParams.content"
              style="width: 200px"
              class="ml-5 mr-10"
              clearable
            ></el-input>
            <el-button type="primary" @click="handleSearch"
              ><i class="el-icon-search mr-5"></i>搜索</el-button
            >
          </div>
        </el-col>
        <el-col :span="24" class="mt-10" v-loading="loading">
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :btnList="btnList"
            :isborder="true"
            class="mb-10"
            @handleBtnEvent="handleBtnEvent"
            @handleEmitChange="handleEmitChange"
          ></ele-table>
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleCurrentChange="
              (val) =>
                handleCurrentChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingPerson
                )
            "
            @handleSizeChange="
              (val) =>
                handleSizeChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingPerson,
                  total
                )
            "
          ></ele-pagination>
        </el-col>
        <el-col :span="24">
          <!-- 添加、编辑模态框 -->
          <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
            <ele-form
              :formData="formData"
              :renderFormArr="renderFormArr"
              :rules="rules"
              :radios="radios"
              :options="options"
              ref="formRef"
            >
              <template #unitType>
                <div class="d_flex">
                  <el-radio-group v-model="formData.unitType">
                    <el-radio
                      v-for="item of unitTypeList"
                      :key="item.id"
                      :label="item.value"
                      >{{ item.name }}</el-radio
                    >
                  </el-radio-group>
                  <el-form-item label="性别">
                    <el-radio-group v-model="formData.sex">
                      <el-radio :label="true">男</el-radio>
                      <el-radio :label="false">女</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirm"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
          <!-- 查看模态框 -->
          <el-dialog v-model="checkDialogVisible" width="70%">
            <el-descriptions
              class="margin-top"
              title="人员详细信息"
              :column="3"
              border
            >
              <el-descriptions-item>
                <template #label> 姓名 </template>
                <el-tag type="info">{{ formData.name }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 性别 </template>
                <el-tag type="info">
                  {{
                    formData.sex === null || formData.sex === ""
                      ? "无"
                      : formData.sex
                      ? "男"
                      : "女"
                  }}</el-tag
                >
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 年龄 </template>
                <el-tag type="info">
                  {{
                    formData.age === null || formData.age === ""
                      ? "无"
                      : formData.age
                  }}</el-tag
                >
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 单位类型 </template>
                <el-tag type="info">{{
                  formData.unitType === 1 ? "政府" : "企业"
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  {{ formData.unitType === 1 ? "政府" : "企业" }}
                </template>
                <el-tag type="info">{{
                  formData.unitType === 1
                    ? formData.departmentName
                    : formData.companyName
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 联系电话 </template>
                <el-tag type="info">{{
                  formData.phone ? formData.phone : "无"
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 邮箱 </template>
                <el-tag type="info">{{
                  formData.email ? formData.email : "无"
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 是否执法人员 </template>
                <el-tag type="info">{{
                  formData.isOfficers ? "是" : "否"
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 行政执法号 </template>
                <el-tag type="info">{{
                  formData.officersNumber ? formData.officersNumber : "无"
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 创建时间 </template>
                <el-tag type="info">{{
                  filterTime(formData.createTime)
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 创建者 </template>
                <el-tag type="info">{{
                  formData.createIdName ? formData.createIdName : "无"
                }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { getByKey, RES_SUCCESS } from "@/api/common/common";
import {
  createPersonnel,
  deletePersonnel,
  getAssociatedInformation,
  getEnableBound,
  getPagePersonnel,
  updatePersonnel,
} from "@/api/system/personnel";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { filterTime } from "@/utils/filtration";
import { sizeChange, currentChange } from "@/api/common/common";
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { verifyEmail, verifyPhone } from "@/api/common/verify";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
  components: { EleTable, ElePagination, EleForm },
  setup() {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    // 自定义验证规则
    let validateage = (rule: any, value: string, callback: any) => {
      if (value) {
        if (/^[1-9]\d*$/.test(value)) {
          callback();
        } else {
          callback(new Error("年龄数据格式为正整数"));
        }
      } else {
        callback();
      }
    };
    let validatePhone = (rule: any, value: string, callback: any) => {
      value
        ? verifyPhone.test(value)
          ? callback()
          : callback(new Error("联系电话格式不正确"))
        : callback();
    };
    let validateEmail = (rule: any, value: string, callback: any) => {
      value
        ? verifyEmail.test(value)
          ? callback()
          : callback(new Error("邮箱格式不正确"))
        : callback();
    };
    let validateCompany = async (rule: any, value: number, callback: any) => {
      if (!DATA.dialogType) {
        if (DATA.companyId === value) {
          callback();
        } else {
          let { data } = await getEnableBound({ companyId: value });
          if (data.code === RES_SUCCESS) {
            if (data.data.length > 0) {
              callback(new Error("该企业已有关联人员"));
            } else {
              callback();
            }
          }
        }
      } else {
        let { data } = await getEnableBound({ companyId: value });
        if (data.code === RES_SUCCESS) {
          if (data.data.length > 0) {
            callback(new Error("该企业已有关联人员"));
          } else {
            callback();
          }
        }
      }
    };
    let DATA: any = reactive({
      pagingParams: {
        content: "",
        isEnable: null,
        isOfficers: null,
        limit: 10,
        page: 1,
        unitType: null,
      },
      pagingParamsCopy: {
        content: "",
        isEnable: null,
        isOfficers: null,
        limit: 10,
        page: 1,
        unitType: null,
      },
      // 单位类型列表
      unitTypeList: [],
      // 是否执法人员
      officers: [
        {
          value: true,
          label: "是",
        },
        {
          value: false,
          label: "否",
        },
      ],
      //   是否启用
      enables: [
        {
          value: true,
          label: "是",
        },
        {
          value: false,
          label: "否",
        },
      ],
      options: {},
      // 人员表格配置
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: "姓名",
          type: "text",
          prop: "name",
        },
        {
          label: "性别",
          type: "text",
          prop: "sex",
          formatter: (row: any) => {
            return row.sex ? "男" : "女";
          },
        },
        {
          label: "年龄",
          type: "text",
          prop: "age",
        },
        {
          label: "单位类型",
          type: "text",
          prop: "unitType",
          formatter: (row: any) => {
            let unitType = "";
            DATA.unitTypeList.forEach((item: any) => {
              if (item.value === row.unitType) {
                unitType = item.name;
              }
            });
            return unitType;
          },
        },
        {
          label: "部门/企业",
          type: "text",
          formatter: (row: any) => {
            return row.unitType === 1 ? row.departmentName : row.companyName;
          },
        },
        {
          label: "联系电话",
          type: "text",
          prop: "phone",
        },
        {
          label: "邮箱",
          type: "text",
          prop: "email",
        },
        {
          label: "是否执法人员",
          type: "text",
          prop: "isOfficers",
          formatter: (row: any) => {
            return row.isOfficers ? "是" : "否";
          },
        },
        {
          label: "行政执法证号",
          type: "text",
          prop: "officersNumber",
        },
        {
          label: "是否启用",
          type: "switch",
          prop: "isEnable",
        },
        {
          label: "创建时间",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.createTime);
          },
        },
        {
          label: "操作",
          type: "handle",
          width: 300,
        },
      ],
      btnList: [],
      total: 0,
      pageSize: 1,
      loading: false,
      // 表单
      dialogVisible: false,
      dialogTitle: "",
      dialogType: true,
      companyId: "",
      formData: {
        name: "",
        age: "",
        companyId: "",
        department: "",
        email: "",
        isEnable: true,
        isOfficers: true,
        isRelation: 0,
        officersNumber: "",
        phone: "",
        sex: true,
        unitType: 1,
      },
      renderFormArr: [
        {
          label: "姓名",
          type: "input",
          prop: "name",
        },
        {
          label: "单位类型",
          type: "slot",
          slotName: "unitType",
        },
        {
          label: "部门",
          type: "select",
          prop: "department",
          value: "value",
          title: "name",
          condition: (row: any) => {
            return row.unitType === 1 ? true : false;
          },
        },
        {
          label: "企业",
          type: "select",
          prop: "companyId",
          value: "id",
          title: "name",
          filterable: true,
          condition: (row: any) => {
            return row.unitType === 1 ? false : true;
          },
        },
        {
          label: "年龄",
          type: "input",
          prop: "age",
        },
        {
          label: "联系电话",
          type: "input",
          prop: "phone",
        },
        {
          label: "邮箱",
          type: "input",
          prop: "email",
        },
        {
          label: "行政执法证号",
          type: "input",
          prop: "officersNumber",
        },
        {
          label: "是否执法人员",
          type: "radio",
          prop: "isOfficers",
          value: "value",
          title: "title",
        },
      ],
      radios: {
        isOfficers: [
          {
            value: true,
            title: "是",
          },
          {
            value: false,
            title: "否",
          },
        ],
      },
      rules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        department: [
          { required: true, message: "请输入部门", trigger: "blur" },
        ],
        companyId: [
          { required: true, message: "请选择企业", trigger: "change" },
          { validator: validateCompany, trigger: "change" },
        ],
        age: [{ validator: validateage, trigger: "blur" }],
        phone: [{ validator: validatePhone, trigger: "blur" }],
        email: [{ validator: validateEmail, trigger: "blur" }],
      },
      // 查看
      checkDialogVisible: false,
    });
    let METHODS: any = reactive({
      // 获取单位类型列表
      handleUnitTypeList: async () => {
        let { data } = await getByKey({ key: "t_unit_type" });
        if (data.code === RES_SUCCESS) {
          DATA.unitTypeList = data.data;
          DATA.radios.unitType = data.data;
        }
      },
      // 分页获取人员
      handlePagingPerson: async (pagingParams: any) => {
        DATA.loading = true;
        let { data } = await getPagePersonnel(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handlePagingPerson(DATA.pagingParamsCopy);
      },
      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingPerson: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handlePagingPerson);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingPerson: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handlePagingPerson,
          total
        );
      },
      // 添加人员
      handleCreatePersonnel: () => {
        DATA.dialogVisible = true;
        DATA.dialogType = true;
        DATA.formData = Object.assign(
          {},
          {
            name: "",
            age: "",
            companyId: "",
            department: "",
            email: "",
            isEnable: true,
            isOfficers: true,
            isRelation: false,
            officersNumber: "",
            phone: "",
            sex: true,
            unitType: 1,
          }
        );
        nextTick(() => {
          proxy.$refs["formRef"].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "check":
            DATA.formData = Object.assign({}, row);
            DATA.checkDialogVisible = true;
            break;
          case "edit":
            DATA.dialogVisible = true;
            DATA.dialogType = false;
            let {
              id,
              name,
              age,
              companyId,
              department,
              email,
              isEnable,
              isOfficers,
              isRelation,
              officersNumber,
              phone,
              sex,
              unitType,
            } = row;
            DATA.formData = Object.assign(
              {},
              {
                id,
                name,
                age,
                companyId,
                department,
                email,
                isEnable,
                isOfficers,
                isRelation,
                officersNumber,
                phone,
                sex,
                unitType,
              }
            );
            DATA.companyId = row.companyId;
            nextTick(() => {
              proxy.$refs["formRef"].clearForm();
            });
            break;
          case "delete":
            let info = ""; //提示信息
            let isShowBtn = false; //控制按钮显示
            let key = await METHODS.getAssociatedInformation(row.id);
            switch (key) {
              case 1:
                info = "该人员关联系统数据过多,请联系管理员删除!";
                isShowBtn = false;
                break;
              case 2:
                info =
                  "该人员已关联用户,删除该人员会使用户一并删除,是否确认删除?";
                isShowBtn = true;
                break;
              case 3:
                info = "该人员暂未关联其他数据,是否确认删除?";
                isShowBtn = true;
                break;

              default:
                break;
            }
            proxy
              .$confirm(info, "提示", {
                type: "warning",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                showCancelButton: isShowBtn,
                showConfirmButton: isShowBtn,
              })
              .then(async () => {
                let { data } = await deletePersonnel({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!",
                  });
                  METHODS.handlePagingPerson(DATA.pagingParamsCopy);
                  STORE.dispatch("handleGetEnablePersonnel");
                  STORE.dispatch("handleGetNotEnablePersonnel");
                  if (STORE.state.user.personnel.id === row.id) {
                    STORE.state.user.personnel.companyId &&
                      STORE.dispatch("handleCompanySensor", row.companyId);
                  }
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs["formRef"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.unitType === 1) {
              DATA.formData.companyId = null;
            }
            if (DATA.formData.unitType === 2) {
              DATA.formData.department = null;
            }
            if (DATA.dialogType) {
              let { data } = await createPersonnel(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "添加人员成功",
                  type: "success",
                });
                DATA.dialogVisible = false;
                METHODS.handlePagingPerson(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetEnablePersonnel");
                STORE.dispatch("handleGetNotEnablePersonnel");
                STORE.dispatch("handleGetAllCompany");
              }
            } else {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              let { data } = await updatePersonnel(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "编辑人员成功",
                  type: "success",
                });
                DATA.dialogVisible = false;
                METHODS.handlePagingPerson(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetEnablePersonnel");
                STORE.dispatch("handleGetNotEnablePersonnel");
                STORE.dispatch("handleGetAllCompany");
                if (STORE.state.user.personnel.id === DATA.formData.id) {
                  if (DATA.formData.unitType === 2) {
                    STORE.dispatch(
                      "handleCompanySensor",
                      DATA.formData.companyId
                    );
                  }
                  STORE.commit("SET_Personnel", data.data);
                  STORE.dispatch("GetInfo");
                }
              }
            }
          }
        });
      },
      // 切换是否启用
      handleEmitChange: async (formData: any, item: any) => {
        // delete formData.createTime;
        // delete formData.updateTime;
        let {
          id,
          name,
          age,
          companyId,
          department,
          email,
          isEnable,
          isOfficers,
          isRelation,
          officersNumber,
          phone,
          sex,
          unitType,
        } = formData;
        DATA.formData = Object.assign(
          {},
          {
            id,
            name,
            age,
            companyId,
            department,
            email,
            isEnable,
            isOfficers,
            isRelation,
            officersNumber,
            phone,
            sex,
            unitType,
          }
        );
        let { data } = await updatePersonnel(DATA.formData);
        if (data.code === RES_SUCCESS) {
          if (formData.isEnable) {
            ElMessage({
              message: "启用成功",
              type: "success",
            });
          } else {
            ElMessage({
              message: "不启用成功",
              type: "success",
            });
          }
          STORE.dispatch("handleGetEnablePersonnel");
        }
      },
      // 获取 政府部门
      handleGovSector: async () => {
        let { data } = await getByKey({ key: "t_department_status" });
        if (data.code === RES_SUCCESS) {
          DATA.options.department = data.data;
        }
      },
      // 查询人员关联信息
      getAssociatedInformation: async (personnelId: number) => {
        let { data } = await getAssociatedInformation({ personnelId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
    });
    onMounted(async () => {
      DATA.options.companyId = STORE.state.globalData.companyList;
      await METHODS.handleGovSector();
      METHODS.handleUnitTypeList();
      METHODS.handlePagingPerson(DATA.pagingParams);
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        {
          text: "查看",
          handleType: "check",
          type: "success",
          size: "small",
          isShow: true,
        },
        {
          text: "编辑",
          type: "primary",
          handleType: "edit",
          size: "small",
          isShow: showBtnList.value.includes("edit"),
        },
        {
          text: "删除",
          type: "danger",
          handleType: "delete",
          size: "small",
          isShow: showBtnList.value.includes("delete"),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
      showBtnList,
    };
  },
});
</script>

<style>
.container{
  height: calc(100% - 40px) !important;
}
.right{
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
</style>