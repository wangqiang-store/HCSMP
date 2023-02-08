<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>矿山生产信息</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            v-show="disable"
            @click="disable=!disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            v-show="!disable"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
      <div class="w-100 d_flex d_flex_sb mb-10 mt-20">
        <h4>施工单位信息</h4>
        <el-button
          type="primary"
          size="small"
          @click="handleCreate"
          :disabled="!isDisable || (STORE.state.globalData.companyInfo.type == 1 ? !undergroundFormData.id : !outdoorsFormData.id)"
        >添加</el-button>
      </div>
      <ele-table
        :tableData="type === 1 ? undergroundTableData : outdoorsTableData"
        :btnList="btnList"
        :renderTable="renderTable"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
        v-loading="tableLoading"
      ></ele-table>
    </el-col>
    <!-- 地下矿山 -->
    <el-col
      :span="24"
      v-if="type === 1"
    >
      <ele-form
        :formData="undergroundFormData"
        :renderFormArr="undergroundRenderFormArr"
        :radios="undergroundRadios"
        :checkboxs="undergroundCheaks"
        :isDisable="disable"
        :rules="undergroundRules"
        :styles="styles"
        ref="formRef"
      ></ele-form>
    </el-col>
    <!-- 露天矿山 -->
    <el-col
      :span="24"
      v-if="type === 2"
    >
      <ele-form
        :formData="outdoorsFormData"
        :renderFormArr="outdoorsRenderFormArr"
        :radios="outdoorsRadios"
        :checkboxs="outdoorsChecks"
        :isDisable="disable"
        :rules="outdoorsRules"
        :styles="styles"
        ref="formRef"
      ></ele-form>
    </el-col>
    <el-col :span="24">
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
import EleForm from '@/components/eleForm/index.vue';
import { useStore } from 'vuex';
import { filterTime } from '@/utils/filtration';
import {
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import {
  createMineOpenAirProductionInfo,
  createMineProductionInfo,
  createMineProductionUnit,
  daleteMineProductionUnit,
  updateMineOpenAirProductionInfo,
  updateMineProductionInfo,
  updateMineProductionUnit,
} from '@/api/company/mineProductionInfo';
import { ElMessage } from 'element-plus';
import { verifyPositive } from '@/api/common/verify';
export default defineComponent({
  components: { EleTable, EleForm },
  props: {
    formData: {
      type: Object,
      default: {},
    },
    isDisable: {
      type: Boolean,
      default: true,
    },
    type: {
      type: Number,
    },
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let dialogFormRef: any = ref(null);
    let formRef: any = ref(null);
    let DATA: any = reactive({
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
          label: '名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '单位资质',
          prop: 'qualification',
          type: 'text',
          formatter: (row: any) => {
            let text = '';
            DATA.options.qualification.forEach((item: any) => {
              if (item.value === row.qualification) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: '有效期',
          prop: 'time',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.time, '-', false);
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
        },
      ],
      disable: true,
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      undergroundTableData: [],
      // 添加、编辑
      dialogTitle: '',
      dialogVisible: false,
      dialogType: false,
      dialogFormData: {},
      options: {},
      dialogRenderFormArr: [
        {
          label: '名称',
          type: 'input',
          prop: 'name',
          labelWidth: 120,
        },
        {
          label: '单位资质',
          type: 'select',
          prop: 'qualification',
          value: 'value',
          title: 'name',
          placeholder: '请选择单位资质',
          labelWidth: 120,
        },
        {
          label: '有效期',
          type: 'date',
          prop: 'time',
          placeholder: '请选择有效期',
          labelWidth: 120,
        },
      ],
      dialogRules: {
        name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur',
          },
        ],
        qualification: [
          {
            required: true,
            message: '请选择单位资质',
            trigger: 'change',
          },
        ],
        time: [
          {
            required: true,
            message: '请选择有效期',
            trigger: 'change',
          },
        ],
      },
      tableLoading: false,
      // 地下矿山
      undergroundFormData: {},
      undergroundRenderFormArr: [
        {
          label: '采矿方法',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'miningMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '开拓方式',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'openWay',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '水泵硐室数量',
          type: 'input',
          labelWidth: 200,
          prop: 'pumpChambersSum',
          append: '个',
          style: {
            width: '45%',
          },
        },
        {
          label: '中央变电硐室长度',
          type: 'input',
          labelWidth: 200,
          prop: 'centralSubstationChamberLength',
          append: 'm',
          style: {
            width: '45%',
          },
        },
        {
          label: '直达地面是安全出口数量',
          type: 'input',
          labelWidth: 200,
          prop: 'exportQuantitySum',
          append: '个',
          style: {
            width: '45%',
          },
        },
        {
          label: '井下单班最多作业人数',
          type: 'input',
          labelWidth: 200,
          prop: 'maxPeople',
          append: '人',
          style: {
            width: '45%',
          },
        },
        {
          label: '运输方式',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'transportMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '通风方式',
          type: 'radio',
          labelWidth: 200,
          prop: 'ventilationMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '主要通风机工作方式',
          type: 'radio',
          labelWidth: 200,
          prop: 'ventilatorWorkingMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '主要通风机数量',
          type: 'input',
          append: '台',
          labelWidth: 200,
          prop: 'ventilatorSum',
          style: {
            width: '45%',
          },
        },
        {
          label: '辅助通风机数量',
          type: 'input',
          append: '台',
          labelWidth: 200,
          prop: 'auxiliaryVentilatorSum',
          style: {
            width: '45%',
          },
        },
        {
          label: '局部通风机数量',
          type: 'input',
          append: '台',
          labelWidth: 200,
          prop: 'partialVentilatorSum',
          style: {
            width: '45%',
          },
        },
        {
          label: '水文地质条件',
          type: 'radio',
          labelWidth: 200,
          prop: 'hydrogeological',
          value: 'value',
          title: 'name',
          style: {
            width: '45%',
          },
        },
        {
          label: '凿岩设备',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'rockDrilling',
          value: 'value',
          title: 'name',
          style: {
            width: '45%',
          },
        },
        {
          label: '凿岩设备数量',
          type: 'input',
          append: '台',
          labelWidth: 200,
          prop: 'rockDrillingSum',
          style: {
            width: '45%',
          },
        },
        {
          label: '炮孔',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'blasthole',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '采空区处理方式',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'goafTreatmentMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '45%',
          },
        },
        {
          label: '采空区总量',
          type: 'input',
          labelWidth: 200,
          append: 'm³',
          prop: 'goafTreatmentArea',
          style: {
            width: '45%',
          },
        },
        {
          label: '三下开采',
          type: 'radio',
          labelWidth: 200,
          prop: 'threeMining',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '安全避险"六大系统"',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'safeHaven',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
      ],
      undergroundRadios: {},
      undergroundCheaks: {},
      undergroundRules: {
        pumpChambersSum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        centralSubstationChamberLength: [
          {
            pattern: verifyPositive,
            message: '数据格式为正整数或精确2个小数点',
          },
        ],
        exportQuantitySum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        maxPeople: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        ventilatorSum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        auxiliaryVentilatorSum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        partialVentilatorSum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        rockDrillingSum: [
          {
            pattern: /^\d*$/,
            message: '数据格式为正整数数字',
          },
        ],
        goafTreatmentArea: [
          {
            pattern: verifyPositive,
            message: '数据格式为正整数或精确2个小数点',
          },
        ],
      },
      type: null,
      // 露天矿山
      outdoorsTableData: [],
      outdoorsFormData: {},
      outdoorsRenderFormArr: [
        {
          label: '开采工艺布置形式',
          type: 'radio',
          labelWidth: 200,
          prop: 'miningProcessLayout',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '开采方式',
          type: 'radio',
          labelWidth: 200,
          prop: 'miningMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '采场结构参数',
          type: 'radio',
          labelWidth: 200,
          prop: 'stopeStructure',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '开拓运输',
          type: 'radio',
          labelWidth: 200,
          prop: 'development',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '穿孔设备类型',
          type: 'radio',
          labelWidth: 200,
          prop: 'perforationEquipment',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '爆破方法',
          type: 'radio',
          labelWidth: 200,
          prop: 'blastingMethod',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '铲装',
          type: 'checkbox',
          labelWidth: 200,
          prop: 'shovelLoading',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '二次破碎',
          type: 'radio',
          labelWidth: 200,
          prop: 'secondaryCrushing',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '水文地质条件',
          type: 'radio',
          labelWidth: 200,
          prop: 'hyConditions',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
        {
          label: '排水方式',
          type: 'radio',
          labelWidth: 200,
          prop: 'drainageMode',
          value: 'value',
          title: 'name',
          style: {
            width: '100%',
          },
        },
      ],
      outdoorsRadios: {},
      outdoorsChecks: {},
      outdoorsRules: {},
      isShowUnderground: false,
      isShowOutdoors: false,
      isOneType: true,
    });
    let METHODS = reactive({
      //  字典数据
      handletGetByKey: async (key: string) => {
        let { data } = await getByKey({ key });
        if (data.code === RES_SUCCESS) {
          sessionWrite(key, data.data);
          return data.data;
        }
      },
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (props.formData.companyInfoId) {
              if (STORE.state.globalData.companyInfo.type !== DATA.type) {
                ElMessage({
                  message: '请先保存提交营业执照基本信息',
                  type: 'warning',
                });
                return;
              }
              if (STORE.state.globalData.companyInfo.type == 1) {
                delete DATA.undergroundFormData.constructionUnitList;
                delete DATA.undergroundFormData.createTime;
                delete DATA.undergroundFormData.updateTime;
                let formData = Object.assign({}, DATA.undergroundFormData);
                if (!DATA.undergroundFormData.miningMethod) {
                  formData.miningMethod = '';
                } else {
                  formData.miningMethod =
                    DATA.undergroundFormData.miningMethod.join(',');
                }
                if (!DATA.undergroundFormData.openWay) {
                  formData.openWay = '';
                } else {
                  formData.openWay = DATA.undergroundFormData.openWay.join(',');
                }
                if (!DATA.undergroundFormData.transportMethod) {
                  formData.transportMethod = '';
                } else {
                  formData.transportMethod =
                    DATA.undergroundFormData.transportMethod.join(',');
                }
                if (!DATA.undergroundFormData.rockDrilling) {
                  formData.rockDrilling = '';
                } else {
                  formData.rockDrilling =
                    DATA.undergroundFormData.rockDrilling.join(',');
                }
                if (!DATA.undergroundFormData.blasthole) {
                  formData.blasthole = '';
                } else {
                  formData.blasthole =
                    DATA.undergroundFormData.blasthole.join(',');
                }
                if (!DATA.undergroundFormData.goafTreatmentMethod) {
                  formData.goafTreatmentMethod = '';
                } else {
                  formData.goafTreatmentMethod =
                    DATA.undergroundFormData.goafTreatmentMethod.join(',');
                }
                if (!DATA.undergroundFormData.safeHaven) {
                  formData.safeHaven = '';
                } else {
                  formData.safeHaven =
                    DATA.undergroundFormData.safeHaven.join(',');
                }
                if (DATA.undergroundFormData.id) {
                  let { data } = await updateMineProductionInfo({
                    ...formData,
                    companyInfoId: DATA.undergroundFormData.companyInfoId,
                  });
                  if (data.code === RES_SUCCESS) {
                    ElMessage({
                      message: '矿山生产信息保存成功',
                      type: 'success',
                    });
                    if (!data.data.miningMethod) {
                      data.data.miningMethod = [];
                    } else {
                      data.data.miningMethod = data.data.miningMethod
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.openWay) {
                      data.data.openWay = [];
                    } else {
                      data.data.openWay = data.data.openWay
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.transportMethod) {
                      data.data.transportMethod = [];
                    } else {
                      data.data.transportMethod = data.data.transportMethod
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.rockDrilling) {
                      data.data.rockDrilling = [];
                    } else {
                      data.data.rockDrilling = data.data.rockDrilling
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.blasthole) {
                      data.data.blasthole = [];
                    } else {
                      data.data.blasthole = data.data.blasthole
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.goafTreatmentMethod) {
                      data.data.goafTreatmentMethod = [];
                    } else {
                      data.data.goafTreatmentMethod =
                        data.data.goafTreatmentMethod
                          .split(',')
                          .map((item: string) => {
                            return +item;
                          });
                    }
                    if (!data.data.safeHaven) {
                      data.data.safeHaven = [];
                    } else {
                      data.data.safeHaven = data.data.safeHaven
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    DATA.undergroundFormData = {
                      ...data.data,
                      type: 1,
                    };
                    DATA.disable = !DATA.disable;
                  }
                } else {
                  let { data } = await createMineProductionInfo({
                    ...formData,
                    companyInfoId: DATA.undergroundFormData.companyInfoId,
                  });
                  if (data.code === RES_SUCCESS) {
                    ElMessage({
                      message: '矿山生产信息保存成功',
                      type: 'success',
                    });
                    if (!data.data.miningMethod) {
                      data.data.miningMethod = [];
                    } else {
                      data.data.miningMethod = data.data.miningMethod
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.openWay) {
                      data.data.openWay = [];
                    } else {
                      data.data.openWay = data.data.openWay
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.transportMethod) {
                      data.data.transportMethod = [];
                    } else {
                      data.data.transportMethod = data.data.transportMethod
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.rockDrilling) {
                      data.data.rockDrilling = [];
                    } else {
                      data.data.rockDrilling = data.data.rockDrilling
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.blasthole) {
                      data.data.blasthole = [];
                    } else {
                      data.data.blasthole = data.data.blasthole
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    if (!data.data.goafTreatmentMethod) {
                      data.data.goafTreatmentMethod = [];
                    } else {
                      data.data.goafTreatmentMethod =
                        data.data.goafTreatmentMethod
                          .split(',')
                          .map((item: string) => {
                            return +item;
                          });
                    }
                    if (!data.data.safeHaven) {
                      data.data.safeHaven = [];
                    } else {
                      data.data.safeHaven = data.data.safeHaven
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    DATA.undergroundFormData = {
                      ...data.data,
                      type: 1,
                    };
                    DATA.disable = !DATA.disable;
                  }
                }
              } else if (STORE.state.globalData.companyInfo.type === 2) {
                delete DATA.outdoorsFormData.constructionUnitList;
                delete DATA.outdoorsFormData.createTime;
                delete DATA.outdoorsFormData.updateTime;
                let formData = Object.assign({}, DATA.outdoorsFormData);
                if (!DATA.outdoorsFormData.shovelLoading) {
                  formData.shovelLoading = '';
                } else {
                  formData.shovelLoading =
                    DATA.outdoorsFormData.shovelLoading.join(',');
                }
                if (DATA.outdoorsFormData.id) {
                  let { data } = await updateMineOpenAirProductionInfo({
                    ...formData,
                    companyInfoId: DATA.outdoorsFormData.companyInfoId,
                  });
                  if (data.code === RES_SUCCESS) {
                    ElMessage({
                      message: '矿山生产信息保存成功',
                      type: 'success',
                    });
                    if (!data.data.shovelLoading) {
                      data.data.shovelLoading = [];
                    } else {
                      data.data.shovelLoading = data.data.shovelLoading
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    DATA.outdoorsFormData = {
                      ...data.data,
                      type: 2,
                    };
                    DATA.disable = !DATA.disable;
                  }
                } else {
                  let { data } = await createMineOpenAirProductionInfo({
                    ...formData,
                    companyInfoId: DATA.outdoorsFormData.companyInfoId,
                  });
                  if (data.code === RES_SUCCESS) {
                    ElMessage({
                      message: '矿山生产信息保存成功',
                      type: 'success',
                    });
                    if (!data.data.shovelLoading) {
                      data.data.shovelLoading = [];
                    } else {
                      data.data.shovelLoading = data.data.shovelLoading
                        .split(',')
                        .map((item: string) => {
                          return +item;
                        });
                    }
                    DATA.outdoorsFormData = {
                      ...data.data,
                      type: 2,
                    };
                    DATA.disable = !DATA.disable;
                  }
                }
              }
            } else {
              ElMessage({
                message: '请先填写保存营业执照信息',
                type: 'warning',
              });
            }
          }
        });
      },
      handleCreate: () => {
        DATA.dialogTitle = '添加施工单位信息';
        DATA.dialogType = true;
        DATA.dialogVisible = true;
        DATA.dialogFormData = {};
        nextTick(() => {
          dialogFormRef.value.clearForm();
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑施工单位信息';
            DATA.dialogType = false;
            DATA.dialogVisible = true;
            DATA.dialogFormData = Object.assign({}, row);
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
                if (STORE.state.globalData.companyInfo.type === 1) {
                  let { data } = await daleteMineProductionUnit({
                    id: row.id,
                    mineProductionInfoId: DATA.undergroundFormData.id,
                  });
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    DATA.undergroundTableData = data.data;
                  }
                } else if (STORE.state.globalData.companyInfo.type === 2) {
                  let { data } = await daleteMineProductionUnit({
                    id: row.id,
                    mineOpenAirProductionInfoId: DATA.outdoorsFormData.id,
                  });
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    DATA.outdoorsTableData = data.data;
                  }
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
            if (STORE.state.globalData.companyInfo.type !== DATA.type) {
              ElMessage({
                message: '请先保存提交营业执照基本信息',
                type: 'warning',
              });
              return;
            }
            if (STORE.state.globalData.companyInfo.type == 1) {
              if (!DATA.undergroundFormData.id) {
                ElMessage({
                  message: '请先填写保存矿山生产信息',
                  type: 'warning',
                });
                return;
              }
            } else {
              if (!DATA.outdoorsFormData.id) {
                ElMessage({
                  message: '请先填写保存矿山生产信息',
                  type: 'warning',
                });
                return;
              }
            }

            DATA.dialogFormData.time = filterTime(
              DATA.dialogFormData.time,
              '/'
            );
            DATA.tableLoading = true;
            if (DATA.dialogType) {
              if (STORE.state.globalData.companyInfo.type === 1) {
                let { data } = await createMineProductionUnit({
                  ...DATA.dialogFormData,
                  mineProductionInfoId: DATA.undergroundFormData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '添加成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.undergroundTableData = data.data;
                }
              } else if (STORE.state.globalData.companyInfo.type === 2) {
                let { data } = await createMineProductionUnit({
                  ...DATA.dialogFormData,
                  mineOpenAirProductionInfoId: DATA.outdoorsFormData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '添加成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.outdoorsTableData = data.data;
                }
              }
            } else {
              delete DATA.dialogFormData.createTime;
              delete DATA.dialogFormData.updateTime;
              if (STORE.state.globalData.companyInfo.type === 1) {
                let { data } = await updateMineProductionUnit({
                  ...DATA.dialogFormData,
                  mineProductionInfoId: DATA.undergroundFormData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '编辑成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.undergroundTableData = data.data;
                }
              } else if (STORE.state.globalData.companyInfo.type === 2) {
                let { data } = await updateMineProductionUnit({
                  ...DATA.dialogFormData,
                  mineOpenAirProductionInfoId: DATA.outdoorsFormData.id,
                });
                if (data.code === RES_SUCCESS) {
                  DATA.tableLoading = false;
                  ElMessage({
                    message: '编辑成功',
                    type: 'success',
                  });
                  DATA.dialogVisible = false;
                  DATA.outdoorsTableData = data.data;
                }
              }
            }
          }
        });
      },
    });
    watch(
      () => props.type,
      async (newValue) => {
        DATA.type = newValue;
        if (newValue === 1 && !DATA.isShowUnderground) {
          // 采矿方法
          if (sessionRead('t_mine_mining_method')) {
            DATA.undergroundCheaks.miningMethod = sessionRead(
              't_mine_mining_method'
            );
          } else {
            DATA.undergroundCheaks.miningMethod = await METHODS.handletGetByKey(
              't_mine_mining_method'
            );
          }
          // 开拓方式
          if (sessionRead('t_mine_open_way')) {
            DATA.undergroundCheaks.openWay = sessionRead('t_mine_open_way');
          } else {
            DATA.undergroundCheaks.openWay = await METHODS.handletGetByKey(
              't_mine_open_way'
            );
          }
          // 运输方式
          if (sessionRead('t_mine_transport_method')) {
            DATA.undergroundCheaks.transportMethod = sessionRead(
              't_mine_transport_method'
            );
          } else {
            DATA.undergroundCheaks.transportMethod =
              await METHODS.handletGetByKey('t_mine_transport_method');
          }
          // 通风方式
          if (sessionRead('t_mine_ventilation_method')) {
            DATA.undergroundRadios.ventilationMethod = sessionRead(
              't_mine_ventilation_method'
            );
          } else {
            DATA.undergroundRadios.ventilationMethod =
              await METHODS.handletGetByKey('t_mine_ventilation_method');
          }
          // 主要工作方式
          if (sessionRead('t_mine_ventilator_working_method')) {
            DATA.undergroundRadios.ventilatorWorkingMethod = sessionRead(
              't_mine_ventilator_working_method'
            );
          } else {
            DATA.undergroundRadios.ventilatorWorkingMethod =
              await METHODS.handletGetByKey('t_mine_ventilator_working_method');
          }
          // 水文地质条件
          if (sessionRead('t_mine_hydrogeological_type')) {
            DATA.undergroundRadios.hydrogeological = sessionRead(
              't_mine_hydrogeological_type'
            );
          } else {
            DATA.undergroundRadios.hydrogeological =
              await METHODS.handletGetByKey('t_mine_hydrogeological_type');
          }
          // 凿岩设备
          if (sessionRead('t_mine_rock_drilling_type')) {
            DATA.undergroundCheaks.rockDrilling = sessionRead(
              't_mine_rock_drilling_type'
            );
          } else {
            DATA.undergroundCheaks.rockDrilling = await METHODS.handletGetByKey(
              't_mine_rock_drilling_type'
            );
          }
          // 炮孔
          if (sessionRead('t_mine_blasthole_type')) {
            DATA.undergroundCheaks.blasthole = sessionRead(
              't_mine_blasthole_type'
            );
          } else {
            DATA.undergroundCheaks.blasthole = await METHODS.handletGetByKey(
              't_mine_blasthole_type'
            );
          }

          // 采空区处理方式
          if (sessionRead('t_mine_goaf_treatment_method')) {
            DATA.undergroundCheaks.goafTreatmentMethod = sessionRead(
              't_mine_goaf_treatment_method'
            );
          } else {
            DATA.undergroundCheaks.goafTreatmentMethod =
              await METHODS.handletGetByKey('t_mine_goaf_treatment_method');
          }

          // 三下开采
          if (sessionRead('t_mine_three_mining')) {
            DATA.undergroundRadios.threeMining = sessionRead(
              't_mine_three_mining'
            );
          } else {
            DATA.undergroundRadios.threeMining = await METHODS.handletGetByKey(
              't_mine_three_mining'
            );
          }
          // 安全避险“六大系统”
          if (sessionRead('t_mine_safe_haven')) {
            DATA.undergroundCheaks.safeHaven = sessionRead('t_mine_safe_haven');
          } else {
            DATA.undergroundCheaks.safeHaven = await METHODS.handletGetByKey(
              't_mine_safe_haven'
            );
          }

          if (!DATA.isOneType) {
            DATA.undergroundFormData.miningMethod = [];
            DATA.undergroundFormData.openWay = [];
            DATA.undergroundFormData.transportMethod = [];
            DATA.undergroundFormData.rockDrilling = [];
            DATA.undergroundFormData.blasthole = [];
            DATA.undergroundFormData.goafTreatmentMethod = [];
            DATA.undergroundFormData.safeHaven = [];
          }
          if (STORE.state.globalData.companyInfo.type !== newValue) {
            DATA.undergroundTableData = [];
          }
          DATA.isShowUnderground = true;
          DATA.isOneType = false;
        }
        if (newValue === 2 && !DATA.isShowOutdoors) {
          // 开采工艺布置形式
          if (sessionRead('t_open_air_workmanship')) {
            DATA.outdoorsRadios.miningProcessLayout = sessionRead(
              't_open_air_workmanship'
            );
          } else {
            DATA.outdoorsRadios.miningProcessLayout =
              await METHODS.handletGetByKey('t_open_air_workmanship');
          }
          // 开采工艺布置形式
          if (sessionRead('t_open_air_mining_mode')) {
            DATA.outdoorsRadios.miningMethod = sessionRead(
              't_open_air_mining_mode'
            );
          } else {
            DATA.outdoorsRadios.miningMethod = await METHODS.handletGetByKey(
              't_open_air_mining_mode'
            );
          }
          // 采场结构参数
          if (sessionRead('t_open_air_structure_parameters')) {
            DATA.outdoorsRadios.stopeStructure = sessionRead(
              't_open_air_structure_parameters'
            );
          } else {
            DATA.outdoorsRadios.stopeStructure = await METHODS.handletGetByKey(
              't_open_air_structure_parameters'
            );
          }
          // 开拓运输
          if (sessionRead('t_open_air_transportation')) {
            DATA.outdoorsRadios.development = sessionRead(
              't_open_air_transportation'
            );
          } else {
            DATA.outdoorsRadios.development = await METHODS.handletGetByKey(
              't_open_air_transportation'
            );
          }
          // 穿孔设备类型
          if (sessionRead('t_open_air_perforation_type')) {
            DATA.outdoorsRadios.perforationEquipment = sessionRead(
              't_open_air_perforation_type'
            );
          } else {
            DATA.outdoorsRadios.perforationEquipment =
              await METHODS.handletGetByKey('t_open_air_perforation_type');
          }
          // 爆破方法
          if (sessionRead('t_open_air_blasting_method')) {
            DATA.outdoorsRadios.blastingMethod = sessionRead(
              't_open_air_blasting_method'
            );
          } else {
            DATA.outdoorsRadios.blastingMethod = await METHODS.handletGetByKey(
              't_open_air_blasting_method'
            );
          }

          // 铲装
          if (sessionRead('t_open_air_shovel_loading')) {
            DATA.outdoorsChecks.shovelLoading = sessionRead(
              't_open_air_shovel_loading'
            );
          } else {
            DATA.outdoorsChecks.shovelLoading = await METHODS.handletGetByKey(
              't_open_air_shovel_loading'
            );
          }

          // 二次破碎
          if (sessionRead('t_open_air_secondary_crushing')) {
            DATA.outdoorsRadios.secondaryCrushing = sessionRead(
              't_open_air_secondary_crushing'
            );
          } else {
            DATA.outdoorsRadios.secondaryCrushing =
              await METHODS.handletGetByKey('t_open_air_secondary_crushing');
          }

          // 水文地质条件
          if (sessionRead('t_open_air_hydrogeological')) {
            DATA.outdoorsRadios.hyConditions = sessionRead(
              't_open_air_hydrogeological'
            );
          } else {
            DATA.outdoorsRadios.hyConditions = await METHODS.handletGetByKey(
              't_open_air_hydrogeological'
            );
          }
          // 排水方式
          if (sessionRead('drainageMode')) {
            DATA.outdoorsRadios.drainageMode = sessionRead(
              't_open_air_drainage_mode'
            );
          } else {
            DATA.outdoorsRadios.drainageMode = await METHODS.handletGetByKey(
              't_open_air_drainage_mode'
            );
          }
          if (!DATA.isOneType) {
            DATA.outdoorsFormData.shovelLoading = [];
          }
          if (STORE.state.globalData.companyInfo.type !== newValue) {
            DATA.outdoorsTableData = [];
          }
          DATA.isShowOutdoors = true;
          DATA.isOneType = false;
        }
      }
    );
    watch(
      () => props.formData,
      async () => {
        if (props.formData.type == 1) {
          DATA.undergroundFormData = Object.assign({}, props.formData);
          if (!props.formData.miningMethod) {
            DATA.undergroundFormData.miningMethod = [];
          } else {
            DATA.undergroundFormData.miningMethod = props.formData.miningMethod
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          if (!props.formData.openWay) {
            DATA.undergroundFormData.openWay = [];
          } else {
            DATA.undergroundFormData.openWay = props.formData.openWay
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          if (!props.formData.transportMethod) {
            DATA.undergroundFormData.transportMethod = [];
          } else {
            DATA.undergroundFormData.transportMethod =
              props.formData.transportMethod.split(',').map((item: string) => {
                return +item;
              });
          }
          if (!props.formData.rockDrilling) {
            DATA.undergroundFormData.rockDrilling = [];
          } else {
            DATA.undergroundFormData.rockDrilling = props.formData.rockDrilling
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          if (!props.formData.blasthole) {
            DATA.undergroundFormData.blasthole = [];
          } else {
            DATA.undergroundFormData.blasthole = props.formData.blasthole
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          if (!props.formData.goafTreatmentMethod) {
            DATA.undergroundFormData.goafTreatmentMethod = [];
          } else {
            DATA.undergroundFormData.goafTreatmentMethod =
              props.formData.goafTreatmentMethod
                .split(',')
                .map((item: string) => {
                  return +item;
                });
          }
          if (!props.formData.safeHaven) {
            DATA.undergroundFormData.safeHaven = [];
          } else {
            DATA.undergroundFormData.safeHaven = props.formData.safeHaven
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          DATA.undergroundTableData = props.formData.constructionUnitList;
        }
        if (props.formData.type == 2) {
          DATA.outdoorsFormData = Object.assign({}, props.formData);
          if (!props.formData.shovelLoading) {
            DATA.outdoorsFormData.shovelLoading = [];
          } else {
            DATA.outdoorsFormData.shovelLoading = props.formData.shovelLoading
              .split(',')
              .map((item: string) => {
                return +item;
              });
          }
          DATA.outdoorsTableData = props.formData.constructionUnitList;
        }
      },
      {
        deep: true,
        immediate: true,
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
    onMounted(async () => {
      // 获取施工单位资质
      if (sessionRead('t_qualification_type')) {
        DATA.options.qualification = sessionRead('t_qualification_type');
      } else {
        DATA.options.qualification = await METHODS.handletGetByKey(
          't_qualification_type'
        );
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      dialogFormRef,
      formRef,
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
</style>