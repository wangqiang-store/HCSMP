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
            @click="handleCreateAccount"
            v-if="showBtnList.includes('create')"
          ><i class="el-icon-plus mr-5"></i>添加账号信息</el-button>
          <div>
            <el-input
              placeholder="搜索账号或人员名称"
              v-model="pagingParams.keyword"
              style="width: 200px"
              class="mr-10"
              clearable
            ></el-input>
            <el-button
              type="primary"
              @click="handleSearch"
            ><i class="el-icon-search mr-5"></i>搜索</el-button>
          </div>
        </el-col>
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
            class="mb-10"
            @handleBtnEvent="handleBtnEvent"
          >
            <template #isEnable="scoped">
              <el-switch
                style="display: flex; justify-content: center"
                :disabled="scoped.row.username == 'admin'"
                v-model="scoped.row.isEnable"
                :active-color="scoped.row.color || '#13ce66'"
                @change="handleEmitChange(scoped.row)"
              >
              </el-switch>
            </template>
          </ele-table>
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
        <el-col :span="24">
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="dialogTitle"
            v-model="dialogVisible"
            width="30%"
          >
            <ele-form
              :formData="formData"
              :renderFormArr="renderFormArr"
              :rules="rules"
              :options="options"
              ref="formRef"
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
          <!-- 查看模态框 -->
          <el-dialog
            v-model="checkDialogVisible"
            width="70%"
          >
            <el-descriptions
              class="margin-top"
              title="账号详细信息"
              :column="3"
              border
            >
              <el-descriptions-item>
                <template #label> 账户名 </template>
                <el-tag type="info">{{ formData.username }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 人员 </template>
                <el-tag type="info">
                  {{
                    formData.personnel ? formData.personnel.name : "无"
                  }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label> 角色 </template>
                <el-tag type="info">
                  {{ formData.roleName ? formData.roleName : "无" }}</el-tag>
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
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { filterTime } from "@/utils/filtration";
import {
  checkRepeat,
  createAccount,
  getPageAccount,
  updateAccount
} from "@/api/system/account";
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import { useStore } from "vuex";
import { verifyPwd } from "@/api/common/verify";
import { ElMessage } from "element-plus";
import { deleteUser, resetPassword } from "@/api/system/sysUser";
import md5 from "js-md5";
import { useRoute } from "vue-router";

export default defineComponent({
  components: { EleTable, ElePagination, EleForm },
  setup() {
    const { proxy }: any = getCurrentInstance();
    var validatePass = (rule: any, value: any, callback: any) => {
      if (value.length < 8) {
        callback(new Error("密码长度至少8位"));
      } else {
        if (verifyPwd.test(value)) {
          callback();
        } else {
          callback(new Error("密码至少包含数字、字母、特殊字符两种"));
        }
      }
    };
    var validatePass2 = (rule: any, value: any, callback: any) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== DATA.formData.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    var repeatName = (rule: any, value: any, callback: any) => {
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
        if (DATA.username == value) {
          callback();
          return;
        }

        checkRepeat({ username: value }).then((res) => {
          if (res.data.code == 500) {
            callback(new Error("用户名重复，请重新输入"));
          } else {
            callback();
          }
        });
      } else {
        callback(
          new Error("用户名仅支持英文和数字且开头为英文,不允许输入特殊符号")
        );
      }
    };
    const STORE = useStore();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      pagingParams: {
        keyword: "",
        limit: 10,
        page: 1
      },
      pagingParamsCopy: {
        keyword: "",
        limit: 10,
        page: 1
      },
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "账号",
          type: "text",
          prop: "username"
        },
        {
          label: "人员",
          type: "text",
          formatter: (row: any) => {
            return row.personnel.name;
          }
        },
        {
          label: "角色",
          type: "text",
          prop: "roleName"
        },
        // {
        //   label: '是否启用',
        //   type: 'switch',
        //   prop: 'isEnable',
        // },
        {
          label: "是否启用",
          type: "slot",
          prop: "isEnable",
          slotName: "isEnable"
        },
        {
          label: "创建时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return filterTime(row.createTime);
          }
        },
        {
          label: "操作",
          type: "handle",
          width: 350
        }
      ],
      btnList: [],
      total: 0,
      // 添加、编辑模态框
      dialogTitle: "",
      dialogVisible: false,
      dialogType: false,
      formData: {
        username: "",
        password: "",
        confirmPwd: "",
        personnelId: "",
        roleId: ""
      },
      renderFormArr: [],
      rules: {
        username: [
          { required: true, message: "请输入账号名", trigger: "blur" },
          { validator: repeatName, trigger: "blur", required: true },
          {
            pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$/,
            message: "不允许输入特殊符号"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator: validatePass }
        ],
        confirmPwd: [
          { validator: validatePass2, trigger: "blur", required: true }
        ],
        roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
        personnelId: [
          { required: true, message: "请选择人员", trigger: "change" }
        ]
      },
      options: {},
      username: "",
      checkDialogVisible: false
    });
    let METHODS: any = reactive({
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        let { data } = await getPageAccount(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
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
      handleCreateAccount: () => {
        let notEnablePersonnelList: Array<number> = [];
        DATA.dialogTitle = "添加账号";
        DATA.dialogVisible = true;
        DATA.dialogType = true;
        DATA.username = "";
        DATA.formData = Object.assign(
          {},
          {
            username: "",
            password: "",
            confirmPwd: "",
            personnelId: "",
            roleId: "",
            isEnable: true
          }
        );
        DATA.renderFormArr = [
          {
            label: "账号名",
            type: "input",
            prop: "username"
          },
          {
            label: "密码",
            type: "input",
            inputType: "password",
            prop: "password"
          },
          {
            label: "确认密码",
            type: "input",
            inputType: "password",
            prop: "confirmPwd"
          },
          {
            label: "人员",
            type: "select",
            prop: "personnelId",
            value: "id",
            title: "name"
          },
          {
            label: "角色",
            type: "select",
            prop: "roleId",
            value: "id",
            title: "name"
          }
        ];
        nextTick(() => {
          STORE.state.globalData.notEnablePersonnelList.forEach((val: any) => {
            notEnablePersonnelList.push(val.id);
          });
          STORE.state.globalData.enablePersonnelList.forEach((item: any) => {
            if (STORE.state.globalData.notEnablePersonnelList.length === 0) {
              item.disabled = true;
            } else {
              if (notEnablePersonnelList.includes(item.id)) {
                item.disabled = false;
              } else {
                item.disabled = true;
              }
            }
          });
          DATA.options.personnelId = STORE.state.globalData.enablePersonnelList;
          proxy.$refs["formRef"].clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "check":
            DATA.checkDialogVisible = true;
            DATA.formData = Object.assign({}, row);
            break;
          case "edit":
            let notEnablePersonnelList: Array<number> = [];
            DATA.dialogTitle = "编辑账号";
            DATA.dialogVisible = true;
            DATA.dialogType = false;
            let { id, username, personnelId, roleId } = row;
            DATA.username = username;
            DATA.formData = Object.assign(
              {},
              { id, username, personnelId, roleId }
            );
            DATA.renderFormArr = [
              {
                label: "账号名",
                type: "input",
                prop: "username"
              },
              {
                label: "人员",
                type: "select",
                prop: "personnelId",
                value: "id",
                title: "name"
              },
              {
                label: "角色",
                type: "select",
                prop: "roleId",
                value: "id",
                title: "name"
              }
            ];
            nextTick(() => {
              STORE.state.globalData.notEnablePersonnelList.forEach(
                (val: any) => {
                  notEnablePersonnelList.push(val.id);
                }
              );
              notEnablePersonnelList.push(personnelId);
              STORE.state.globalData.enablePersonnelList.forEach(
                (item: any) => {
                  if (
                    STORE.state.globalData.notEnablePersonnelList.length === 0
                  ) {
                    if (item.id != personnelId) {
                      item.disabled = true;
                    } else {
                      item.disabled = false;
                    }
                  } else {
                    if (notEnablePersonnelList.includes(item.id)) {
                      item.disabled = false;
                    } else {
                      item.disabled = true;
                    }
                  }
                }
              );
              DATA.options.personnelId =
                STORE.state.globalData.enablePersonnelList;
              proxy.$refs["formRef"].clearForm();
            });
            break;
          case "resetPwd":
            proxy
              .$confirm("是否确定重置密码?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(async () => {
                let { data } = await resetPassword({ userId: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "密码重置成功!"
                  });
                }
              })
              .catch(() => {});
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该账号?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(async () => {
                let { data } = await deleteUser({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!"
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                  STORE.dispatch("handleGetNotEnablePersonnel");
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      handleConfirm: () => {
        proxy.$refs["formRef"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.dialogType) {
              let { data } = await createAccount({
                ...DATA.formData,
                password: md5(DATA.formData.password)
              });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "账号添加成功",
                  type: "success"
                });
                DATA.dialogVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetNotEnablePersonnel");
              }
            } else {
              let { data } = await updateAccount(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "账号编辑成功",
                  type: "success"
                });
                DATA.dialogVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetNotEnablePersonnel");
              }
            }
          }
        });
      },
      // 切换是否启用
      handleEmitChange: async (formData: any, item: any) => {
        // delete formData.createTime;
        // delete formData.updateTime;
        let { id, username, personnelId, roleId, isEnable } = formData;
        let { data } = await updateAccount({
          id,
          username,
          personnelId,
          roleId,
          isEnable
        });
        if (data.code === RES_SUCCESS) {
          if (formData.isEnable) {
            ElMessage({
              message: "启用成功",
              type: "success"
            });
          } else {
            ElMessage({
              message: "不启用成功",
              type: "success"
            });
          }
        }
      }
    });
    onMounted(() => {
      STORE.state.globalData.enableRoleList.forEach((item: any) => {
        if (item.id === 1) {
          item.disabled = true;
        }
      });
      DATA.options.roleId = STORE.state.globalData.enableRoleList;
      METHODS.handleGetPagingData(DATA.pagingParams);
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
          isShow: true
        },
        {
          handleType: "edit",
          isShow: showBtnList.value.includes("edit"),
          condition: (row: any) => {
            let btnOption = {
              text: "编辑",
              type: "primary",
              isdisable: false,
              size: "small"
            };
            if (row.roleId === 1 && STORE.state.user.roleId !== 1) {
              btnOption.isdisable = true;
            }
            return btnOption;
          }
        },
        {
          text: "重置密码",
          type: "warning",
          handleType: "resetPwd",
          size: "small",
          isShow: showBtnList.value.includes("reset"),
        },
        {
          handleType: "delete",
          isShow: showBtnList.value.includes("delete"),
          condition: (row: any) => {
            let btnOption = {
              text: "删除",
              type: "danger",
              isdisable: false,
              size: "small"
            };
            if (row.roleId === 1) {
              btnOption.isdisable = true;
            }
            return btnOption;
          }
        }
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
      showBtnList
    };
  }
});
</script>

<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
}
</style>