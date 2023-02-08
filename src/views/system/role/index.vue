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
            @click="handleCreateRole"
            v-if="showBtnList.includes('create')"
          ><i class="el-icon-plus mr-5"></i>添加角色信息</el-button>
          <div>
            <el-input
              placeholder="搜索角色名称"
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
                  handlePagingRole
                )
            "
            @handleSizeChange="
              (val) =>
                handleSizeChange(
                  val,
                  pagingParams,
                  pagingParamsCopy,
                  handlePagingRole,
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
            width="50%"
          >
            <ele-form
              :formData="formData"
              :renderFormArr="renderFormArr"
              :rules="rules"
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
          <!-- 权限模态框 -->
          <el-dialog
            title="权限管理"
            v-model="dialogAuthVisible"
            width="50%"
            @close="handleClose"
          >
            <el-tree
              :data="authTreeArr"
              show-checkbox
              node-key="id"
              :props="defaultProps"
              ref="treeRef"
              :default-checked-keys="checkedArr"
              :check-strictly="true"
              @check="hanleCheck"
              v-if="isCheck"
            >
            </el-tree>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogAuthVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmAuth"
                  :loading="authLoading"
                >确 定</el-button>
              </span>
            </template>
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
import EleForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import {
  createRole,
  deleteRole,
  getRoleModule,
  searchRole,
  updateRole,
  updateRoleModule
} from "@/api/system/sysRole";
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import { ElMessage } from "element-plus";
import { getModule } from "@/api/system/sysModule";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    const { proxy }: any = getCurrentInstance();
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
          label: "角色名称",
          type: "text",
          prop: "name"
        },
        {
          label: "创建者",
          type: "text",
          prop: "createName"
        },
        {
          label: "是否启用",
          type: "switch",
          prop: "isEnable",
          condition: (row: any) => {
            if (row.id === 1) {
              return {
                isdisable: true
              };
            } else {
              return {
                isdisable: false
              };
            }
          }
        },
        {
          label: "备注",
          type: "text",
          prop: "remark"
        },
        {
          label: "操作",
          type: "handle",
          width: 300
        }
      ],
      btnList: [],
      total: 0,
      loading: false,
      // 表单
      dialogTitle: "",
      dialogVisible: false,
      dialogType: false,
      formData: {
        isEnable: true,
        name: "",
        remark: ""
      },
      renderFormArr: [
        {
          label: "角色名称",
          type: "input",
          prop: "name"
        },
        {
          label: "备注",
          type: "input",
          prop: "remark",
          inputType: "textarea"
        }
      ],
      rules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        remark: [{ required: true, message: "请输入备注信息", trigger: "blur" }]
      },
      // 控制权限管理模态框显示隐藏
      dialogAuthVisible: false,
      defaultProps: {
        children: "children",
        label: "label"
      },
      authTreeArr: [],
      selectedAuthArr: [],
      // 选择权限数组
      checkedArr: [],
      isCheck: false,
      changeCheckedArr: [],
      roleModuleAddDel: {
        addList: [],
        delList: [],
        roleId: ""
      },
      allModule: [],
      authLoading: false,
      allModuleList: []
    });
    let METHODS: any = reactive({
      handlePagingRole: async (pagingParams: any) => {
        DATA.loading = true;
        let { data } = await searchRole(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handlePagingRole(DATA.pagingParamsCopy);
      },
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingRole: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handlePagingRole);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handlePagingRole: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handlePagingRole,
          total
        );
      },
      handleCreateRole: () => {
        DATA.dialogTitle = "添加角色";
        DATA.dialogVisible = true;
        DATA.dialogType = true;
        DATA.formData = Object.assign(
          {},
          {
            name: "",
            remark: "",
            isEnable: true
          }
        );
        nextTick(() => {
          proxy.$refs["formRef"].clearForm();
        });
      },
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.dialogTitle = "编辑角色";
            DATA.dialogVisible = true;
            DATA.dialogType = false;
            let { id, name, remark } = row;
            DATA.formData = Object.assign({}, { id, name, remark });
            nextTick(() => {
              proxy.$refs["formRef"].clearForm();
            });
            break;
          case "auth":
            DATA.roleModuleAddDel.roleId = row.id;
            METHODS.getRoleModule(row.id);
            DATA.authTreeArr = [];
            DATA.authTreeArr = METHODS.filtersAuthTreeArr(
              DATA.authTreeArr,
              DATA.allModuleList
            );
            DATA.dialogAuthVisible = true;
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该角色?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(async () => {
                let { data } = await deleteRole({ roleId: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!"
                  });
                  METHODS.handlePagingRole(DATA.pagingParamsCopy);
                  STORE.dispatch("handleGetEnableRole");
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirm: () => {
        proxy.$refs["formRef"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.dialogType) {
              let { data } = await createRole(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "角色添加成功",
                  type: "success"
                });
                DATA.dialogVisible = false;
                METHODS.handlePagingRole(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetEnableRole");
              }
            } else {
              let { data } = await updateRole(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "角色编辑成功",
                  type: "success"
                });
                DATA.dialogVisible = false;
                METHODS.handlePagingRole(DATA.pagingParamsCopy);
                STORE.dispatch("handleGetEnableRole");
              }
            }
          }
        });
      },
      // 切换是否启用
      handleEmitChange: async (formData: any, item: any) => {
        delete formData.createTime;
        delete formData.updateTime;
        let { data } = await updateRole(formData);
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
          STORE.dispatch("handleGetEnableRole");
        }
      },
      // 获取所有模块
      getModule: async () => {
        let { data } = await getModule();
        if (data.code === RES_SUCCESS) {
          DATA.allModuleList = data.data;
        }
      },
      // 获取角色模块
      getRoleModule: async (id: any) => {
        DATA.checkedArr = [];
        let { data } = await getRoleModule({ roleId: id });
        if (data.code === RES_SUCCESS) {
          DATA.isCheck = true;
          data.data.forEach((item: any) => {
            DATA.checkedArr.push(item.moduleId);
          });
          nextTick(() => {
            // 初始选中模块
            DATA.selectedAuthArr = proxy.$refs["treeRef"].getCheckedKeys();
          });
        }
      },
      // 确认权限模块
      handleConfirmAuth: async () => {
        DATA.roleModuleAddDel.addList = [];
        DATA.roleModuleAddDel.delList = [];
        // 获取最新 选中模块
        DATA.changeCheckedArr = proxy.$refs["treeRef"].getCheckedKeys();
        // 获取添加 模块列表
        DATA.roleModuleAddDel.addList = DATA.changeCheckedArr.filter(
          (item: any) => {
            return !DATA.selectedAuthArr.includes(item);
          }
        );
        // 获取删除 模块列表
        DATA.roleModuleAddDel.delList = DATA.selectedAuthArr.filter(
          (item: any) => {
            return !DATA.changeCheckedArr.includes(item);
          }
        );

        DATA.authLoading = true;
        let { data } = await updateRoleModule(DATA.roleModuleAddDel);
        if (data.code === RES_SUCCESS) {
          ElMessage.success({
            message: "编辑成功",
            type: "success"
          });
          DATA.dialogAuthVisible = false;
          DATA.authLoading = false;
          if (STORE.state.user.roleId === DATA.roleModuleAddDel.roleId) {
            history.go(0);
          }
        }
      },
      // 复选框切换
      hanleCheck: (data: any, node: any) => {
        // 获取当前节点是否被选中
        const isChecked = proxy.$refs["treeRef"].getNode(data).checked;
        // 如果当前节点被选中，则遍历上级节点和下级子节点并选中，如果当前节点取消选中，则遍历下级节点并取消选中
        if (isChecked) {
          // 判断是否有上级节点，如果有那么遍历设置上级节点选中
          data.parentId && setParentChecked(data.parentId);
          // 判断该节点是否有下级节点，如果有那么遍历设置下级节点为选中
          data.children && setChildreChecked(data.children, true);
        } else {
          // 如果节点取消选中，则取消该节点下的子节点选中
          data.children && setChildreChecked(data.children, false);
        }
        function setParentChecked(parentId: any) {
          // 获取该id的父级node
          const parentNode = proxy.$refs["treeRef"].getNode(parentId);
          // 如果该id的父级node存在父级id则继续遍历
          parentNode.data.parentId &&
            setParentChecked(parentNode.data.parentId);
          //  设置该id的节点为选中状态
          proxy.$refs["treeRef"].setChecked(parentId, true);
        }
        function setChildreChecked(node: any, isChecked: any) {
          node.forEach((item: any) => {
            item.children && setChildreChecked(item.children, isChecked);
            proxy.$refs["treeRef"].setChecked(item.id, isChecked);
          });
        }
      },
      // 自定义生成树状权限数据
      filtersAuthTreeArr: (arr: any, data: any) => {
        data.forEach((item: any) => {
          let obj = {
            id: item.id,
            parentId: item.parentId,
            label: item.name,
            children: []
          };
          if (item.children != undefined && item.children.length > 0) {
            METHODS.filtersAuthTreeArr(obj.children, item.children);
          }
          if (item.name != "首页") {
            arr.push(obj);
          }
        });
        return arr;
      },
      handleClose: () => {
        DATA.isCheck = false;
      }
    });
    onMounted(() => {
      METHODS.handlePagingRole(DATA.pagingParams);
      METHODS.getModule();
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        {
          text: "编辑",
          type: "primary",
          handleType: "edit",
          size: "small",
          isShow: showBtnList.value.includes("edit")
        },
        {
          handleType: "auth",
          isShow: showBtnList.value.includes("authority"),
          condition: (row: any) => {
            let btnOption = {
              text: "权限",
              type: "warning",
              isdisable: false,
              size: "small"
            };
            if (row.id === 1 && STORE.state.user.roleId !== 1) {
              btnOption.isdisable = true;
            }
            return btnOption;
          }
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
            if (row.id === 1) {
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
      showBtnList
    };
  }
});
</script>

<style lang="scss" scoped>
</style>