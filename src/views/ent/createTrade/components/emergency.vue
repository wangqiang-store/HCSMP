<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb mb-10">
        <h3>应急演练</h3>
        <el-button
          type="primary"
          size="small"
          :disabled="!isDisable"
          @click="handleCreate"
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
          <!-- <template #scanning>
            <EleUpload
              :fileList="fileList"
              :multiple="true"
              @uploadSuccess="uploadSuccess"
              @uploadRemove="uploadRemove"
            />
          </template> -->
          <template #scanning>
            <el-upload
              class="upload-demo"
              drag
              :action="IMG_URL"
              :headers="getItemtoken"
              :on-remove="uploadRemove"
              :on-success="uploadSuccess"
              :file-list="fileList"
              multiple
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传多个文件</em></div>
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
  createEmergencyDrill,
  deleteEmergencyDrill,
  updateEmergencyDrill,
} from '@/api/company/emergency';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleTable, EleUpload, EleForm },
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
    let dialogFormRef: any = ref(null);
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
          label: '演练时间',
          prop: 'drillTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.drillTime, '-', false);
          },
        },
        {
          label: '参与人员',
          prop: 'participant',
          type: 'text',
        },
        {
          label: '演练内容',
          prop: 'content',
          type: 'text',
        },
        {
          label: '演练情况效果',
          prop: 'result',
          type: 'text',
        },
        {
          // label: '附件',
          // prop: 'files',
          // moreImage: true,
          // value: 'path',
          // type: 'image',

          label: '附件',
          type: 'file',
          moreFile: true,
          prop: 'files',
          href: 'path',
          name: 'name',
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
      fileIds: [],
      options: {},
      dialogRenderFormArr: [
        {
          label: '演练时间',
          type: 'date',
          prop: 'drillTime',
          placeholder: '请选择演练时间',
          labelWidth: 120,
        },
        {
          label: '参与人员',
          type: 'input',
          prop: 'participant',
          labelWidth: 120,
        },
        // {
        //   label: '文件名',
        //   type: 'input',
        //   prop: 'fileName',
        //   labelWidth: 120,
        // },
        {
          label: '演练内容',
          type: 'input',
          prop: 'content',
          inputType: 'textarea',
          labelWidth: 120,
        },
        {
          label: '演练情况效果',
          prop: 'result',
          type: 'input',
          inputType: 'textarea',
          labelWidth: 120,
        },
        {
          label: '文件',
          type: 'slot',
          slotName: 'scanning',
          prop: 'fileIds',
          labelWidth: 120,
        },
      ],
      dialogRules: {
        drillTime: [
          {
            required: true,
            message: '请选择演练时间',
            trigger: 'change',
          },
        ],
        participant: [
          {
            required: true,
            message: '请选择参与人员',
            trigger: 'change',
          },
        ],
        content: [
          {
            required: true,
            message: '请输入演练内容',
            trigger: 'blur',
          },
        ],
        // fileName: [
        //   {
        //     required: true,
        //     message: '请输入文件名',
        //     trigger: 'change',
        //   },
        // ],
      },
      fileList: [],
      tableLoading: false,
      files: [],
    });
    let METHODS = reactive({
      handleCreate: () => {
        DATA.dialogTitle = '添加应急演练';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.fileList = [];
        DATA.dialogFormData = {
          companyInfoId: '',
          content: '',
          drillTime: '',
          fileIds: [],
          id: '',
          participant: '',
          result: '',
        };
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑应急演练';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign(
              {},
              {
                companyInfoId: row.companyInfoId,
                content: row.content,
                drillTime: row.drillTime,
                fileIds: row.fileIds,
                id: row.id,
                participant: row.participant,
                result: row.result,
              }
            );
            DATA.files = row.files;
            DATA.fileList = [];
            DATA.dialogFormData.fileIds = [];
            if (row.files != null) {
              for (let item of row.files) {
                DATA.dialogFormData.fileIds.push(item.id);
                DATA.fileList.push({
                  name: item.name,
                  url: IMG_File + item.path,
                });
              }
            }
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
                let { data } = await deleteEmergencyDrill({
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
            // if (!DATA.dialogFormData.fileIds) {
            //   ElMessage({
            //     message: '请选择文件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            DATA.dialogFormData.drillTime &&
              (DATA.dialogFormData.drillTime = filterTime(
                DATA.dialogFormData.drillTime,
                '/'
              ));
            DATA.tableLoading = true;
            if (Array.isArray(DATA.dialogFormData.fileIds)) {
              DATA.dialogFormData.fileIds =
                DATA.dialogFormData.fileIds.join(',');
            }
            if (DATA.dialogType) {
              let { data } = await createEmergencyDrill({
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
              let { data } = await updateEmergencyDrill({
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
        if (Array.isArray(DATA.dialogFormData.fileIds)) {
          DATA.dialogFormData.fileIds.push(res.data.id);
        } else {
          DATA.dialogFormData.fileIds =
            DATA.dialogFormData.fileIds === ''
              ? []
              : DATA.dialogFormData.fileIds.split(',');
          DATA.dialogFormData.fileIds.push(res.data.id);
        }
      },
      uploadRemove: (obj: any, fileList: any) => {
        DATA.fileIds = [];
        let files = [];
        for (let item of fileList) {
          files.push(item.url);
        }
        for (let item of DATA.files) {
          if (files.includes(item.path)) {
            DATA.fileIds.push(item.id);
          }
        }
        DATA.dialogFormData.fileIds = DATA.fileIds.join(',');
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.emergencyDrillList;
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
    onMounted(() => {});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
      IMG_URL,
      getItemtoken,
    };
  },
});
</script>
<style scoped lang="scss">
</style>