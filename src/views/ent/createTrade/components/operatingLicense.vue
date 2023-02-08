<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>经营许可证</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            @click="disable = !disable"
            v-show="disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            :disabled="!isDisable"
            @click="handleSave"
            v-show="!disable"
          >保存</el-button>
        </div>
      </div>
      <!-- 表单显示 -->
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :options="options"
        :isDisable="disable"
        ref="operatingLicenseRef"
        v-loading="loading"
      >
        <template #region>
          <Region
            :province="formData.provinceCode"
            :city="formData.cityCode"
            :county="formData.countyCode"
            :town="formData.townCode"
            :isDisable="disable"
            @handleChangeProvince="handleChangeProvince"
            @handleChangeCity="handleChangeCity"
            @handleChangeCounty="handleChangeCounty"
            @handleChangeTown="handleChangeTown"
          />
        </template>
      </ele-form>
    </el-col>
    <!-- 表格 -->
    <el-col :span="24">
      <div class="mb-10 tar">
        <el-button
          type="primary"
          size="small"
          :disabled="!isDisable ||  !formData.id"
          @click="handleCreateLicense"
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
        width="40%"
      >
        <ele-form
          :formData="dialogFormData"
          :renderFormArr="dialogRenderFormArr"
          :rules="dialogRules"
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
import EleForm from '@/components/eleForm/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import Region from '@/components/region/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { verifyEmail, verifyPhone, verifyRelation } from '@/api/common/verify';
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import {
  createManagementInfo,
  getManagementInfo,
  updateManagementInfo,
  createAddLicense,
  updateLicense,
  deleteLicense,
} from '@/api/ent/trade';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleForm, Region, EleTable, EleUpload },
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
    const dialogFormRef: any = ref(null);
    let DATA: any = reactive({
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      loading: false,
      tableLoading: false,
      formData: {
        address: '',
        businessMethods: '',
        companyInfoId: null,
        companyName: '',
        legalPerson: '',
        licenseScope: '',
        managementLicenseList: '',
        provinceCode: null,
        cityCode: null,
        countyCode: null,
        townCode: null,
      },
      // 表单渲染列表
      renderFormArr: [
        {
          label: '企业名称',
          type: 'input',
          prop: 'companyName',
          style: {
            width: '40%',
          },
        },
        {
          label: '法定代表人',
          type: 'input',
          prop: 'legalPerson',
          style: {
            width: '40%',
          },
        },
        {
          label: '单位地址',
          type: 'slot',
          slotName: 'region',
          style: {
            width: '70%',
          },
        },
        {
          type: 'input',
          prop: 'address',
          placeholder: '详细地址',
          labelWidth: '0px',
          style: {
            width: '28%',
          },
        },
        {
          label: '经营方式',
          type: 'input',
          inputType: 'textarea',
          prop: 'businessMethods',
          style: {
            width: '100%',
          },
        },
        {
          label: '许可范围',
          type: 'input',
          inputType: 'textarea',
          prop: 'licenseScope',
          style: {
            width: '100%',
          },
        },
      ],
      options: {},
      disable: true,
      // 表格数据
      tableData: [],
      renderTable: [
        {
          label: '证书编号',
          type: 'text',
          prop: 'code',
        },
        {
          label: '许可证有效期限',
          type: 'text',
          width: 350,
          formatter: (row: any) => {
            let timer = `${filterTime(
              row.startTime,
              '-',
              false
            )} - ${filterTime(row.endTime, '-', false)}`;
            return timer;
          },
        },
        {
          label: '有效期延续时间',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.extensionTime, '-', false);
          },
        },
        {
          label: '发证机关',
          type: 'text',
          prop: 'unit',
        },
        {
          label: '扫描件',
          type: 'file',
          prop: 'filePath',
          href: 'filePath',
          name: 'fileName',
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
      // 添加、编辑模态框数据
      dialogTitle: '',
      dialogVisible: false,
      dialogFormData: {},
      dialogRenderFormArr: [
        {
          label: '证书编号',
          type: 'input',
          prop: 'code',
          labelWidth: 150,
        },
        {
          label: '许可证有效期限',
          type: 'date',
          prop: 'validity',
          dateType: 'datetimerange',
          labelWidth: 150,
        },
        {
          label: '有效期延续时间',
          type: 'date',
          prop: 'extensionTime',
          dateType: 'datetime',
          labelWidth: 150,
        },
        {
          label: '发证机关',
          type: 'input',
          prop: 'unit',
          labelWidth: 150,
        },
        {
          label: '扫描件',
          type: 'slot',
          prop: 'fileId',
          slotName: 'scanning',
          labelWidth: 150,
        },
      ],
      // 表格弹框规则
      dialogRules: {
        code: [
          {
            required: true,
            message: '请输入证书编号',
            trigger: 'blur',
          },
        ],
        validity: [
          {
            required: true,
            message: '请选择营业执照有效期',
            trigger: 'change',
          },
        ],
        extensionTime: [
          {
            required: true,
            message: '请输入有效期延续时间',
            trigger: 'blur',
          },
        ],
        unit: [
          {
            required: true,
            message: '请输入登记机关',
            trigger: 'blur',
          },
        ],
      },
      dialogType: false, //true添加 false修改
      fileList: [],
    });
    let METHODS = reactive({
      // 切换营业执照省、市区
      handleChangeProvince: (province: number) => {
        DATA.formData.provinceCode = province;
      },
      handleChangeCity: (city: number) => {
        DATA.formData.cityCode = city;
      },
      handleChangeCounty: (county: number) => {
        DATA.formData.countyCode = county;
      },
      handleChangeTown: (town: number) => {
        DATA.formData.townCode = town;
      },
      // 保存信息
      handleSave: () => {
        DATA.formData.companyInfoId = DATA.formData.companyInfoId
          ? DATA.formData.companyInfoId
          : STORE.state.globalData.companyInfo.companyId;

        if (DATA.formData.companyInfoId) {
          if (DATA.formData.id) {
            updateManagementInfo(DATA.formData).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                ElMessage({
                  message: '编辑经营许可证成功',
                  type: 'success',
                });
                DATA.formData = res.data.data;
                DATA.disable = !DATA.disable;
              }
            });
            // 添加
          } else {
            DATA.formData.companyInfoId = DATA.formData.companyInfoId
              ? DATA.formData.companyInfoId
              : STORE.state.globalData.companyInfo.id;

            //添加请求
            createManagementInfo(DATA.formData).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                ElMessage({
                  message: '添加经营许可证成功',
                  type: 'success',
                });
                DATA.formData = res.data.data;
                DATA.disable = !DATA.disable;
              }
            });
          }
        } else {
          // 营业执照信息未填写
          ElMessage({
            message: '请先填写营业执照',
            type: 'warning',
          });
          DATA.disable = !DATA.disable;
        }
      },

      // 添加证书按钮
      handleCreateLicense: () => {
        if (STORE.state.globalData.companyInfo.companyId) {
          if (!DATA.formData.id) {
            ElMessage({
              message: '请先填写经营许可证',
              type: 'warning',
            });
            return;
          }
          DATA.dialogTitle = '添加营业许可证';
          DATA.dialogFormData = {};
          DATA.fileList = [];
          DATA.dialogVisible = true;
          DATA.dialogType = true;
          nextTick(() => {
            dialogFormRef.value.clearForm();
          });
        } else {
          let companyId = sessionStorage.getItem('companyId');
          if (companyId) {
            if (!DATA.formData.id) {
              ElMessage({
                message: '请先填写经营许可证',
                type: 'warning',
              });
              return;
            }
            DATA.dialogTitle = '添加营业许可证';
            DATA.dialogFormData = {};
            DATA.fileList = [];
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
        }
      },
      // 表格按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑经营许可证';
            DATA.dialogFormData = Object.assign(
              {},
              { ...row, validity: [row.startTime, row.endTime] }
            );
            DATA.fileList = [];

            // 如果有图片
            if (row.filePath) {
              DATA.fileList.push({ name: row.fileName, url: row.filePath });
            }
            DATA.dialogVisible = true;
            DATA.dialogType = false;
            nextTick(() => {
              dialogFormRef.value.clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该经营许可证?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteLicense({
                  managementInfoId: row.managementInfoId,
                  managementLicenseId: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: 'success',
                    message: '经营许可证删除成功!',
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
      // 提交按钮
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
              DATA.dialogFormData.startTime = filterTime(
                DATA.dialogFormData.validity[0],
                '/'
              );
              DATA.dialogFormData.endTime = filterTime(
                DATA.dialogFormData.validity[1],
                '/'
              );
              DATA.dialogFormData.extensionTime = filterTime(
                DATA.dialogFormData.extensionTime,
                '/'
              );
              // if(!DATA.formData.id){
              //   ElMessage({
              //       message: "请先填写经营许可证",
              //       type: "warning",
              //     });
              //     return
              // }

              if (DATA.dialogType) {
                let { data } = await createAddLicense({
                  ...DATA.dialogFormData,
                  managementInfoId: DATA.formData.id,
                });

                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '添加经营许可证证书成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              } else {
                delete DATA.dialogFormData.createTime;
                delete DATA.dialogFormData.updateTime;

                let { data } = await updateLicense({
                  ...DATA.dialogFormData,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '编辑经营许可证证书成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.tableData = data.data;
                }
              }
            }
          })
          .catch((error: any) => {});
      },
      uploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.dialogFormData.fileId = res.data.id;
      },
      uploadRemove: (file: any, fileList: any) => {
        DATA.fileList = [];
        if (!fileList.length) {
          DATA.dialogFormData.fileId = null;
        }
      },
    });

    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.tableData = props.formData.managementLicenseList;
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
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);
    });
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
a {
  display: inline-block;
}
</style>