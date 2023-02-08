<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>企业其他台账信息</h3>
      </div>
    </el-col>
    <el-col :span="24">
      <div class="mb-10 tar">
        <el-button
          type="primary"
          size="small"
          :disabled="!isDisable"
          @click="handleCreateLedger"
        >添加</el-button>
      </div>
      <!-- 表格数据 -->
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        :btnList="btnList"
        @handleBtnEvent="handleBtnEvent"
        v-loading="tableLoading"
      >
        <template #file="scope">
          <div style="text-align: center">
            <a
              :href="scope.row.filePath"
              target="_blank"
            >{{
              scope.row.fileName
            }}</a>
          </div>
        </template>
      </ele-table>
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
            <EleUpload :imageList="imageList" @uploadSuccess="uploadSuccess" />
          </template> -->

          <template #scanning>
            <el-upload
              class="upload-demo"
              drag
              :action="IMG_URL"
              :headers="getItemtoken"
              :on-remove="handleRemove"
              :on-success="uploadSuccess"
              :file-list="imageList"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传单个文件</em>
              </div>
              <!-- <template #tip>
                <div class="el-upload__tip">每次只能上传一份</div>
              </template> -->
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
import EleForm from '@/components/eleForm/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import {
  createLedgerInfo,
  updateLedgerInfo,
  deleteLedgerInfo,
} from '@/api/ent/trade';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleForm, EleTable, EleUpload },
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
    const ROUTE = useRoute();
    const STORE = useStore();
    const companyInfoRef: any = ref(null);
    const dialogFormRef: any = ref(null);
    let DATA: any = reactive({
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      btnDisable: '',

      loading: false,
      tableLoading: false,
      formData: {},
      options: {},
      disable: true,
      // 表格
      tableData: [],
      renderTable: [
        {
          label: '添加时间',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.addTime);
          },
        },
        {
          label: '台账类型',
          type: 'text',
          prop: 'type',
          formatter: (row: any) => {
            let type = '';
            DATA.options.type.forEach((item: any) => {
              if (item.value === row.type) {
                type = item.name;
              }
            });
            return type;
          },
        },
        // {
        //   label: "文件名",
        //   type: "text",
        //   prop: "fileName",
        // },
        {
          label: '文件',
          type: 'file',
          prop: 'fileName',
          name: 'fileName',
          href: 'filePath',
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
      btnList: [
        {
          handleType: 'edit',
          isShow: true,
          condition: (row: any) => {
            let btnOption = {
              text: '编辑',
              type: 'primary',
              isdisable: !props.isDisable,
              size: 'small',
            };
            return btnOption;
          },
        },
        {
          handleType: 'delete',
          isShow: true,
          condition: (row: any) => {
            let btnOption = {
              text: '删除',
              type: 'danger',
              isdisable: !props.isDisable,
              size: 'small',
            };
            return btnOption;
          },
        },
      ],
      // 添加、编辑模态框
      dialogTitle: '',
      dialogVisible: false,
      dialogFormData: {},
      dialogRenderFormArr: [
        {
          label: '添加时间',
          type: 'date',
          prop: 'addTime',
          dateType: 'datetime',
          labelWidth: 150,
        },
        {
          label: '台账类型',
          type: 'select',
          prop: 'type',
          title: 'name',
          value: 'value',
          labelWidth: 150,
        },
        // {
        //   label: "文件名",
        //   type: "input",
        //   prop: "fileName",
        //   labelWidth: 150,
        // },
        {
          label: '备注',
          type: 'input',
          inputType: 'textarea',
          prop: 'remark',
          labelWidth: 150,
        },
        {
          label: '文件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 150,
        },
      ],
      // 表格弹框规则
      dialogRules: {
        addTime: [
          {
            required: true,
            message: '请选择添加时间',
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: '请选择台账类型',
            trigger: 'change',
          },
        ],
        // fileName: [
        //   {
        //     required: true,
        //     message: "请输入文件名",
        //     trigger: "blur",
        //   },
        // ],
      },
      dialogType: false,
      imageList: [],
    });
    let METHODS = reactive({
      handleGetKey: () => {
        // 获取台账类型
        getByKey({ key: 't_company_ledger_type' })
          .then((res) => {
            if (res.data.code == RES_SUCCESS) {
              DATA.options.type = res.data.data;
            }
          })
          .catch(() => {});
      },
      // 添加按钮
      handleCreateLedger: () => {
        DATA.formData.companyInfoId = DATA.formData.companyInfoId
          ? DATA.formData.companyInfoId
          : STORE.state.globalData.companyInfo.companyId;

        if (DATA.formData.companyInfoId) {
          DATA.dialogTitle = '添加企业台账';
          DATA.dialogFormData = {};
          DATA.imageList = [];
          DATA.dialogVisible = true;
          DATA.dialogType = true;
          nextTick(() => {
            dialogFormRef.value.clearForm();
          });
        } else {
          // 营业执照信息未填写
          ElMessage({
            message: '请先填写营业执照',
            type: 'warning',
          });
        }
      },
      // 表格按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑企业台账';
            DATA.dialogFormData = Object.assign({}, { ...row });

            DATA.imageList = [];
            if (row.filePath) {
              DATA.imageList.push({ name: row.fileName, url: row.filePath });
            }

            DATA.dialogVisible = true;
            DATA.dialogType = false;
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该企业台账?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteLedgerInfo({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '营业执照删除成功!',
                  });

                  //未返回新数据, 只能自己模拟
                  let delIndex = null;
                  DATA.tableData.forEach((item: any, index: number) => {
                    if (item.id == row.id) {
                      delIndex = index;
                      return;
                    }
                  });
                  DATA.tableData.splice(delIndex, 1);
                }
              })
              .catch(() => {});
            break;

          default:
            break;
        }
      },
      handleConfirm: () => {
        dialogFormRef.value
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              // if (!DATA.dialogFormData.fileId) {
              //   ElMessage({
              //     message: '请选择扫描件',
              //     type: 'warning',
              //   });
              //   return;
              // }
              DATA.tableLoading = true;
              DATA.dialogFormData.addTime = filterTime(
                DATA.dialogFormData.addTime,
                '/'
              );

              // 新增
              if (DATA.dialogType) {
                // console.log(DATA.dialogFormData);
                // let aa= DATA.formData.id
                //     ? DATA.formData.id
                //     : STORE.state.globalData.companyInfo.id

                DATA.dialogFormData.id = DATA.dialogFormData.id
                  ? DATA.dialogFormData.id
                  : '';
                let { data } = await createLedgerInfo({
                  ...DATA.dialogFormData,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '添加台账信息成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              } else {
                // delete DATA.dialogFormData.createTime;
                // delete DATA.dialogFormData.updateTime;

                let { data } = await updateLedgerInfo({
                  ...DATA.dialogFormData,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '编辑台账信息成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              }
            }
          })
          .catch(() => {});
      },
      uploadSuccess: (res: any, file: any, fileList: any) => {
        DATA.dialogFormData.fileId = res.data.id;
        DATA.dialogFormData.fileName = res.data.name;

        // 上传列表控制
        if (fileList.length > 0) {
          DATA.imageList = [fileList[fileList.length - 1]]; // 这一步，是 展示最后一次选择的csv文件
        }
      },
      handleRemove: (res: any, fileList: any) => {
        DATA.imageList = [];
        DATA.dialogFormData.fileId = null;
      },
    });

    // 监听来源数据
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.ledgerInfoList;
      },
      {
        deep: true,
      }
    );
    watch(
      () => props.isDisable,
      () => {
        DATA.disable = props.isDisable;
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
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);
      METHODS.handleGetKey();
      DATA.btnDisable = STORE.state.globalData.companyInfo.id;
      //   METHODS.handleGetCompanyType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      companyInfoRef,
      dialogFormRef,
      IMG_URL,
      getItemtoken,
    };
  },
});
</script>
<style scoped lang="scss">
a {
  display: inline-block;
}
</style>