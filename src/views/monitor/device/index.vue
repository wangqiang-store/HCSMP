<template>
  <el-row style="height: 100%" class="container">
    <el-col
      :span="4"
      style="padding-right: 10px; border-right: 1px solid #dcdfe6"
      class="tree"
    >
      <el-input
        v-model="searchContent"
        placeholder="请输入企业名查找"
        @input="handleFilter"
      ></el-input>
      <SensorTree
        @handleCompanyInfo="handleCompanyInfo"
        ref="SensorTree"
        @getTreeToAmap="getTreeToAmap"
        v-if="refreshSensorTree"
        :isFilter="isFilter"
        :searchContent="searchContent"
      />
    </el-col>
    <!-- 地图 -->
    <el-col :span="20" style="padding-left: 10px" v-if="isShowMap">
      <Amap
        class="amap"
        module="realtime"
        AmapId="realtime"
        :companyList="companyList"
        :regionName="regionName"
        :isShowSearch="true"
        @handleClickMarker="handleClickMarker"
        placeholder="可搜索具体位置"
      />
    </el-col>
    <el-col
      v-if="!isShowMap"
      :span="16"
      style="
        padding-left: 10px;
        padding-right: 10px;
        border-right: 1px solid #dcdfe6;
      "
    >
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        v-show="isshow"
        type="card"
      >
        <el-tab-pane label="添加网关" name="gateway">
          <el-form
            :model="gatewayFormData"
            :rules="gatewayRules"
            ref="gatewayForm"
            style="width: 50%"
            class="d_flex"
          >
            <el-form-item label="网关SN" prop="sn">
              <el-autocomplete
                v-model="gatewayFormData.sn"
                :fetch-suggestions="querySearch"
                placeholder="请输入网关"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item class="ml-10">
              <el-button
                v-if="showBtnList.includes('create')"
                type="primary"
                @click="handleCreateGateway"
                >添加</el-button
              >
            </el-form-item>
          </el-form>

          <!-- 网关表格 -->
          <ele-table
            :tableData="tableData"
            :btnList="btnList"
            :renderTable="renderTable"
            :isborder="true"
            v-loading="tableLoading"
            @handleBtnEvent="handleBtnEvent"
          ></ele-table>
          <!-- 编辑模态框 -->
          <el-dialog title="编辑网关" v-model="dialogVisible" width="50%">
            <el-form
              :model="formData"
              :rules="gatewayRules"
              ref="formRef"
              style="width: 50%"
              class="d_flex"
            >
              <el-form-item label="网关SN" prop="sn">
                <el-autocomplete
                  v-model="formData.sn"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入网关"
                ></el-autocomplete>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirm"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="添加传感器" name="sensor">
          <!-- <el-button
            type="primary"
            v-show="isshow"
            @click="handleCreateSensor"
            style="margin-bottom:20px"
          >添加传感器</el-button> -->
          <div v-if="isCreateSensor" v-loading="loading">
            <el-card>
              <h4 class="baseInfo">基础信息</h4>
              <ele-form
                :formData="baseInfoFormData"
                :renderFormArr="baseInfoRenderFormArr"
                :options="baseInfoOptions"
                :rules="baseInfoRules"
                :styles="styles"
                :labelWidth="150"
                ref="baseInfoRef"
                @handleChange="handleChange"
              ></ele-form>
            </el-card>

            <!-- 有毒气体 -->
            <el-card
              class="mt-10"
              v-show="baseInfoFormData.sensorType.includes(1)"
            >
              <h4>有毒气体参数设置</h4>
              <ele-form
                :formData="toxicGasFormData"
                :renderFormArr="toxicGasRenderFormArr"
                :styles="styles"
                :labelWidth="150"
                :rules="toxicGasRoules"
                ref="toxicGasRef"
              ></ele-form>
            </el-card>
            <!-- 可燃气体 -->
            <el-card
              class="mt-10"
              v-show="baseInfoFormData.sensorType.includes(2)"
            >
              <h4>可燃气体参数设置</h4>
              <ele-form
                :formData="combustibleGasFormData"
                :renderFormArr="combustibleGasRenderFormArr"
                :styles="styles"
                :labelWidth="150"
                :rules="combustibleRules"
                ref="combustibleGasRef"
              ></ele-form>
            </el-card>
            <!-- 沸点参数设置 -->
            <el-card
              class="mt-10"
              v-show="
                baseInfoFormData.sensorType.includes(1) ||
                baseInfoFormData.sensorType.includes(2)
              "
            >
              <h4>沸点参数设置</h4>
              <ele-form
                :formData="boilFormData"
                :renderFormArr="boilRenderFormArr"
                :styles="styles"
                :rules="boilRules"
                :labelWidth="150"
                ref="boilRef"
              ></ele-form>
            </el-card>
            <el-divider></el-divider>

            <el-card>
              <h4 class="baseInfo">报警设置</h4>
              <ele-form
                :formData="warningFormData"
                :renderFormArr="warningRenderFormArr"
                :options="warningOptions"
                :rules="warningRules"
                :styles="styles"
                ref="warningRef"
                :labelWidth="150"
              ></ele-form>
              <p class="label">注：报警等级3级＞2级＞1级</p>
            </el-card>

            <el-divider></el-divider>

            <el-card>
              <h4 class="baseInfo">保修参数</h4>
              <ele-form
                :formData="warrantyFormData"
                :renderFormArr="warrantyRenderFormArr"
                :options="warrantyOptions"
                :rules="warrantyRules"
                :styles="styles"
                :labelWidth="150"
                ref="warrantyRef"
              ></ele-form>
            </el-card>

            <div class="mt-10 tar">
              <el-button
                type="primary"
                @click="handleSaveSensor"
                style="width: 100px"
                :loading="saveLoading"
                v-show="showBtnList.includes('create')"
                >保存</el-button
              >
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 传感器详情 -->
      <div v-if="isSensorDetails">
        <el-button
          v-show="isdelete && showBtnList.includes('delete')"
          type="danger"
          @click="handleDeleteSensor"
          style="margin-bottom: 20px"
          >删除传感器</el-button
        >
        <div v-loading="loading">
          <el-card>
            <h4 class="baseInfo">基础信息</h4>
            <ele-form
              :formData="baseInfoFormData"
              :renderFormArr="baseInfoRenderFormArr"
              :options="baseInfoOptions"
              :rules="baseInfoRules"
              :styles="styles"
              :labelWidth="150"
              ref="baseInfoRef"
              @handleChange="handleChange"
            ></ele-form>
          </el-card>

          <!-- 有毒气体 -->
          <el-card
            class="mt-10"
            v-show="baseInfoFormData.sensorType.includes(1)"
          >
            <h4>有毒气体参数设置</h4>
            <ele-form
              :formData="toxicGasFormData"
              :renderFormArr="toxicGasRenderFormArr"
              :styles="styles"
              :labelWidth="150"
              :rules="toxicGasRoules"
              ref="toxicGasRef"
            ></ele-form>
          </el-card>
          <!-- 可燃气体 -->
          <el-card
            class="mt-10"
            v-show="baseInfoFormData.sensorType.includes(2)"
          >
            <h4>可燃气体参数设置</h4>
            <ele-form
              :formData="combustibleGasFormData"
              :renderFormArr="combustibleGasRenderFormArr"
              :styles="styles"
              :labelWidth="150"
              :rules="combustibleRules"
              ref="combustibleGasRef"
            ></ele-form>
          </el-card>
          <!-- 沸点参数设置 -->
          <el-card
            class="mt-10"
            v-show="
              baseInfoFormData.sensorType.includes(1) ||
              baseInfoFormData.sensorType.includes(2)
            "
          >
            <h4>沸点参数设置</h4>
            <ele-form
              :formData="boilFormData"
              :renderFormArr="boilRenderFormArr"
              :styles="styles"
              :rules="boilRules"
              :labelWidth="150"
              ref="boilRef"
            ></ele-form>
          </el-card>
          <el-divider></el-divider>

          <el-card>
            <h4 class="baseInfo">报警设置</h4>
            <ele-form
              :formData="warningFormData"
              :renderFormArr="warningRenderFormArr"
              :options="warningOptions"
              :rules="warningRules"
              :styles="styles"
              ref="warningRef"
              :labelWidth="150"
            ></ele-form>
            <p class="label">注：报警等级3级＞2级＞1级</p>
          </el-card>

          <el-divider></el-divider>

          <el-card>
            <h4 class="baseInfo">保修参数</h4>
            <ele-form
              :formData="warrantyFormData"
              :renderFormArr="warrantyRenderFormArr"
              :options="warrantyOptions"
              :rules="warrantyRules"
              :styles="styles"
              :labelWidth="150"
              ref="warrantyRef"
            ></ele-form>
          </el-card>

          <div class="mt-10 tar">
            <el-button
              type="primary"
              @click="handleSaveSensor"
              style="width: 100px"
              :loading="saveLoading"
              v-show="showBtnList.includes('edit')"
              >保存</el-button
            >
          </div>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isShowMap" :span="4" style="padding-left: 10px">
      <el-descriptions
        class="margin-top"
        title="企业信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(companyInfo) !== '{}'"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>企业名称</h4>
          </template>
          {{ companyInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>法人代表</h4>
          </template>
          {{ companyInfo.legalPerson }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <h4>法人代表联系方式</h4>
          </template>
          {{ companyInfo.legalPhone }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>地址</h4>
          </template>
          {{ companyInfo.address }}
        </el-descriptions-item>
      </el-descriptions>
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
  toRefs,
} from "vue";
import SensorTree from "@/components/sensorTree/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import EleTable from "@/components/eleTable/index.vue";
import Amap from "@/components/amap/index.vue";
import { getByKey, RES_SUCCESS } from "@/api/common/common";
import { verifyTwoFigures } from "@/api/common/verify";
import {
  createSensorDevice,
  deleteSensorDevice,
  findOne,
  updateSensorDevice,
  findByCompanyGateway,
  createGatway,
  findEnableGateway,
  updateGatway,
  deleteGatway,
  findUUIDs,
} from "@/api/monitor/device";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { filterTime } from "@/utils/filtration";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { SensorTree, EleForm, EleTable, Amap },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    let validateMax = (rule: any, value: any, callback: any) => {
      if (verifyTwoFigures.test(value)) {
        if (+value <= +DATA.warningFormData.min) {
          callback(new Error("仪表盘最大值不能小于等于仪表盘最小值"));
        } else {
          callback();
          proxy.$refs["warningRef"].validateField("min");
        }
      } else {
        callback(new Error("数据为整数、0或精确2个小数点"));
      }
    };
    let validateMin = (rule: any, value: any, callback: any) => {
      if (verifyTwoFigures.test(value)) {
        if (+value >= +DATA.warningFormData.max) {
          callback(new Error("仪表盘最小值不能大于等于仪表盘最大值"));
        } else {
          callback();
          proxy.$refs["warningRef"].validateField("max");
        }
      } else {
        callback(new Error("数据为整数、0或精确2个小数点"));
      }
    };
    let lowerThreshold = (rule: any, value: any, callback: any) => {
      switch (rule.field) {
        case "lowerThreshold3":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value >= +DATA.warningFormData.upperThreshold3) {
                callback(
                  new Error("仪表盘3级下限阀值不能大于等于仪表盘3级上限阀值")
                );
              } else if (
                (+value >= +DATA.warningFormData.lowerThreshold2 &&
                  DATA.warningFormData.lowerThreshold2 != "" &&
                  DATA.warningFormData.lowerThreshold2 !== null) ||
                (+value >= +DATA.warningFormData.lowerThreshold1 &&
                  DATA.warningFormData.lowerThreshold1 != "" &&
                  DATA.warningFormData.lowerThreshold1 !== null)
              ) {
                callback(
                  new Error("仪表盘3级下限阀值不能大于等于1级或2级下限阀值")
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("upperThreshold3");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }
          break;
        case "lowerThreshold2":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value >= +DATA.warningFormData.upperThreshold2) {
                callback(
                  new Error("仪表盘2级下限阀值不能大于等于仪表盘2级上限阀值")
                );
              } else if (
                (+value <= +DATA.warningFormData.lowerThreshold3 &&
                  DATA.warningFormData.lowerThreshold3 !== "" &&
                  DATA.warningFormData.lowerThreshold3 !== null) ||
                (+value >= +DATA.warningFormData.lowerThreshold1 &&
                  DATA.warningFormData.lowerThreshold1 !== "" &&
                  DATA.warningFormData.lowerThreshold1 !== null)
              ) {
                callback(
                  new Error(
                    "仪表盘2级下限阀值不能大于等于1级或小于等于3级下限阀值"
                  )
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("upperThreshold2");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }
          break;
        case "lowerThreshold1":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value >= +DATA.warningFormData.upperThreshold1) {
                callback(
                  new Error("仪表盘1级下限阀值不能大于等于仪表盘1级上限阀值")
                );
              } else if (
                (+value <= +DATA.warningFormData.lowerThreshold3 &&
                  DATA.warningFormData.lowerThreshold3 !== "" &&
                  DATA.warningFormData.lowerThreshold3 !== null) ||
                (+value <= +DATA.warningFormData.lowerThreshold2 &&
                  DATA.warningFormData.lowerThreshold2 !== "" &&
                  DATA.warningFormData.lowerThreshold2 !== null)
              ) {
                callback(
                  new Error("仪表盘1级下限阀值不能小于等于2级或3级下限阀值")
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("upperThreshold1");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }
          break;
        default:
          break;
      }
    };
    let upperThreshold = (rule: any, value: any, callback: any) => {
      switch (rule.field) {
        case "upperThreshold3":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value <= +DATA.warningFormData.lowerThreshold3) {
                callback(
                  new Error("仪表盘3级上限阀值不能小于等于仪表盘3级下限阀值")
                );
              } else if (
                (+value <= +DATA.warningFormData.upperThreshold2 &&
                  DATA.warningFormData.upperThreshold2 !== "" &&
                  DATA.warningFormData.upperThreshold2 !== null) ||
                (+value <= +DATA.warningFormData.upperThreshold1 &&
                  DATA.warningFormData.upperThreshold1 !== "" &&
                  DATA.warningFormData.upperThreshold1 !== null)
              ) {
                callback(
                  new Error("仪表盘3级下限阀值不能小于等于1级或2级上限阀值")
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("lowerThreshold3");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }
          break;
        case "upperThreshold2":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value <= +DATA.warningFormData.lowerThreshold2) {
                callback(
                  new Error("仪表盘2级上限阀值不能小于等于仪表盘2级下限阀值")
                );
              } else if (
                (+value >= +DATA.warningFormData.upperThreshold3 &&
                  DATA.warningFormData.upperThreshold3 !== "" &&
                  DATA.warningFormData.upperThreshold3 != null) ||
                (+value <= +DATA.warningFormData.upperThreshold1 &&
                  DATA.warningFormData.upperThreshold1 !== "" &&
                  DATA.warningFormData.upperThreshold1 !== null)
              ) {
                callback(
                  new Error(
                    "仪表盘2级上限阀值不能大于等于3级和小于等于1级上限阀值"
                  )
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("lowerThreshold2");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }
          break;
        case "upperThreshold1":
          if (value === "" || value === null || value === undefined) {
            callback();
          } else {
            if (
              verifyTwoFigures.test(value) &&
              +value >= DATA.warningFormData.min &&
              +value <= DATA.warningFormData.max
            ) {
              if (+value <= +DATA.warningFormData.lowerThreshold1) {
                callback(
                  new Error("仪表盘1级上限阀值不能小于等于仪表盘1级下限阀值")
                );
              } else if (
                (+value >= +DATA.warningFormData.upperThreshold3 &&
                  DATA.warningFormData.upperThreshold3 !== "" &&
                  DATA.warningFormData.upperThreshold3 !== null) ||
                (+value >= +DATA.warningFormData.upperThreshold2 &&
                  DATA.warningFormData.upperThreshold2 !== "" &&
                  DATA.warningFormData.upperThreshold2 !== null)
              ) {
                callback(
                  new Error(
                    "仪表盘1级上限阀值不能大于等于3级和大于等于2级上限阀值"
                  )
                );
              } else {
                callback();
                proxy.$refs["warningRef"].validateField("lowerThreshold1");
              }
            } else {
              callback(
                new Error("数据格式为整数或精确两个小数点且不能超过量程值")
              );
            }
          }

          break;
        default:
          break;
      }
    };
    const STORE = useStore();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      // 地区名
      regionName: "",
      isFilter: false,
      companyList: [],
      isShowMap: true,
      loading: false,
      saveLoading: false,
      isCreate: false,
      isdelete: false,
      refreshSensorTree: true,
      companyInfo: {},
      isshow: false,
      searchContent: "",
      activeName: "",
      isSensorDetails: false,
      // 网关
      gatewayFormData: {
        sn: "",
      },
      gatewayRules: {
        sn: [{ required: true, message: "请输入网关", trigger: "change" }],
      },
      snList: [],
      tableData: [],
      btnList: [],
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
          label: "网关SN",
          type: "text",
          prop: "sn",
        },
        {
          label: "版本",
          type: "text",
          prop: "version",
        },
        {
          label: "创建时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return filterTime(row.createTime);
          },
        },
        {
          label: "更新时间",
          type: "text",
          prop: "updateTime",
          formatter: (row: any) => {
            return filterTime(row.updateTime);
          },
        },
        {
          label: "操作",
          type: "handle",
          width: 200,
        },
      ],
      tableLoading: false,
      dialogVisible: false,
      formData: {},
      // 基础信息表单
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      baseInfoFormData: {
        name: "",
        status: null,
        installLocation: "",
        installTime: "",
        gasType: null,
        sensorType: [],
        model: "",
      },
      baseInfoRenderFormArr: [
        {
          label: "传感器名称",
          prop: "name",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "设备维护状态",
          prop: "status",
          type: "select",
          title: "name",
          value: "value",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "安装位置",
          prop: "installLocation",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "安装时间",
          prop: "installTime",
          type: "date",
          clearable: true,
          placeholder: "选择时间",
          style: {
            width: "49%",
          },
        },
        {
          label: "传感器类型",
          prop: "sensorType",
          type: "select",
          clearable: true,
          multiple: true,
          collapseTags: false,
          title: "name",
          value: "value",
          style: {
            width: "49%",
          },
        },
        {
          label: "气体类型",
          prop: "gasType",
          type: "select",
          clearable: true,
          title: "name",
          value: "value",
          style: {
            width: "49%",
          },
        },
        // {
        //   label: '传感器编号',
        //   prop: 'code',
        //   type: 'input',
        //   clearable: true,
        //   style: {
        //     width: '49%',
        //   },
        // },
        // {
        //   label: '企业识别码',
        //   type: 'input',
        //   clearable: true,
        //   style: {
        //     width: '49%',
        //   },
        // },
        // {
        //   label: '传感器IP',
        //   prop: 'ip',
        //   type: 'input',
        //   clearable: true,
        //   style: {
        //     width: '49%',
        //   },
        // },
        // {
        //   label: '传感器端口',
        //   prop: 'port',
        //   type: 'input',
        //   clearable: true,
        //   style: {
        //     width: '49%',
        //   },
        // },
        {
          label: "监测内容",
          prop: "monitorContent",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "被监测设备",
          prop: "monitorDevice",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "网关SN",
          prop: "gatewayId",
          type: "select",
          clearable: true,
          value: "id",
          title: "sn",
          style: {
            width: "49%",
          },
        },
        {
          label: "UUID",
          prop: "uuid",
          type: "select",
          value: "value",
          title: "name",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "气体单位",
          prop: "unit",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
      ],
      baseInfoOptions: {},
      baseInfoRules: {
        name: [
          { required: true, message: "请输入传感器名称", trigger: "blur" },
        ],
        installLocation: [
          { required: true, message: "请输入安装位置", trigger: "blur" },
        ],
        gasType: [
          { required: true, message: "请选择气体类型", trigger: "change" },
        ],
        sensorType: [
          { required: true, message: "请选择传感器类型", trigger: "change" },
        ],
        uuid: [{ required: true, message: "请选择UUID", trigger: "change" }],
        gatewayId: [
          { required: true, message: "请选择网关SN", trigger: "change" },
        ],
        unit: [{ required: true, message: "请输入气体单位", trigger: "blur" }],
      },
      // 报警设置
      warningFormData: {},
      warningRenderFormArr: [
        {
          label: "仪表盘最小值",
          type: "input",
          prop: "min",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "仪表盘最大值",
          prop: "max",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "3级下限阀值",
          type: "input",
          prop: "lowerThreshold3",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "3级上限阀值",
          type: "input",
          prop: "upperThreshold3",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "2级下限阀值",
          type: "input",
          prop: "lowerThreshold2",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "2级上限阀值",
          type: "input",
          prop: "upperThreshold2",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "1级下限阀值",
          type: "input",
          prop: "lowerThreshold1",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "1级上限阀值",
          type: "input",
          prop: "upperThreshold1",
          clearable: true,
          style: {
            width: "49%",
          },
        },
      ],
      warningOptions: {},
      warningRules: {
        max: [
          { required: true, message: "请输入仪表盘最大值", trigger: "blur" },
          { validator: validateMax, trigger: "blur" },
        ],
        min: [
          { required: true, message: "请输入仪表盘最小值", trigger: "blur" },
          { validator: validateMin, trigger: "blur" },
        ],
        lowerThreshold3: [{ validator: lowerThreshold, trigger: "blur" }],
        upperThreshold3: [{ validator: upperThreshold, trigger: "blur" }],
        lowerThreshold2: [{ validator: lowerThreshold, trigger: "blur" }],
        upperThreshold2: [{ validator: upperThreshold, trigger: "blur" }],
        lowerThreshold1: [{ validator: lowerThreshold, trigger: "blur" }],
        upperThreshold1: [{ validator: upperThreshold, trigger: "blur" }],
      },
      // 保修设置
      warrantyFormData: {
        chipReplaceTime: null,
        monitorInstallTime: null,
        monitorServiceLength: null,
        serviceLength: null,
        factory: null,
        brand: null,
        model: null,
      },
      warrantyRenderFormArr: [
        {
          label: "芯片更换时间",
          type: "date",
          prop: "chipReplaceTime",
          placeholder: "选择时间",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "监控设备安装时间",
          type: "date",
          prop: "monitorInstallTime",
          placeholder: "选择时间",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "监控设备服务年限",
          clearable: true,
          prop: "monitorServiceLength",
          type: "input",
          style: {
            width: "49%",
          },
        },
        {
          label: "传感器服务年限",
          clearable: true,
          prop: "serviceLength",
          type: "input",
          style: {
            width: "49%",
          },
        },
        {
          label: "厂家",
          type: "input",
          clearable: true,
          prop: "factory",
          style: {
            width: "49%",
          },
        },
        {
          label: "品牌",
          type: "input",
          clearable: true,
          prop: "brand",
          style: {
            width: "49%",
          },
        },
        {
          label: "型号",
          type: "input",
          clearable: true,
          prop: "model",
          style: {
            width: "49%",
          },
        },
      ],
      warrantyOptions: {},
      warrantyRules: {
        monitorServiceLength: [
          {
            pattern: /^\d+$/,
            message: "数据格式为正整数",
          },
        ],
        serviceLength: [
          {
            pattern: /^\d+$/,
            message: "数据格式为正整数",
          },
        ],
      },
      isCreateSensor: false,
      // 有毒气体
      toxicGasFormData: {
        density: null,
        meltingPoint: null,
        pcTwa: null,
        pcStel: null,
        mac: null,
        idlh: null,
      },
      toxicGasRenderFormArr: [
        {
          label: "气体密度",
          prop: "density",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "熔点",
          prop: "meltingPoint",
          type: "input",
          clearable: true,
          append: "℃",
          style: {
            width: "49%",
          },
        },
        {
          label: "PC-TWA",
          prop: "pcTwa",
          type: "input",
          clearable: true,
          append: "mg/m3",
          style: {
            width: "49%",
          },
        },
        {
          label: "PC-STEL",
          prop: "pcStel",
          type: "input",
          append: "mg/m3",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "MAC",
          prop: "mac",
          type: "input",
          clearable: true,
          append: "mg/m3",
          style: {
            width: "49%",
          },
        },
        {
          label: "IDLH",
          prop: "idlh",
          type: "input",
          clearable: true,
          append: "mg/m3",
          style: {
            width: "49%",
          },
        },
      ],
      toxicGasRoules: {
        density: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        meltingPoint: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        pcTwa: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        pcStel: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        mac: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        idlh: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
      },
      // 可燃气体
      combustibleGasFormData: {
        firePoint: null,
        flashPoint: null,
        fireHazardClass: null,
        density: null,
        danger: null,
        remark: null,
      },
      combustibleGasRenderFormArr: [
        {
          label: "引燃温度",
          prop: "firePoint",
          type: "input",
          append: "℃/组别",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "闪点",
          prop: "flashPoint",
          type: "input",
          append: "℃/组别",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "火灾危险性分类",
          prop: "fireHazardClass",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "蒸气密度",
          prop: "density",
          type: "input",
          append: "kg/m3",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "主要危险",
          prop: "danger",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
        {
          label: "备注",
          prop: "remark",
          type: "input",
          clearable: true,
          style: {
            width: "49%",
          },
        },
      ],
      combustibleRules: {
        firePoint: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        flashPoint: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
        density: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
      },
      // 沸点
      boilFormData: {
        boilingPoint: null,
      },
      boilRenderFormArr: [
        {
          label: "沸点",
          prop: "boilingPoint",
          type: "input",
          append: "mg/m3",
          clearable: true,
          style: {
            width: "49%",
          },
        },
      ],
      boilRules: {
        boilingPoint: [
          {
            pattern: verifyTwoFigures,
            message: "数据为整数、0或精确2个小数点",
          },
        ],
      },
    });
    let METHODS = reactive({
      handleClickMarker: async (item: any) => {
        DATA.isShowMap = false;
        DATA.isshow = true;
        DATA.isdelete = false;
        DATA.isSensorDetails = false;
        // if (DATA.companyInfo.id != data.id) {
        DATA.baseInfoFormData = {
          sensorType: [],
        };
        DATA.warningFormData = {};
        DATA.warrantyFormData = {};
        DATA.toxicGasFormData = {};
        DATA.combustibleGasFormData = {};
        DATA.boilFormData = {};
        DATA.isCreateSensor = false;
        // }
        DATA.companyInfo = Object.assign({}, item);
        await METHODS.handleFindEnableGateway();
        await METHODS.handleGetCompanyGateway(item.id);
        DATA.activeName = "gateway";
        DATA.gatewayFormData.sn = "";
        nextTick(() => {
          proxy.$refs["gatewayForm"].clearValidate();
        });
      },
      // 获取树的数据给到地图
      getTreeToAmap(data: any) {
        DATA.companyList = [];
        data.data.forEach((item: any) => {
          item.companyList.forEach((val: any) => {
            DATA.companyList.push(val);
          });
        });
      },
      // 获取设备维护状态
      handleStatusList: async () => {
        let { data } = await getByKey({ key: "t_sensor_device_status" });
        if (data.code === RES_SUCCESS) {
          DATA.baseInfoOptions.status = data.data;
        }
      },
      // 获取传感器类型
      handleSensorType: async () => {
        let { data } = await getByKey({ key: "t_sensor_device_sensor_type" });
        if (data.code === RES_SUCCESS) {
          DATA.baseInfoOptions.sensorType = data.data;
        }
      },
      // 获取气体类型
      handleGasType: async () => {
        let { data } = await getByKey({ key: "t_sensor_device_gas_type" });
        if (data.code === RES_SUCCESS) {
          DATA.baseInfoOptions.gasType = data.data;
        }
      },
      // 获取可用网关列表
      handleFindEnableGateway: async () => {
        DATA.snList = [];
        let { data } = await findEnableGateway();
        if (data.code === RES_SUCCESS) {
          if (data.data.length > 0) {
            data.data.forEach((item: any) => {
              DATA.snList.push({ value: item });
            });
          }
        }
      },
      // 获取企业网关
      handleGetCompanyGateway: async (companyInfoId: number) => {
        DATA.tableLoading = true;
        let { data } = await findByCompanyGateway({
          companyInfoId,
        });
        if (data.code === RES_SUCCESS) {
          DATA.tableLoading = false;
          DATA.tableData = data.data;
          DATA.baseInfoOptions.gatewayId = data.data;
        }
      },
      querySearch: (queryString: string, cb: any) => {
        var results = queryString
          ? DATA.snList.filter((item: any) => {
              return item.value.indexOf(queryString) !== -1;
            })
          : DATA.snList;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      handleCompanyInfo: async (data: any, node: any) => {
        switch (data.marking) {
          case 1:
            DATA.isShowMap = true;
            DATA.isshow = false;
            DATA.companyInfo = {};
            DATA.isCreateSensor = false;
            DATA.isdelete = false;
            DATA.isSensorDetails = false;
            DATA.regionName = data.label;
            break;
          case 2:
            DATA.isShowMap = true;
            DATA.isshow = false;
            DATA.companyInfo = {};
            DATA.isCreateSensor = false;
            DATA.isdelete = false;
            DATA.isSensorDetails = false;
            DATA.regionName = data.label;
            break;
          case 3:
            DATA.isShowMap = false;
            DATA.isshow = true;
            DATA.isdelete = false;
            DATA.isSensorDetails = false;
            // if (DATA.companyInfo.id != data.id) {
            DATA.baseInfoFormData = {
              sensorType: [],
            };
            DATA.warningFormData = {};
            DATA.warrantyFormData = {};
            DATA.toxicGasFormData = {};
            DATA.combustibleGasFormData = {};
            DATA.boilFormData = {};
            DATA.isCreateSensor = false;
            // }
            // if (node.expanded) {
            await METHODS.handleFindEnableGateway();
            // }
            DATA.companyInfo = Object.assign({}, data);
            // if (data.deviceList?.length === 0) {
            //   DATA.snList = [];
            //   DATA.baseInfoOptions.gatewayId = [];
            //   DATA.tableData = [];
            // } 
            await METHODS.handleGetCompanyGateway(data.id);

            DATA.activeName = "gateway";
            DATA.gatewayFormData.sn = "";
            nextTick(() => {
              proxy.$refs["gatewayForm"].clearValidate();
            });
            break;
          case 4:
            DATA.isshow = false;
            DATA.isSensorDetails = true;
            DATA.isCreate = false;
            DATA.isdelete = true;
            DATA.companyInfo = Object.assign({}, data);
            await METHODS.handleGetCompanyGateway(data.companyInfoId);
            await METHODS.handleGetSensorData(data.id);
            nextTick(() => {
              proxy.$refs["baseInfoRef"].clearForm();
              proxy.$refs["toxicGasRef"].clearForm();
              proxy.$refs["combustibleGasRef"].clearForm();
              proxy.$refs["boilRef"].clearForm();
              proxy.$refs["warningRef"].clearForm();
              proxy.$refs["warrantyRef"].clearForm();
            });

            break;
          default:
            break;
        }
      },
      handleClick(tab: any, event: any) {
        switch (tab.props.name) {
          case "gateway":
            DATA.isCreateSensor = false;
            DATA.isCreate = false;
            break;
          case "sensor":
            DATA.isCreateSensor = true;
            DATA.isCreate = true;
            DATA.baseInfoOptions.uuid = [];
            DATA.baseInfoFormData.uuid = "";
            break;

          default:
            break;
        }
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.dialogVisible = true;
            DATA.formData = Object.assign({}, row);
            nextTick(() => {
              proxy.$refs["formRef"].clearValidate();
            });
            break;
          case "delete":
            proxy
              .$confirm("是否删除此网关, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(async () => {
                let { data } = await deleteGatway({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message({
                    type: "success",
                    message: "删除成功!",
                  });
                  METHODS.handleGetCompanyGateway(DATA.companyInfo.id);
                  METHODS.handleFindEnableGateway();
                }
              })
              .catch(() => {});
            break;

          default:
            break;
        }
      },
      handleCreateGateway: () => {
        proxy.$refs["gatewayForm"].validate(async (valid: boolean) => {
          if (valid) {
            let { data } = await createGatway({
              ...DATA.gatewayFormData,
              companyInfoId: DATA.companyInfo.id,
            });
            if (data.code === RES_SUCCESS) {
              METHODS.handleGetCompanyGateway(DATA.companyInfo.id);
              METHODS.handleFindEnableGateway();
              DATA.gatewayFormData.sn = "";
              nextTick(() => {
                proxy.$refs["gatewayForm"].clearValidate();
              });
            }
          }
        });
      },
      handleConfirm: () => {
        proxy.$refs["formRef"].validate(async (valid: boolean) => {
          if (valid) {
            let { data } = await updateGatway({
              ...DATA.formData,
              companyInfoId: DATA.companyInfo.id,
            });
            if (data.code === RES_SUCCESS) {
              ElMessage({
                message: "网关编辑成功",
                type: "success",
              });
              DATA.dialogVisible = false;
              METHODS.handleGetCompanyGateway(DATA.companyInfo.id);
              METHODS.handleFindEnableGateway();
            }
          }
        });
      },
      // handleCreateSensor: () => {
      //   DATA.isCreateSensor = true;
      //   DATA.isCreate = true;
      // },
      handleChange: async ({ formData, item }: any) => {
        if (item.prop == "gatewayId") {
          let uuidList: Array<any> = [];
          let sn = "";
          DATA.baseInfoOptions.uuid = [];
          DATA.baseInfoFormData.uuid = "";
          DATA.baseInfoOptions.gatewayId.forEach((item: any) => {
            if (DATA.baseInfoFormData.gatewayId === item.id) {
              sn = item.sn;
            }
          });
          let { data } = await findUUIDs({ sn });
          if (data.code === RES_SUCCESS) {
            if (data.data.length > 0) {
              data.data.forEach((item: any) => {
                uuidList.push({
                  value: item,
                  name: item,
                });
              });
              DATA.baseInfoOptions.uuid = uuidList;
            }
          }
        }
      },
      // 获取传感器数据
      handleGetSensorData: async (id: number) => {
        DATA.loading = true;
        let { data } = await findOne({ id });
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          if (data.data != null) {
            let { flammableGas, sensorDevice, toxicGas, warningSetting } =
              data.data;
            let {
              brand,
              chipReplaceTime,
              companyInfoId,
              factory,
              gasType,
              id,
              installLocation,
              installTime,
              max,
              min,
              model,
              monitorContent,
              monitorDevice,
              monitorInstallTime,
              monitorServiceLength,
              name,
              sensorType,
              serviceLength,
              status,
              unit,
              uuid,
              gatewayId,
            } = sensorDevice;
            sensorType = sensorType.split(",");
            let sensorTypes = sensorType.map((item: any) => {
              return (item = +item);
            });
            DATA.baseInfoFormData = Object.assign(
              {},
              {
                companyInfoId,
                gasType,
                id,
                installLocation,
                monitorContent,
                monitorDevice,
                name,
                sensorType: sensorTypes,
                status,
                installTime,
                unit,
                uuid,
                gatewayId,
              }
            );
            DATA.warningFormData = Object.assign(
              {},
              {
                ...warningSetting,
                min,
                max,
              }
            );
            DATA.toxicGasFormData = Object.assign({}, toxicGas);
            DATA.combustibleGasFormData = Object.assign({}, flammableGas);
            DATA.warrantyFormData = Object.assign(
              {},
              {
                chipReplaceTime,
                monitorInstallTime,
                monitorServiceLength,
                serviceLength,
                factory,
                brand,
                model,
              }
            );
            if (sensorType.includes("1")) {
              DATA.boilFormData = Object.assign(
                {},
                {
                  boilingPoint: toxicGas?.boilingPoint,
                }
              );
            } else if (sensorType.includes("2")) {
              DATA.boilFormData = Object.assign(
                {},
                {
                  boilingPoint: flammableGas?.boilingPoint,
                }
              );
            } else {
              DATA.boilFormData = Object.assign(
                {},
                {
                  boilingPoint: null,
                }
              );
            }
          }
        }
      },
      // 保存传感器
      handleSaveSensor: async () => {
        Promise.all([
          proxy.$refs["baseInfoRef"].submitForm(),
          proxy.$refs["toxicGasRef"].submitForm(),
          proxy.$refs["combustibleGasRef"].submitForm(),
          proxy.$refs["boilRef"].submitForm(),
          proxy.$refs["warningRef"].submitForm(),
          proxy.$refs["warrantyRef"].submitForm(),
        ]).then(async (vaildata) => {
          if (vaildata.length > 0) {
            DATA.saveLoading = true;
            DATA.baseInfoFormData.installTime &&
              (DATA.baseInfoFormData.installTime = filterTime(
                DATA.baseInfoFormData.installTime,
                "/"
              ));
            DATA.warrantyFormData.monitorInstallTime &&
              (DATA.warrantyFormData.monitorInstallTime = filterTime(
                DATA.warrantyFormData.monitorInstallTime,
                "/"
              ));
            DATA.warrantyFormData.chipReplaceTime &&
              (DATA.warrantyFormData.chipReplaceTime = filterTime(
                DATA.warrantyFormData.chipReplaceTime,
                "/"
              ));
            let sensorType;
            if (DATA.baseInfoFormData.sensorType instanceof Array) {
              if (DATA.isCreate) {
                sensorType = DATA.baseInfoFormData.sensorType.join(",");
              } else {
                // sensorType = DATA.warrantyFormData.sensorType.join(',');
                sensorType = DATA.baseInfoFormData.sensorType.join(",");
              }
            }
            let { min, max } = DATA.warningFormData;
            if (DATA.isCreate) {
              let { data } = await createSensorDevice({
                sensorDevice: {
                  ...DATA.warrantyFormData,
                  ...DATA.baseInfoFormData,
                  companyInfoId: DATA.companyInfo.id,
                  min,
                  max,
                  sensorType,
                },
                toxicGas: { ...DATA.toxicGasFormData, ...DATA.boilFormData },
                flammableGas: {
                  ...DATA.combustibleGasFormData,
                  ...DATA.boilFormData,
                },
                warningSetting: DATA.warningFormData,
              });
              if (data.code === RES_SUCCESS) {
                DATA.refreshSensorTree = false;
                nextTick(() => {
                  DATA.refreshSensorTree = true;
                });
                ElMessage({
                  message: "传感器添加成功",
                  type: "success",
                });
                DATA.isshow = false;
                DATA.isSensorDetails = true;
                DATA.isCreate = false;
                DATA.isdelete = true;
                DATA.saveLoading = false;
                DATA.companyInfo.id = data.data.sensorDevice.id;
                await METHODS.handleGetSensorData(data.data.sensorDevice.id);
              }
            } else {
              let { data } = await updateSensorDevice({
                sensorDevice: {
                  ...DATA.warrantyFormData,
                  ...DATA.baseInfoFormData,
                  companyInfoId: DATA.companyInfo.companyInfoId,
                  min,
                  max,
                  sensorType,
                },
                toxicGas: { ...DATA.toxicGasFormData, ...DATA.boilFormData },
                flammableGas: {
                  ...DATA.combustibleGasFormData,
                  ...DATA.boilFormData,
                },
                warningSetting: DATA.warningFormData,
              });
              if (data.code === RES_SUCCESS) {
                DATA.refreshSensorTree = false;
                nextTick(() => {
                  DATA.refreshSensorTree = true;
                });
                ElMessage({
                  message: "传感器编辑成功",
                  type: "success",
                });
                DATA.saveLoading = false;
                METHODS.handleGetSensorData(DATA.companyInfo.id);
              }
            }
          }
        });
      },
      // 删除传感器
      handleDeleteSensor: () => {
        proxy
          .$confirm("是否确定需要删除该传感器及相关数据？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(async () => {
            let { data } = await deleteSensorDevice({
              id: DATA.companyInfo.id,
            });
            if (data.code === RES_SUCCESS) {
              DATA.refreshSensorTree = false;
              nextTick(() => {
                DATA.refreshSensorTree = true;
              });
              proxy.$message({
                type: "success",
                message: "删除成功!",
              });
              DATA.isshow = false;
              DATA.companyInfo = {};
              DATA.isCreateSensor = false;
              DATA.isdelete = false;
              DATA.isSensorDetails = false;
            }
          })
          .catch(() => {});
      },
      // 过滤树结构
      handleFilter: () => {
        // proxy.$refs["SensorTree"].filterText(DATA.searchContent);

        DATA.isFilter = !DATA.isFilter;
      },
    });
    onMounted(() => {
      METHODS.handleStatusList();
      METHODS.handleSensorType();
      METHODS.handleGasType();
      METHODS.handleFindEnableGateway();
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
      STORE,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}
.baseInfo {
  border-left: 5px solid #666666;
  padding-left: 5px;
}
.label {
  text-align: right;
  color: #aaa;
  font-size: 14px;
}

.amap {
  width: 100%;
  height: calc(100vh - 170px);
}
</style>