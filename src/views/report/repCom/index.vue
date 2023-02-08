<template>
  <el-row class="p-20 container">
    <el-col
      :span="24"
      class="mb-20"
    >
      <EleCascader @handleChange="handleChange" />
    </el-col>
    <!-- 左侧 -->
    <el-col
      :span="
        20"
      class="pr-20"
    >
      <big-container
        title="安全人员组成情况"
        class="mb-20"
      >
        <template #body>
          <div v-if="isCompanyId">
            <init-echarts
              v-if="securityPersonnelData.length >0"
              id="securityPersonnel"
              :options="securityPersonnelOptions"
              :innerWidth="0.7"
            ></init-echarts>
            <el-empty
              v-else
              description="该企业暂无此数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>
          <el-empty
            v-else
            :image="require('@/assets/image/u0.svg')"
            description="请选择企业"
          ></el-empty>
        </template>
      </big-container>

      <big-container title="系统录入岗位组成情况">
        <template #body>
          <div v-if="isCompanyId">
            <init-echarts
              v-if="systemInputData.length >0"
              id="systemInput"
              :options="systemInputOptions"
              :innerWidth="0.7"
            ></init-echarts>

            <el-empty
              v-else
              description="该企业暂无此数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>
          <el-empty
            v-else
            :image="require('@/assets/image/u0.svg')"
            description="请选择企业"
          ></el-empty>
        </template>
      </big-container>
    </el-col>
    <el-col :span="4">
      <!-- 企业标签云 -->
      <big-container title="企业标签云">
        <template #body>
          <CloudLabel :labelList="labelList" />
        </template>
      </big-container>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import BigContainer from '@/views/ent/companyDetails/component/bigContainer.vue';
import InitEcharts from '@/components/initEcharts/index.vue';
import EleCascader from '@/components/eleCascader/index.vue';
import CloudLabel from '@/components/cloudLabel/index.vue';
import {
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import {
  securityPersonnelConstitute,
  systemEntryConstitute,
} from '@/api/report/repCom';
import { getLabel } from '@/api/company';

export default defineComponent({
  components: { BigContainer, InitEcharts, EleCascader, CloudLabel },
  setup(props) {
    let securityPersonnelData: any = ref([]);
    let systemInputData: any = ref([]);
    let DATA: any = reactive({
      companyId: null,
      isCompanyId: false,
      labelList: [],
      options: [],
      // props: { expandTrigger: 'hover' },
      /** 安全人员 */
      securityPersonnelOptions: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          top: '2.5%',
        },
        series: [
          {
            name: '人员组成情况',
            type: 'pie',
            radius: '50%',
            selectedMode: 'single',
            data: securityPersonnelData.value,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
      /** 系统录入 */
      systemInputOptions: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          top: '2.5%',
        },
        series: [
          {
            name: '岗位组成情况',
            type: 'pie',
            radius: '50%',
            selectedMode: 'single',
            data: systemInputData.value,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
    });
    let METHODS = reactive({
      // 字典
      handleDist: async (key: string) => {
        if (sessionRead(key)) {
          return sessionRead(key);
        } else {
          let { data } = await getByKey({ key });
          if (data.code === RES_SUCCESS) {
            sessionWrite(key, data.data);
            return data.data;
          }
        }
      },
      handleChange: async (value: any) => {
        if (value !== null) {
          DATA.companyId = value[1];
          METHODS.handleGetSecurityPersonnel(DATA.companyId);
          METHODS.handlesystemInput(DATA.companyId);
          DATA.isCompanyId = true;
          METHODS.handlegetLabel();
        } else {
          DATA.companyId = null;
          DATA.isCompanyId = false;
          DATA.labelList = [];
        }
      },
      // 获取安全人员组成数据
      handleGetSecurityPersonnel: async (companyId: number) => {
        let { data } = await securityPersonnelConstitute({ companyId });
        securityPersonnelData.value = [];
        if (data.code === RES_SUCCESS && data.data !== null) {
          let securityPersonnel = [
            {
              value: data.data.employeeSum,
              name: '从业人员',
            },
            { value: data.data.safeManagerSum, name: '专职安全管理人数' },
            { value: data.data.safeEngineerSum, name: '注册安全工程师人数' },
            {
              value: data.data.specialOperationSum,
              name: '特种部队作业人数',
            },
            {
              value: data.data.outsourceSum,
              name: '外包队伍人数',
            },
            { value: data.data.numberOfUploader, name: '证照上传人数' },
          ];
          securityPersonnel.forEach((item) => {
            if (item.value !== 0) {
              securityPersonnelData.value.push(item);
            }
          });
          securityPersonnelData.value.length > 0 &&
            (securityPersonnelData.value[0].selected = true);
        }
        DATA.securityPersonnelOptions.series[0].data =
          securityPersonnelData.value;
      },
      // 获取系统录入数据
      handlesystemInput: async (companyId: number) => {
        let { data } = await systemEntryConstitute({ companyId });
        systemInputData.value = [];
        if (data.code === RES_SUCCESS && data.data !== null) {
          let staffJob: Array<any> = [
            {
              value: data.data.electrician,
              name: '电工',
            },
            {
              value: data.data.drainer,
              name: '排水工',
            },
            {
              value: data.data.ventilator,
              name: '通风工',
            },
            {
              value: data.data.supportWorker,
              name: '提升支柱工',
            },
            {
              value: data.data.securityManagement,
              name: '专职安全管理人员',
            },
            {
              value: data.data.safetyEngineer,
              name: '注册安全工程师',
            },
            {
              value: data.data.ordinaryStaff,
              name: '普通员工',
            },
            {
              value: data.data.safetyManagementPersonnel,
              name: '安全管理人员',
            },
            {
              value: data.data.safetyInspector,
              name: '安全检查工',
            },
            {
              value: data.data.principalResponsible,
              name: '主要负责人',
            },
          ];
          staffJob.forEach((item) => {
            if (item.value !== 0) {
              systemInputData.value.push(item);
            }
          });
          systemInputData.value.length > 0 &&
            (systemInputData.value[0].selected = true);
        }
        DATA.systemInputOptions.series[0].data = systemInputData.value;
      },
      // 获取标签云
      handlegetLabel: async () => {
        let { data } = await getLabel({
          companyId: DATA.companyId,
        });
        if (data.code === RES_SUCCESS) {
          DATA.labelList = data.data;
        }
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      systemInputData,
      securityPersonnelData,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
</style>