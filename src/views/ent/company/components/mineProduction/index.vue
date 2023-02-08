<template>
  <el-row>
    <el-col :span="24">
      <div class="w-100 d_flex d_flex_sb">
        <h3>矿山生产基本信息</h3>
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
      <EleForm
        :formData="formData"
        :rules="rules"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :options="options"
        :radios="radios"
        :isDisable="disable"
        ref="formRef"
        @handleChangeRadio="handleChangeRadio"
      >
      </EleForm>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import {
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import {
  createMineProductionBaseInfo,
  updateMineProductionBaseInfo,
} from '@/api/company/mineProduction';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  components: { EleForm },
  props: {
    formData: {
      type: Object,
      default: {},
    },
    isDisable: {
      type: Boolean,
    },
  },
  emits: ['handleChangeRadio'],
  setup(props, { emit }) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let formRef: any = ref(null);
    let DATA: any = reactive({
      formData: {},
      rules: {},
      renderFormArr: [
        {
          label: '是否为在建矿山',
          type: 'radio',
          value: 'value',
          title: 'title',
          labelWidth: '130px',
          prop: 'isConstruction',
          style: {
            width: '40%',
          },
        },
        {
          label: '建设期限',
          type: 'date',
          prop: 'constructTime',
          placeholder: '建设期限',
          labelWidth: '130px',
          style: {
            width: '40%',
          },
        },
        {
          label: '运行情况',
          type: 'radio',
          value: 'value',
          title: 'name',
          labelWidth: '130px',
          prop: 'operationStatus',
          style: {
            width: '40%',
          },
        },
        {
          label: '标准化等级',
          type: 'select',
          value: 'value',
          title: 'name',
          prop: 'standardizedLevel',
          labelWidth: '130px',
          style: {
            width: '40%',
          },
        },
        {
          label: '是否已关闭',
          type: 'radio',
          value: 'value',
          title: 'title',
          prop: 'isClose',
          labelWidth: '130px',
          style: {
            width: '40%',
          },
        },
        {
          label: '投产时间',
          type: 'date',
          prop: 'productionTime',
          placeholder: '投产时间',
          labelWidth: '130px',
          style: {
            width: '40%',
          },
        },
        {
          label: '是否爆破公司',
          type: 'radio',
          value: 'value',
          title: 'title',
          prop: 'isBlastingCompany',
          labelWidth: '130px',
          style: {
            width: '100%',
          },
        },
      ],
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      disable: true,
      options: {},
      radios: {
        isConstruction: [
          {
            value: true,
            title: '是',
          },
          {
            value: false,
            title: '否',
          },
        ],
        isClose: [
          {
            value: true,
            title: '是',
          },
          {
            value: false,
            title: '否',
          },
        ],
        isBlastingCompany: [
          {
            value: true,
            title: '是',
          },
          {
            value: false,
            title: '否',
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取矿山运行情况
      handleGetOperationStatus: async () => {
        if (sessionRead('t_mine_operation_status')) {
          DATA.radios.operationStatus = sessionRead('t_mine_operation_status');
        } else {
          let { data } = await getByKey({ key: 't_mine_operation_status' });
          if (data.code === RES_SUCCESS) {
            DATA.radios.operationStatus = data.data;
            sessionWrite('t_mine_operation_status', data.data);
          }
        }
      },
      //  标准化等级
      handleGetStandardizedLevel: async () => {
        if (sessionRead('t_standardized_level')) {
          DATA.options.standardizedLevel = sessionRead('t_standardized_level');
        } else {
          let { data } = await getByKey({ key: 't_standardized_level' });
          if (data.code === RES_SUCCESS) {
            DATA.options.standardizedLevel = data.data;
            sessionWrite('t_standardized_level', data.data);
          }
        }
      },
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.formData.companyInfoId) {
              if (DATA.formData.constructTime) {
                DATA.formData.constructTime = filterTime(
                  DATA.formData.constructTime,
                  '/'
                );
              } else {
                delete DATA.formData.constructTime;
              }
              if (DATA.formData.productionTime) {
                DATA.formData.productionTime = filterTime(
                  DATA.formData.productionTime,
                  '/'
                );
              } else {
                delete DATA.formData.productionTime;
              }
              if (DATA.formData.id) {
                let { data } = await updateMineProductionBaseInfo(
                  DATA.formData
                );
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '矿山生产基本信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
                }
              } else {
                let { data } = await createMineProductionBaseInfo(
                  DATA.formData
                );
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '矿山生产基本信息保存成功',
                    type: 'success',
                  });
                  DATA.formData = data.data;
                  DATA.disable = !DATA.disable;
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
      handleChangeRadio: ({ data, item }: any) => {
        if (item.prop === 'isBlastingCompany') {
          emit('handleChangeRadio', { data, item });
        }
      },
    });
    watch(
      () => props.formData,
      () => {
        DATA.formData = props.formData;
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
    onMounted(() => {
      METHODS.handleGetOperationStatus();
      METHODS.handleGetStandardizedLevel();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formRef,
    };
  },
});
</script>
<style scoped lang="scss">
</style>