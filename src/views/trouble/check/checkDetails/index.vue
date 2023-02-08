<template>
  <!-- 只是查看隐患排查信息 -->
  <el-row v-loading="loading" class="container">
    <el-col
      :span="24"
      style="padding:0 20px"
    >
      <ele-descriptions
        :column="4"
        :border="true"
        :title="'隐患详细信息'"
        :renderDescriptionsArr="renderDescriptionsArr"
        :listData="formData"
      >
      </ele-descriptions>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
} from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import EleDescriptions from '@/components/eleDescriptions/index.vue';
import { formatDate } from '@/utils/filtration';
export default defineComponent({
  components: { EleDescriptions },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    let formRef: any = ref(null);
    let DATA: any = reactive({
      loading: false,
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      formData: {},
      renderDescriptionsArr: [
        {
          label: '检查企业名称 ：',
          span: 4,
          prop: 'companyName',
        },
        {
          label: '发现隐患及问题 :',
          span: 4,
          prop: 'problem',
        },
        {
          label: '处置措施 :',
          span: 4,
          prop: 'treatmentMeasures',
        },
        {
          label: '具体处置措施:',
          span: 4,
          prop: 'specificTreatment',
        },
        {
          label: '备注 :',
          span: 4,
          prop: 'remark',
        },
        {
          label: '发现隐患数 :',
          span: 2,
          prop: 'hiddenDangerExists',
        },
        {
          label: '已整改隐患数 :',
          span: 2,
          prop: 'hiddenDangerElimination',
        },
        {
          label: '检查人员 :',
          span: 2,
          prop: 'personnelNames',
        },
        {
          label: '创建时间 :',
          span: 2,
          prop: 'createTime',
        },
      ],
      measuresOption: [],
    });
    let METHODS = reactive({
      //获取数据
      handleGetDate: async () => {
        DATA.loading = true;
        DATA.formData = Object.assign({}, STORE.state.globalData.checkInfo);
        DATA.formData.createTime = formatDate(DATA.formData.createTime);
        DATA.loading = false;
      },
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);

      //获取数据
      METHODS.handleGetDate();
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
.container{
  height: calc(100% - 40px) !important;
}
/deep/ table td.is-bordered-label.is-left {
  width: 16%;
  text-align: right;
  background: none;
  font-weight: 700;
  color: black;
}
/deep/ table td.el-descriptions__content.is-left {
  text-align: left;
  color: #333333;
  word-break: break-all;
}
/deep/ tr {
  td {
    &:nth-child(4) {
      width: 34% !important;
    }
  }
}
</style>