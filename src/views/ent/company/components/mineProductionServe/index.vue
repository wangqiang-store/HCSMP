<template>
  <el-row>
    <el-col :span="24">
      <h3 class="mb-20">矿山生产相关服务信息</h3>
      <el-tabs tab-position="top" v-model="activeName" type="card">
        <el-tab-pane label="年度技术服务" name="first">
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                :disabled="!isDisable"
                @click="handleAnnualServiceCreate"
                >添加</el-button
              >
            </div>
          </div>
          <ele-table
            :tableData="annualServiceTableData"
            :renderTable="annualServiceRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleAnnualServiceBtnEvent"
            v-loading="annualServiceTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="annualServiceTitle"
            v-model="annualServiceVisible"
            width="40%"
          >
            <ele-form
              :formData="annualServiceFormData"
              :renderFormArr="annualServiceRenderFormArr"
              :rules="annualServiceRules"
              ref="annualServiceFormRef"
            >
              <template #validity>
                <el-date-picker
                  v-model="validityDate"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                  @change="handleAnnualServiceChangeDate"
                >
                </el-date-picker>
              </template>
              <template #scanning>
                <!-- <EleUpload
                  :fileList="fileList"
                  @uploadSuccess="annualServiceUploadSuccess"
                  @uploadRemove="annualServiceUploadRemove"
                /> -->
                <el-upload
                  class="upload-demo"
                  drag
                  :action="IMG_URL"
                  :headers="getItemtoken"
                  :on-remove="annualServiceUploadRemove"
                  :on-success="annualServiceUploadSuccess"
                  :file-list="fileList"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传单个文件</em>
                  </div>
                  <template #tip>
                    <!-- <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div> -->
                  </template>
                </el-upload>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="annualServiceVisible = false"
                  >取 消</el-button
                >
                <el-button type="primary" @click="handleConfirmAnnualService"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="应急预案备案" name="two">
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleCreateRecord"
                :disabled="!isDisable"
                >添加</el-button
              >
            </div>
          </div>
          <ele-table
            :tableData="recordTableData"
            :renderTable="recordRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleRecordBtnEvent"
            v-loading="recordTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog :title="recordTitle" v-model="recordVisible" width="40%">
            <ele-form
              :formData="recordFormData"
              :renderFormArr="recordRenderFormArr"
              :rules="recordRules"
              :options="recordOption"
              ref="recordFormRef"
            >
              <template #validity>
                <el-date-picker
                  v-model="validityDate"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                  @change="handleRecordChangeDate"
                >
                </el-date-picker>
              </template>
              <template #scanning>
                <!-- <EleUpload
                  :fileList="fileList"
                  @uploadSuccess="recordUploadSuccess"
                  @uploadRemove="recordUploadRemove"
                /> -->
                <el-upload
                  class="upload-demo"
                  drag
                  :action="IMG_URL"
                  :headers="getItemtoken"
                  :on-remove="recordUploadRemove"
                  :on-success="recordUploadSuccess"
                  :file-list="fileList"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传单个文件</em>
                  </div>
                  <template #tip>
                    <!-- <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div> -->
                  </template>
                </el-upload>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="recordVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmRecord"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="外包安全管理协议" name="three">
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleCreateOutsource"
                :disabled="!isDisable"
                >添加</el-button
              >
            </div>
          </div>
          <ele-table
            :tableData="outsourceTableData"
            :renderTable="outsourceRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleOutsourceBtnEvent"
            v-loading="outsourceTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog
            :title="outsourceTitle"
            v-model="outsourceVisible"
            width="40%"
          >
            <ele-form
              :formData="outsourceFormData"
              :renderFormArr="outsourceRenderFormArr"
              :rules="outsourceRules"
              ref="outsourceFormRef"
            >
              <template #validity>
                <el-date-picker
                  v-model="validityDate"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                  @change="handleOutsourceChangeDate"
                >
                </el-date-picker>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="outsourceVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmOutsource"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="安全责任险" name="four">
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleCreateSafety"
                :disabled="!isDisable"
                >添加</el-button
              >
            </div>
          </div>
          <ele-table
            :tableData="safetyTableData"
            :renderTable="safetyRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleSafetyBtnEvent"
            v-loading="safetyTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog :title="safetyTitle" v-model="safetyVisible" width="40%">
            <ele-form
              :formData="safetyFormData"
              :renderFormArr="safetyRenderFormArr"
              :rules="safetyRules"
              ref="safetyFormRef"
            >
              <template #validity>
                <el-date-picker
                  v-model="validityDate"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                  @change="handleSafetyChangeDate"
                >
                </el-date-picker>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="safetyVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmSafety"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="矿山年度救护协议" name="five">
          <div class="w-100 d_flex d_flex_end mb-10">
            <div>
              <el-button
                type="primary"
                size="small"
                @click="handleRescueCreate"
                :disabled="!isDisable"
                >添加</el-button
              >
            </div>
          </div>
          <ele-table
            :tableData="rescueTableData"
            :renderTable="rescueRenderTable"
            :isborder="true"
            :btnList="btnList"
            @handleBtnEvent="handleRescueBtnEvent"
            v-loading="rescueTableLoading"
          >
          </ele-table>
          <!-- 添加、编辑模态框 -->
          <el-dialog :title="rescueTitle" v-model="rescueVisible" width="40%">
            <ele-form
              :formData="rescueFormData"
              :renderFormArr="rescueRenderFormArr"
              :rules="rescueRules"
              ref="rescueFormRef"
            >
              <template #scanning>
                <!-- <EleUpload
                  :fileList="fileList"
                  @uploadSuccess="rescueUploadSuccess"
                  @uploadRemove="rescueUploadRemove"
                /> -->
                <el-upload
                  class="upload-demo"
                  drag
                  :action="IMG_URL"
                  :headers="getItemtoken"
                  :on-remove="rescueUploadRemove"
                  :on-success="rescueUploadSuccess"
                  :file-list="fileList"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传单个文件</em>
                  </div>
                  <template #tip>
                    <!-- <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div> -->
                  </template>
                </el-upload>
              </template>
            </ele-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="rescueVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmRescue"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import EleUpload from "@/components/eleUpload/index.vue";
import { filterTime } from "@/utils/filtration";
import { useStore } from "vuex";
import {
  createAgreement,
  createInsurance,
  createPlan,
  createSecurity,
  createTechnical,
  deleteAgreement,
  deleteInsurance,
  deletePlan,
  deleteSecurity,
  deleteTechnical,
  updateAgreement,
  updateInsurance,
  updatePlan,
  updateSecurity,
  updateTechnical,
} from "@/api/company/mineProductionServe";
import { IMG_File, IMG_URL, RES_SUCCESS } from "@/api/common/common";
import { ElMessage } from "element-plus";
export default defineComponent({
  components: { EleTable, EleForm, EleUpload },
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
    let annualServiceFormRef: any = ref(null);
    let recordFormRef: any = ref(null);
    let outsourceFormRef: any = ref(null);
    let safetyFormRef: any = ref(null);
    let rescueFormRef: any = ref(null);
    let DATA: any = reactive({
      activeName: "first",
      btnList: [
        {
          text: "编辑",
          type: "primary",
          size: "small",
          handleType: "edit",
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
        {
          text: "删除",
          type: "danger",
          size: "small",
          handleType: "delete",
          isShow: true,
          isdisable: () => {
            return !props.isDisable;
          },
        },
      ],
      fileList: [],
      validityDate: "",
      // 年度技术服务
      annualServiceTableData: [],
      annualServiceRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "服务单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      annualServiceTableLoading: false,
      // 添加、编辑
      annualServiceTitle: "",
      annualServiceVisible: false,
      annualServiceType: false,
      annualServiceFormData: {},
      annualServiceRenderFormArr: [
        {
          label: "起始时间",
          type: "slot",
          slotName: "validity",
          prop: "startTime",
          labelWidth: 100,
        },
        {
          label: "服务单位",
          type: "input",
          prop: "unit",
          labelWidth: 100,
        },
        {
          label: "附件",
          type: "slot",
          slotName: "scanning",
          prop: "fileId",
          labelWidth: 100,
        },
      ],
      annualServiceRules: {
        startTime: [
          {
            required: true,
            message: "请选择起始时间",
            trigger: "change",
          },
        ],
        unit: [
          {
            required: true,
            message: "请输入服务单位",
            trigger: "blur",
          },
        ],
      },
      // 应急备案预案
      recordTableData: [],
      recordRenderTable: [
        {
          label: "备案有效期",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "备案单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      recordTableLoading: false,
      // 添加、编辑
      recordTitle: "",
      recordVisible: false,
      recordType: false,
      recordFormData: {},
      recordOption: {
        unit: [
          {
            name: "英德市安全生产监管理局",
          },
          {
            name: "清远市安全生产监管理局",
          },
          {
            name: "广东省安全生产监管理局",
          },
        ],
      },
      recordRenderFormArr: [
        {
          label: "备案有效期",
          type: "slot",
          slotName: "validity",
          prop: "startTime",
          labelWidth: 100,
        },
        {
          label: "备案单位",
          type: "select",
          prop: "unit",
          value: "name",
          title: "name",
          labelWidth: 100,
        },
        {
          label: "附件",
          type: "slot",
          slotName: "scanning",
          prop: "fileId",
          labelWidth: 100,
        },
      ],
      recordRules: {
        startTime: [
          {
            required: true,
            message: "请选择备案有效期",
            trigger: "change",
          },
        ],
        unit: [
          {
            required: true,
            message: "请输入备案单位",
            trigger: "blur",
          },
        ],
      },
      // 外包安全管理协议
      outsourceTableData: [],
      outsourceRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "签订单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      outsourceTableLoading: false,
      // 添加、编辑
      outsourceTitle: "",
      outsourceVisible: false,
      outsourceType: false,
      outsourceFormData: {},
      outsourceRenderFormArr: [
        {
          label: "起始时间",
          type: "slot",
          slotName: "validity",
          prop: "startTime",
          labelWidth: 100,
        },
        {
          label: "签订单位",
          type: "input",
          prop: "unit",
          labelWidth: 100,
        },
      ],
      outsourceRules: {
        startTime: [
          {
            required: true,
            message: "请选择起始时间",
            trigger: "change",
          },
        ],
        unit: [
          {
            required: true,
            message: "请输入签订单位",
            trigger: "blur",
          },
        ],
      },
      // 安全责任险
      safetyTableData: [],
      safetyRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "保险公司",
          type: "text",
          prop: "unit",
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      safetyTableLoading: false,
      // 添加、编辑
      safetyTitle: "",
      safetyVisible: false,
      safetyType: false,
      safetyFormData: {},
      safetyRenderFormArr: [
        {
          label: "起始时间",
          type: "slot",
          slotName: "validity",
          prop: "startTime",
          labelWidth: 100,
        },
        {
          label: "保险公司",
          type: "input",
          prop: "unit",
          labelWidth: 100,
        },
      ],
      safetyRules: {
        startTime: [
          {
            required: true,
            message: "请选择起始时间",
            trigger: "change",
          },
        ],
        unit: [
          {
            required: true,
            message: "请输入保险公司",
            trigger: "blur",
          },
        ],
      },
      // 矿山年度救护协议
      rescueTableData: [],
      rescueRenderTable: [
        {
          label: "时间",
          type: "text",
          prop: "startTime",
          formatter: (row: any) => {
            return filterTime(row.startTime, "-", false);
          },
        },
        {
          label: "签订金额",
          type: "text",
          prop: "amount",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      rescueTableLoading: false,
      // 添加、编辑
      rescueTitle: "",
      rescueVisible: false,
      rescueType: false,
      rescueFormData: {},
      rescueRenderFormArr: [
        {
          label: "时间",
          type: "date",
          prop: "startTime",
          placeholder: "请选择时间",
          labelWidth: 100,
          disabledDate: (value: any) => {
            return value.getTime() > Date.now();
          },
        },
        {
          label: "签订金额",
          type: "input",
          prop: "amount",
          labelWidth: 100,
        },
        {
          label: "附件",
          type: "slot",
          prop: "fileId",
          slotName: "scanning",
          labelWidth: 100,
        },
      ],
      rescueRules: {
        startTime: [
          {
            required: true,
            message: "请选择时间",
            trigger: "change",
          },
        ],
        amount: [
          {
            required: true,
            message: "请输入签订金额",
            trigger: "blur",
          },
        ],
      },
    });
    let METHODS = reactive({
      // 年度技术服务
      handleAnnualServiceCreate: () => {
        DATA.annualServiceTitle = "添加年度技术服务信息";
        DATA.annualServiceType = true;
        DATA.annualServiceVisible = true;
        DATA.fileList = [];
        DATA.annualServiceFormData = {};
        DATA.validityDate = "";
        nextTick(() => {
          annualServiceFormRef.value.clearForm();
        });
      },
      handleAnnualServiceBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.annualServiceTitle = "编辑年度技术服务信息";
            DATA.annualServiceType = false;
            DATA.annualServiceVisible = true;
            DATA.annualServiceFormData = Object.assign({}, row);
            DATA.validityDate = [row.startTime, row.endTime];
            DATA.annualServiceFormData.endTime = filterTime(row.endTime, "/");
            DATA.annualServiceFormData.startTime = filterTime(
              row.startTime,
              "/"
            );
            DATA.fileList = [];
            row.fileId &&
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });
            nextTick(() => {
              annualServiceFormRef.value.clearForm();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该年度技术服务信息?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteTechnical({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "年度技术服务信息删除成功!",
                  });
                  DATA.annualServiceTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmAnnualService: () => {
        annualServiceFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            // if (!DATA.annualServiceFormData.fileId) {
            //   ElMessage({
            //     message: '请选择附件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: "请先填写保存营业执照信息",
                type: "warning",
              });
              return;
            }
            DATA.annualServiceTableLoading = true;
            if (DATA.annualServiceType) {
              let { data } = await createTechnical({
                ...DATA.annualServiceFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.annualServiceTableLoading = false;
                ElMessage({
                  message: "添加年度技术服务信息成功",
                  type: "success",
                });
                DATA.annualServiceVisible = false;
                DATA.annualServiceTableData = data.data;
              }
            } else {
              delete DATA.annualServiceFormData.createTime;
              delete DATA.annualServiceFormData.updateTime;
              let { data } = await updateTechnical({
                ...DATA.annualServiceFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.annualServiceTableLoading = false;
                ElMessage({
                  message: "编辑年度技术服务信息成功",
                  type: "success",
                });
                DATA.annualServiceVisible = false;
                DATA.annualServiceTableData = data.data;
              }
            }
          }
        });
      },
      annualServiceUploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.annualServiceFormData.fileId = res.data.id;
      },
      annualServiceUploadRemove: () => {
        DATA.annualServiceFormData.fileId = null;
        DATA.fileList = [];
      },
      handleAnnualServiceChangeDate: () => {
        if (DATA.validityDate != null && DATA.validityDate.length > 0) {
          DATA.annualServiceFormData.endTime = filterTime(
            DATA.validityDate[1],
            "/"
          );
          DATA.annualServiceFormData.startTime = filterTime(
            DATA.validityDate[0],
            "/"
          );
        } else {
          DATA.annualServiceFormData.endTime = null;
          DATA.annualServiceFormData.startTime = null;
        }
      },
      // 应急备案预案
      handleCreateRecord: () => {
        DATA.recordTitle = "添加应急备案预案";
        DATA.recordType = true;
        DATA.recordVisible = true;
        DATA.fileList = [];
        DATA.recordFormData = {};
        DATA.validityDate = "";
        nextTick(() => {
          recordFormRef.value.clearForm();
        });
      },
      handleRecordBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.recordTitle = "编辑应急备案预案";
            DATA.recordType = false;
            DATA.recordVisible = true;
            DATA.recordFormData = Object.assign({}, row);
            DATA.validityDate = [row.startTime, row.endTime];
            DATA.recordFormData.endTime = filterTime(row.endTime, "/");
            DATA.recordFormData.startTime = filterTime(row.startTime, "/");
            DATA.fileList = [];
            row.fileId &&
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });

            nextTick(() => {
              recordFormRef.value.clearForm();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该应急备案预案?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deletePlan({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "应急备案预案删除成功!",
                  });
                  DATA.recordTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmRecord: () => {
        recordFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            // if (!DATA.recordFormData.fileId) {
            //   ElMessage({
            //     message: '请选择附件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: "请先填写保存营业执照信息",
                type: "warning",
              });
              return;
            }
            DATA.recordTableLoading = true;
            if (DATA.recordType) {
              let { data } = await createPlan({
                ...DATA.recordFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.recordTableLoading = false;
                ElMessage({
                  message: "添加应急备案预案成功",
                  type: "success",
                });
                DATA.recordVisible = false;
                DATA.recordTableData = data.data;
              }
            } else {
              delete DATA.recordFormData.createTime;
              delete DATA.recordFormData.updateTime;
              let { data } = await updatePlan({
                ...DATA.recordFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.recordTableLoading = false;
                ElMessage({
                  message: "编辑应急备案预案成功",
                  type: "success",
                });
                DATA.recordVisible = false;
                DATA.recordTableData = data.data;
              }
            }
          }
        });
      },
      recordUploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.recordFormData.fileId = res.data.id;
      },
      recordUploadRemove: () => {
        DATA.recordFormData.fileId = null;
      },
      handleRecordChangeDate: () => {
        if (DATA.validityDate != null && DATA.validityDate.length > 0) {
          DATA.recordFormData.endTime = filterTime(DATA.validityDate[1], "/");
          DATA.recordFormData.startTime = filterTime(DATA.validityDate[0], "/");
        } else {
          DATA.recordFormData.endTime = null;
          DATA.recordFormData.startTime = null;
        }
      },
      // 外包安全管理协议
      handleCreateOutsource: () => {
        DATA.outsourceTitle = "添加外包安全管理协议";
        DATA.outsourceType = true;
        DATA.outsourceVisible = true;
        DATA.outsourceFormData = {};
        DATA.validityDate = "";
        nextTick(() => {
          outsourceFormRef.value.clearForm();
        });
      },
      handleOutsourceBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.outsourceTitle = "编辑外包安全管理协议";
            DATA.outsourceType = false;
            DATA.outsourceVisible = true;
            DATA.outsourceFormData = Object.assign({}, row);
            DATA.validityDate = [row.startTime, row.endTime];
            DATA.outsourceFormData.endTime = filterTime(row.endTime, "/");
            DATA.outsourceFormData.startTime = filterTime(row.startTime, "/");
            nextTick(() => {
              outsourceFormRef.value.clearForm();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该外包安全管理协议?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteSecurity({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "外包安全管理协议删除成功!",
                  });
                  DATA.outsourceTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmOutsource: () => {
        outsourceFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: "请先填写保存营业执照信息",
                type: "warning",
              });
              return;
            }
            DATA.outsourceTableLoading = true;
            if (DATA.outsourceType) {
              let { data } = await createSecurity({
                ...DATA.outsourceFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.outsourceTableLoading = false;
                ElMessage({
                  message: "添加外包安全管理协议成功",
                  type: "success",
                });
                DATA.outsourceVisible = false;
                DATA.outsourceTableData = data.data;
              }
            } else {
              delete DATA.outsourceFormData.createTime;
              delete DATA.outsourceFormData.updateTime;
              let { data } = await updateSecurity({
                ...DATA.outsourceFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.outsourceTableLoading = false;
                ElMessage({
                  message: "编辑外包安全管理协议成功",
                  type: "success",
                });
                DATA.outsourceVisible = false;
                DATA.outsourceTableData = data.data;
              }
            }
          }
        });
      },
      handleOutsourceChangeDate: () => {
        if (DATA.validityDate != null && DATA.validityDate.length > 0) {
          DATA.outsourceFormData.endTime = filterTime(
            DATA.validityDate[1],
            "/"
          );
          DATA.outsourceFormData.startTime = filterTime(
            DATA.validityDate[0],
            "/"
          );
        } else {
          DATA.outsourceFormData.endTime = null;
          DATA.outsourceFormData.startTime = null;
        }
      },
      // 安全责任险
      handleCreateSafety: () => {
        DATA.safetyTitle = "添加安全责任险";
        DATA.safetyType = true;
        DATA.safetyVisible = true;
        DATA.safetyFormData = {};
        DATA.validityDate = "";
        nextTick(() => {
          safetyFormRef.value.clearForm();
        });
      },
      handleSafetyBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.safetyTitle = "编辑安全责任险";
            DATA.safetyType = false;
            DATA.safetyVisible = true;
            DATA.safetyFormData = Object.assign({}, row);
            DATA.validityDate = [row.startTime, row.endTime];
            DATA.safetyFormData.endTime = filterTime(row.endTime, "/");
            DATA.safetyFormData.startTime = filterTime(row.startTime, "/");
            nextTick(() => {
              safetyFormRef.value.clearForm();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该安全责任险?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteInsurance({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "安全责任险删除成功!",
                  });
                  DATA.safetyTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmSafety: () => {
        safetyFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: "请先填写保存营业执照信息",
                type: "warning",
              });
              return;
            }
            DATA.safetyTableLoading = true;
            if (DATA.safetyType) {
              let { data } = await createInsurance({
                ...DATA.safetyFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.safetyTableLoading = false;
                ElMessage({
                  message: "添加安全责任险成功",
                  type: "success",
                });
                DATA.safetyVisible = false;
                DATA.safetyTableData = data.data;
              }
            } else {
              delete DATA.safetyFormData.createTime;
              delete DATA.safetyFormData.updateTime;
              let { data } = await updateInsurance({
                ...DATA.safetyFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.safetyTableLoading = false;
                ElMessage({
                  message: "编辑安全责任险成功",
                  type: "success",
                });
                DATA.safetyVisible = false;
                DATA.safetyTableData = data.data;
              }
            }
          }
        });
      },
      handleSafetyChangeDate: () => {
        if (DATA.validityDate != null && DATA.validityDate.length > 0) {
          DATA.safetyFormData.endTime = filterTime(DATA.validityDate[1], "/");
          DATA.safetyFormData.startTime = filterTime(DATA.validityDate[0], "/");
        } else {
          DATA.safetyFormData.endTime = null;
          DATA.safetyFormData.startTime = null;
        }
      },
      // 矿山年度救护协议
      handleRescueCreate: () => {
        DATA.rescueTitle = "添加矿山年度救护协议";
        DATA.rescueType = true;
        DATA.rescueVisible = true;
        DATA.fileList = [];
        DATA.rescueFormData = {};
        DATA.validityDate = "";
        nextTick(() => {
          rescueFormRef.value.clearForm();
        });
      },
      handleRescueBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.rescueTitle = "编辑矿山年度救护协议";
            DATA.rescueType = false;
            DATA.rescueVisible = true;
            DATA.rescueFormData = Object.assign({}, row);
            DATA.fileList = [];
            row.fileId &&
              DATA.fileList.push({
                name: row.fileName,
                url: IMG_File + row.filePath,
              });
            nextTick(() => {
              rescueFormRef.value.clearForm();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否确定删除该矿山年度救护协议?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteAgreement({
                  id: row.id,
                  companyInfoId: DATA.formData.companyInfoId,
                });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "矿山年度救护协议删除成功!",
                  });
                  DATA.rescueTableData = data.data;
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleConfirmRescue: () => {
        rescueFormRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            // if (!DATA.rescueFormData.fileId) {
            //   ElMessage({
            //     message: '请选择附件',
            //     type: 'warning',
            //   });
            //   return;
            // }
            if (!DATA.formData.companyInfoId) {
              ElMessage({
                message: "请先填写保存营业执照信息",
                type: "warning",
              });
              return;
            }
            DATA.rescueTableLoading = true;
            DATA.rescueFormData.startTime = filterTime(
              DATA.rescueFormData.startTime,
              "/"
            );
            if (DATA.rescueType) {
              let { data } = await createAgreement({
                ...DATA.rescueFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.rescueTableLoading = false;
                ElMessage({
                  message: "添加矿山年度救护协议成功",
                  type: "success",
                });
                DATA.rescueVisible = false;
                DATA.rescueTableData = data.data;
              }
            } else {
              delete DATA.rescueFormData.createTime;
              delete DATA.rescueFormData.updateTime;
              let { data } = await updateAgreement({
                ...DATA.rescueFormData,
                companyInfoId: DATA.formData.companyInfoId,
              });
              if (data.code === RES_SUCCESS) {
                DATA.rescueTableLoading = false;
                ElMessage({
                  message: "编辑矿山年度救护协议成功",
                  type: "success",
                });
                DATA.rescueVisible = false;
                DATA.rescueTableData = data.data;
              }
            }
          }
        });
      },
      rescueUploadSuccess: (res: any) => {
        DATA.fileList = [];
        DATA.fileList.push({
          name: res.data.name,
          url: IMG_File + res.data.path,
        });
        DATA.rescueFormData.fileId = res.data.id;
      },
      rescueUploadRemove: () => {
        DATA.rescueFormData.fileId = null;
        DATA.fileList = [];
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
        DATA.annualServiceTableData = props.formData.annualTechnicalService;
        DATA.recordTableData = props.formData.emergencyPlan;
        DATA.outsourceTableData = props.formData.outsourcingSecurity;
        DATA.safetyTableData = props.formData.securityInsurance;
        DATA.rescueTableData = props.formData.rescueAgreement;
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
        Authorization: localStorage.getItem("Admin-Token"),
      };
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      annualServiceFormRef,
      recordFormRef,
      outsourceFormRef,
      safetyFormRef,
      rescueFormRef,
      getItemtoken,
      IMG_URL,
    };
  },
});
</script>
<style scoped lang="scss">
/deep/ .el-tabs__nav-wrap {
  display: flex;
  justify-content: center;
}
</style>