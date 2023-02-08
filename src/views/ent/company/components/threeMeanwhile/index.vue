<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb mb-10">
        <h3>三同时及安全评价信息</h3>
        <el-button
          type="primary"
          size="small"
          @click="handleCreate"
          :disabled="!isDisable"
        >添加</el-button>
      </div>
      <ele-table
        :tableData="tableData"
        :btnList="btnList"
        :renderTable="renderTable"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
        v-loading="tableLoading"
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
          :options="options"
          ref="dialogFormRef"
        >
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
import EleTable from '@/components/eleTable/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import {
  createThreesimultaneous,
  deleteThreesimultaneous,
  updateThreesimultaneous,
} from '@/api/company/threeMeanwhile';
import { filterTime } from '@/utils/filtration';
import { useStore } from 'vuex';
import {
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { ElMessage } from 'element-plus';
export default defineComponent({
  components: { EleTable, EleUpload, EleForm },
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
    const dialogFormRef: any = ref(null);
    let DATA: any = reactive({
      tableData: [],
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
      renderTable: [
        {
          label: '单位类型',
          prop: 'unitType',
          type: 'text',
          formatter: (row: any) => {
            let text = '';
            DATA.options.unitType.forEach((item: any) => {
              if (item.value === row.unitType) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: '单位名称',
          prop: 'unitName',
          type: 'text',
        },
        {
          label: '单位资质',
          prop: 'unitLevel',
          type: 'text',
          formatter: (row: any) => {
            let text = '';
            DATA.options.unitLevel.forEach((item: any) => {
              if (item.value === row.unitLevel) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: '评价时间',
          prop: 'evaluationTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.evaluationTime, '-', false);
          },
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
      disable: true,
      formData: {},
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      options: {},
      dialogRenderFormArr: [
        {
          label: '单位类型',
          type: 'select',
          prop: 'unitType',
          value: 'value',
          title: 'name',
          placeholder: '请选择单位类型',
          labelWidth: 120,
        },
        {
          label: '单位名称',
          type: 'input',
          prop: 'unitName',
          labelWidth: 120,
        },
        {
          label: '单位资质',
          type: 'select',
          prop: 'unitLevel',
          value: 'value',
          title: 'name',
          placeholder: '请选择单位资质',
          labelWidth: 120,
        },
        {
          label: '评价时间',
          type: 'date',
          prop: 'evaluationTime',
          placeholder: '请选择时间',
          labelWidth: 120,
        },
        {
          label: '扫描件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 120,
        },
      ],
      dialogRules: {
        unitType: [
          {
            required: true,
            message: '请选择单位类型',
            trigger: 'change',
          },
        ],
        unitName: [
          {
            required: true,
            message: '请输入单位名称',
            trigger: 'blur',
          },
        ],
        unitLevel: [
          {
            required: true,
            message: '请选择单位资质',
            trigger: 'change',
          },
        ],
        evaluationTime: [
          {
            required: true,
            message: '请选择评价时间',
            trigger: 'change',
          },
        ],
      },
      fileList: [],
      tableLoading: false,
    });
    let METHODS = reactive({
      // 获取单位类型
      handleUnitType: async () => {
        if (sessionRead('t_three_unit_type')) {
          DATA.options.unitType = sessionRead('t_three_unit_type');
        } else {
          let { data } = await getByKey({ key: 't_three_unit_type' });
          if (data.code === RES_SUCCESS) {
            DATA.options.unitType = data.data;
            sessionWrite('t_three_unit_type', data.data);
          }
        }
      },
      // 获取单位资质
      handleUnitLevel: async () => {
        if (sessionRead('t_three_unit_level')) {
          DATA.options.unitLevel = sessionRead('t_three_unit_level');
        } else {
          let { data } = await getByKey({ key: 't_three_unit_level' });
          if (data.code === RES_SUCCESS) {
            DATA.options.unitLevel = data.data;
            sessionWrite('t_three_unit_level', data.data);
          }
        }
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加三同时及安全评价信息';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.fileList = [];
        DATA.dialogFormData = {};
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑三同时及安全评价信息';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
            DATA.dialogFormData.evaluationTime = filterTime(
              row.evaluationTime,
              '/'
            );
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
              .$confirm('是否确定删除该信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteThreesimultaneous({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '删除成功!',
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
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: '请先填写保存营业执照信息',
                type: 'warning',
              });
              return;
            }
            DATA.dialogFormData.evaluationTime = filterTime(
              DATA.dialogFormData.evaluationTime,
              '/'
            );
            DATA.tableLoading = true;
            if (DATA.dialogType) {
              let { data } = await createThreesimultaneous({
                ...DATA.dialogFormData,
                companyInfoId: DATA.formData.companyInfoId,
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
              let { data } = await updateThreesimultaneous({
                ...DATA.dialogFormData,
                companyInfoId: DATA.formData.companyInfoId,
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
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.threesimultaneous;
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
      METHODS.handleUnitType();
      METHODS.handleUnitLevel();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
</style>