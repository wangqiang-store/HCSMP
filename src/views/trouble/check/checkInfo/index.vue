<template>
  <!-- 添加/编辑的隐患排查信息 -->
  <el-row class="container">
    <el-col :span="24" style="padding:0 20px">
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :options="options"
        :rules="rules"
        :styles="styles"
        :radios="radios"
        ref="formRef"
      >
      </ele-form>
    </el-col>
    <el-col :span="24" class="mb-20">
      <div class="w-100 tac">
        <el-button class="mr-10" @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
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
} from "vue";
import EleForm from "@/components/eleForm/index.vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { getByKey, IMG_URL, RES_SUCCESS } from "@/api/common/common";
import { ElMessage } from "element-plus";
import { filterTime } from "@/utils/filtration";
import { createDangerCheckInfo, updateDangerCheckInfo } from "@/api/trouble";
import { getCompanyByMyself } from "@/api/company";
export default defineComponent({
  components: { EleForm },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    let formRef: any = ref(null);
    let validateexist = (rule: any, value: string, callback: any) => {
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          callback();
        } else {
          callback(new Error("数据格式为0或正整数")); //自定义规则的错误提示
        }
      } else {
        callback();
      }
    };
    let validateElimination = (rule: any, value: string, callback: any) => {
      let hiddenDangerExists = Number(DATA.formData.hiddenDangerExists);
      let isRectification = DATA.formData.isRectification;
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          let val = Number(value);
          if (isRectification == true) {
            if (hiddenDangerExists == val) {
              callback();
            } else {
              callback(
                new Error("已完成整改情况下，已消除隐患数需等于存在隐患数")
              );
            }
          } else if (isRectification == false) {
            if (hiddenDangerExists < val || hiddenDangerExists == val) {
              callback(
                new Error("未完成整改情况下，已消除隐患数需小于存在隐患数")
              );
            } else {
              callback();
            }
          }
          callback();
        } else {
          callback(new Error("数据格式为0或正整数")); //自定义规则的错误提示
        }
      } else {
        callback();
      }
    };
    let DATA: any = reactive({
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      formData: {},
      renderFormArr: [
        {
          label: "检查企业",
          type: "select",
          prop: "companyId",
          labelWidth: "150px",
          placeholder:"可输入搜索企业",
          filterable:true,
          style: {
            width: "45%",
          },
          value: "id",
          title: "name",
          disabled: STORE.state.user.personnel.companyId ? true : false,
        },
        {
          label: "执法人员",
          type: "select",
          labelWidth: "150px",
          style: {
            width: "45%",
          },
          prop: "personnel",
          value: "id",
          title: "name",
        },
        {
          label: "发现隐患数",
          type: "input",
          labelWidth: "150px",
          style: {
            width: "45%",
          },
          prop: "hiddenDangerExists",
        },
        {
          label: "已整改隐患数",
          type: "input",
          labelWidth: "150px",
          style: {
            width: "45%",
          },
          prop: "hiddenDangerElimination",
        },
        {
          label: "发现隐患及问题",
          type: "input",
          inputType: "textarea",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "problem",
        },
        {
          label: "处理措施",
          type: "select",
          prop: "treatmentMeasures",
          multiple: true,
          labelWidth: "150px",
          style: {
            width: "30%",
          },
          value: "value",
          title: "name",
        },
        {
          label: "是否整改",
          type: "radio",
          prop: "isRectification",
          labelWidth: "150px",
          style: {
            width: "45%",
          },
          value: "value",
          title: "title",
        },
        {
          label: "具体处理措施",
          type: "input",
          inputType: "textarea",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "specificTreatment",
        },

        {
          label: "备注",
          type: "input",
          inputType: "textarea",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "remark",
        },
      ],
      options: {
        treatmentMeasures: [],
        companyId: [],
        personnel: STORE.state.globalData.enablePersonnelList,
      },
      radios: {
        isRectification: [
          {
            value: true,
            title: "是",
          },
          {
            value: false,
            title: "否",
          },
        ],
      },
      rules: {
        companyId: [{ required: true, message: "此为必填项", trigger: "blur" }],
        personnel: [{ required: true, message: "此为必填项", trigger: "blur" }],
        hiddenDangerExists: [
          { required: true, message: "此为必填项", trigger: "blur" },
          { validator: validateexist, trigger: "blur" },
        ],
        hiddenDangerElimination: [
          { required: true, message: "此为必填项", trigger: "blur" },
          { validator: validateElimination },
        ],
        problem: [{ required: true, message: "此为必填项", trigger: "blur" }],
        treatmentMeasures: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        isRectification: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
        specificTreatment: [
          { required: true, message: "此为必填项", trigger: "blur" },
        ],
      },
      videoList: [],
      fileList: [],
      files: [],
    });
    let METHODS = reactive({
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.treatmentMeasures)) {
              DATA.formData.treatmentMeasures =
                DATA.formData.treatmentMeasures.join(",");
            }
            DATA.formData.hiddenDangerExists = Number(
              DATA.formData.hiddenDangerExists
            );
            DATA.formData.hiddenDangerElimination = Number(
              DATA.formData.hiddenDangerElimination
            );

            if (DATA.formData.id) {
              let { data } = await updateDangerCheckInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "编辑成功",
                  type: "success",
                });
                setTimeout(() => {
                  history.go(-1);
                }, 1500);
              }
            } else {
              let { data } = await createDangerCheckInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "添加成功",
                  type: "success",
                });
                setTimeout(() => {
                  history.go(-1);
                }, 1500);
              }
            }
          }
        });
      },
      handleBack: () => {
        history.go(-1);
      },

      // 获取 处理措施类型
      handleGetMeasures: async () => {
        let { data } = await getByKey({ key: "t_treatment_measures_type" });
        if (data.code === RES_SUCCESS) {
          DATA.options.treatmentMeasures = data.data;
        }
      },
    });
    onMounted(async () => {
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);
      // 获取 处理措施类型
      METHODS.handleGetMeasures();

      // 获取数据
      DATA.formData = Object.assign({}, STORE.state.globalData.checkInfo);

      if (DATA.formData.treatmentMeasures) {
        DATA.formData.treatmentMeasures = DATA.formData.treatmentMeasures
          .split(",")
          .map((item: any) => Number(item));
      }

      //企业下拉数据
      if (STORE.state.user.personnel.companyId) {
        // let { data } = await getCompanyByMyself({
        //   companyId: STORE.state.user.personnel.companyId,
        // });
        // if (data.code === RES_SUCCESS) {
        //   console.log("909090",data.data);
        //   DATA.options.companyId = [data.data]
        // }
        DATA.options.companyId = [
          {
            id: STORE.state.user.personnel.companyId,
            name: STORE.state.user.personnel.companyName,
          },
        ];
        DATA.formData.companyId = STORE.state.user.personnel.companyId;
      } else {
        DATA.options.companyId = STORE.state.globalData.companyList;
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      formRef,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  box-sizing: border-box !important;
  height: calc(100% - 40px) !important;
  width: 100% !important;
  overflow-x: hidden;
}
</style>