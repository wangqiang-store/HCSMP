<template>
  <el-row class="container">
    <el-col :span="4">
      <!-- <ScrollNavigation
        :navList="navList"
        :anchorClass="'.navigationCard'"
      /> -->
      <div class="box">
        <ul class="list">
          <li
            v-for="(item, index) in navList"
            :key="index"
            @click="showView(index)"
            :class="{ active: active === index }"
            class="text-ellipsis list_item"
            :title="item.title"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>
    </el-col>
    <el-col
      :span="20"
      v-loading="loading"
    >
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 0"
      >
        <CompanyInfo
          ref="companyInfoRef"
          :formData="companyInfo"
          :isDisable="isAuthorize"
          @handleChangeCompanyType="handleChangeCompanyType"
        >
        </CompanyInfo>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 1"
      >
        <Coordinate
          ref="coordinateRef"
          :formData="coordinates"
          :isDisable="isAuthorize"
        />
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 2"
      >
        <MiningInfo
          ref="miningInfoRef"
          :formData="miningInfo"
          :isDisable="isAuthorize"
        >
        </MiningInfo>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 3"
      >
        <SafetyProduction
          ref="safetyProductionRef"
          :formData="safetyProductionInfo"
          :isDisable="isAuthorize"
        >
        </SafetyProduction>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 4"
      >
        <ThreeMeanwhile
          ref="threeMeanwhileRef"
          :formData="threeMeanwhileInfo"
          :isDisable="isAuthorize"
        >
        </ThreeMeanwhile>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 5"
      >
        <MineProduction
          ref="mineProductionBaseRef"
          :formData="mineProductionBaseInfo"
          :isDisable="isAuthorize"
          @handleChangeRadio="handleChangeRadio"
        >
        </MineProduction>
      </el-card>
      <el-card
        class="mb-20"
        v-show="isBlastingCompany &&  active === 5"
      >
        <BlastCompany
          ref="blastCompanyRef"
          :formData="blastCompanyInfo"
          :isDisable="isAuthorize"
        >
        </BlastCompany>
      </el-card>

      <el-card
        class="mb-20 navigationCard"
        v-show="active === 6"
      >
        <MineProductionServe
          ref="mineProductionServeRef"
          :formData="mineProductionServeInfo"
          :isDisable="isAuthorize"
        >
        </MineProductionServe>
      </el-card>
      <!-- <el-card class="mb-20 navigationCard">
        <Receipt
          ref="receiptRef"
          :formData="receiptInfo"
          :isDisable="isAuthorize"
        >
        </Receipt>
      </el-card> -->
      <!-- <el-card class="mb-20 navigationCard">
        <OccupationalInfo
          ref="occupationalInfoRef"
          :formData="occupationalInfo"
          :isDisable="isAuthorize"
        >
        </OccupationalInfo>
      </el-card> -->
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 7"
      >
        <MineProductionInfo
          ref="mineProductionInfoRef"
          :formData="mineProductionInfo"
          :isDisable="isAuthorize"
          :type="companyType || companyInfo.type"
        >
        </MineProductionInfo>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 8"
      >
        <Panorama
          ref="panoramaRef"
          :formData="panoramaInfo"
          :isDisable="isAuthorize"
        >
        </Panorama>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 9"
      >
        <MineDumpInfo
          ref="mineDumpInfoRef"
          :formData="mineDumpInfo"
          :isDisable="isAuthorize"
        >
        </MineDumpInfo>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 10"
      >
        <SecurityPersonnel
          ref="securityPersonnelRef"
          :formData="securityPersonnelInfo"
          :isDisable="isAuthorize"
        >
        </SecurityPersonnel>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 11"
      >
        <ParameterInfo
          ref="parameterInfoRef"
          :formData="parameterInfo"
          :isDisable="isAuthorize"
        >
        </ParameterInfo>
      </el-card>
      <el-card
        class="mb-20 navigationCard"
        v-show="active === 12"
      >
        <Emergency
          ref="emergencyRef"
          :formData="emergencyInfo"
          :isDisable="isAuthorize"
        >
        </Emergency>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  inject,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from "vue";
import CompanyInfo from "@/components/companyInfo/index.vue";
import Coordinate from "@/components/coordinate/index.vue";
import MiningInfo from "./components/miningInfo/index.vue";
import SafetyProduction from "./components/safetyProduction/index.vue";
import ThreeMeanwhile from "./components/threeMeanwhile/index.vue";
import MineProduction from "./components/mineProduction/index.vue";
import ScrollNavigation from "@/components/scrollNavigation/index.vue";
import BlastCompany from "./components/blastCompany/index.vue";
import MineProductionServe from "./components/mineProductionServe/index.vue";
import Receipt from "./components/receipt/index.vue";
import OccupationalInfo from "./components/occupationalInfo/index.vue";
import MineProductionInfo from "./components/mineProductionInfo/index.vue";
import Panorama from "./components/panorama/index.vue";
import MineDumpInfo from "./components/mineDumpInfo/index.vue";
import SecurityPersonnel from "./components/securityPersonnel/index.vue";
import ParameterInfo from "./components/parameterInfo/index.vue";
import Emergency from "./components/emergency/index.vue";
import { useStore } from "vuex";
import { companyDetails, getDataIntegrity } from "@/api/company";
import { RES_SUCCESS } from "@/api/common/common";
import { ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from "vue-router";
export default defineComponent({
  components: {
    CompanyInfo,
    Coordinate,
    ScrollNavigation,
    MiningInfo,
    SafetyProduction,
    ThreeMeanwhile,
    MineProduction,
    BlastCompany,
    MineProductionServe,
    Receipt,
    OccupationalInfo,
    MineProductionInfo,
    Panorama,
    MineDumpInfo,
    SecurityPersonnel,
    ParameterInfo,
    Emergency
  },
  props: {
    companyData: {
      type: Object,
      default: {}
    }
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    // let reload: any = inject('reload');
    let companyInfoRef: any = ref(null);
    let coordinateRef: any = ref(null);
    let miningInfoRef: any = ref(null);
    let safetyProductionRef: any = ref(null);
    let threeMeanwhileRef: any = ref(null);
    let mineProductionBaseRef: any = ref(null);
    let blastCompanyRef: any = ref(null);
    let mineProductionServeRef: any = ref(null);
    let receiptRef: any = ref(null);
    let occupationalInfoRef: any = ref(null);
    let mineProductionInfoRef: any = ref(null);
    let panoramaRef: any = ref(null);
    let mineDumpInfoRef: any = ref(null);
    let securityPersonnelRef: any = ref(null);
    let parameterInfoRef: any = ref(null);
    let emergencyRef: any = ref(null);
    let DATA: any = reactive({
      loading: false,
      // 采矿许可证信息
      miningInfo: {},
      // 安全生产信息
      safetyProductionInfo: {},
      // 三同时信息
      threeMeanwhileInfo: [],
      // 矿山生产基本信息
      mineProductionBaseInfo: {},
      // 爆破公司信息
      blastCompanyInfo: {},
      // 企业营业执照基础信息
      companyInfo: {},
      // 矿山生产相关服务信息
      mineProductionServeInfo: {},
      // 作业场所职业病危害申报回执
      receiptInfo: {},
      // 职业卫生信息
      occupationalInfo: {},
      // 矿山生产信息
      mineProductionInfo: {},
      // 企业全景图
      panoramaInfo: {},
      // 矿山排土场信息
      mineDumpInfo: {},
      // 安全人员信息
      securityPersonnelInfo: {},
      // 企业其他台账信息
      parameterInfo: {},
      // 应急演练
      emergencyInfo: {},
      //地理坐标
      coordinates: {
        latitude: null,
        longitude: null
      },
      isAuthorize: true,
      navList: [
        {
          title: "营业执照信息"
        },
        {
          title: "企业/工厂中心地理坐标"
        },
        {
          title: "采矿许可证信息"
        },
        {
          title: "安全生产许可证信息"
        },
        {
          title: "三同时及安全评价信息"
        },
        {
          title: "矿山生产基本信息"
        },
        {
          title: "矿山生产相关服务信息"
        },
        // {
        //   title: '作业场所职业病危害申报回执',
        // },
        // {
        //   title: '职业卫生信息',
        // },
        {
          title: "矿山生产信息"
        },
        {
          title: "企业全景图"
        },
        {
          title: "矿山排土场信息"
        },
        {
          title: "安全人员信息"
        },
        {
          title: "企业其他台账信息"
        },
        {
          title: "应急演练"
        }
      ],
      // 是否存在爆破公司
      isBlastingCompany: false,
      // 企业类型
      companyType: null,
      active: 0
    });
    let METHODS: any = reactive({
      // 显示对应模块
      showView: (index: number) => {
        if (DATA.active != index) {
          switch (DATA.active) {
            case 0:
              !companyInfoRef.value.disable ? prompt() : (DATA.active = index);
              break;
            case 1:
              !coordinateRef.value.disable ? prompt() : (DATA.active = index);
              break;
            case 2:
              !miningInfoRef.value.disable ? prompt() : (DATA.active = index);
              break;
            case 3:
              !safetyProductionRef.value.disable
                ? prompt()
                : (DATA.active = index);
              break;
            case 4:
              DATA.active = index;
              break;
            case 5:
              !mineProductionBaseRef.value.disable
                ? prompt()
                : DATA.isBlastingCompany
                ? !blastCompanyRef.value.disable
                  ? prompt()
                  : (DATA.active = index)
                : (DATA.active = index);
              break;
            case 6:
              DATA.active = index;
              break;
            case 7:
              !mineProductionInfoRef.value.disable
                ? prompt()
                : (DATA.active = index);
              break;
            case 8:
              !panoramaRef.value.disable ? prompt() : (DATA.active = index);
              break;
            case 9:
              DATA.active = index;
              break;
            case 10:
              !securityPersonnelRef.value.disable
                ? prompt()
                : (DATA.active = index);
              break;
            case 11:
              DATA.active = index;
              break;
            case 12:
              DATA.active = index;
              break;
            default:
              break;
          }
        }
        function prompt() {
          ElMessageBox.confirm("数据还未保存,请确认?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {})
            .catch(() => {
              DATA.active = index;
            });
        }
      },
      // 政府人员 获取企业数据
      handleGetCompanyDetails: async () => {
        DATA.loading = true;
        if (STORE.state.globalData.companyInfo.companyId) {
          let { data } = await companyDetails({
            companyId: STORE.state.globalData.companyInfo.companyId
          });
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            // 获取企业营业基本信息
            DATA.companyInfo = data.data.companyInfo;
            //地理坐标
            DATA.coordinates = {
              id: data.data.companyInfo.id,
              latitude: data.data.companyInfo.latitude,
              longitude: data.data.companyInfo.longitude
            };
            // 采矿许可证
            DATA.miningInfo = {
              ...data.data.miningInfo,
              companyInfoId: data.data.companyInfo.id
            } || { companyInfoId: data.data.companyInfo.id };
            // 安全生产许可证信息
            DATA.safetyProductionInfo = {
              ...data.data.safetyProductionInfo,
              companyInfoId: data.data.companyInfo.id
            } || { companyInfoId: data.data.companyInfo.id };
            // 三同时信息
            DATA.threeMeanwhileInfo = {
              threesimultaneous: data.data.threesimultaneous,
              companyInfoId: data.data.companyInfo.id
            } || {
              threesimultaneous: [],
              companyInfoId: data.data.companyInfo.id
            };
            // 矿山生产基本信息
            DATA.mineProductionBaseInfo = data.data.mineProductionBaseInfo || {
              companyInfoId: data.data.companyInfo.id
            };
            data.data.mineProductionBaseInfo?.isBlastingCompany
              ? (DATA.isBlastingCompany = true)
              : (DATA.isBlastingCompany = false);
            // 爆破公司信息
            DATA.blastCompanyInfo = data.data.blastCompany || {
              companyInfoId: data.data.companyInfo.id
            };
            // 矿山生产相关服务信息
            DATA.mineProductionServeInfo = {
              companyInfoId: data.data.companyInfo.id,
              mineProductionBaseInfoId:
                data.data.mineProductionBaseInfo === null
                  ? null
                  : data.data.mineProductionBaseInfo.id,
              emergencyPlan: data.data.emergencyPlan || [],
              outsourcingSecurity: data.data.outsourcingSecurity || [],
              rescueAgreement: data.data.rescueAgreement || [],
              securityInsurance: data.data.securityInsurance || [],
              annualTechnicalService: data.data.annualTechnicalService || []
            };
            // 作业场所职业病危害申报回执
            DATA.receiptInfo = {
              companyInfoId: data.data.companyInfo.id,
              occupationalDiseaseReceipt:
                data.data.occupationalDiseaseReceipt || []
            };
            // 职业卫生信息
            DATA.occupationalInfo = {
              companyInfoId: data.data.companyInfo.id,
              unitHealthTest: data.data.unitHealthTest || [],
              occupationalHealthTest: data.data.occupationalHealthTest || []
            };
            // 矿山生产信息
            DATA.mineProductionInfo = (data.data.companyInfo.type === 1
              ? {
                  ...data.data.mineProductionInfo,
                  type: data.data.companyInfo.type,
                  companyInfoId: data.data.companyInfo.id
                }
              : {
                  ...data.data.mineOpenAirProductionInfo,
                  type: data.data.companyInfo.type,
                  companyInfoId: data.data.companyInfo.id
                }) || {
              companyInfoId: data.data.companyInfo.id,
              type: data.data.companyInfo.type
            };
            // 企业全景图
            DATA.panoramaInfo = data.data.companyPanorama || {
              companyInfoId: data.data.companyInfo.id
            };
            // 矿山排土场信息
            DATA.mineDumpInfo = {
              mineDumpingInfo: data.data.mineDumpingInfo || [],
              companyInfoId: data.data.companyInfo.id
            };
            // 安全人员信息
            DATA.securityPersonnelInfo = data.data.safeStaffInfo || {
              companyInfoId: data.data.companyInfo.id
            };
            // 企业其他台账信息
            DATA.parameterInfo = {
              ledgerInfoList: data.data.ledgerInfoList || [],
              companyInfoId: data.data.companyInfo.id
            };
            // 应急演练
            DATA.emergencyInfo = {
              emergencyDrillList: data.data.emergencyDrillList || [],
              companyInfoId: data.data.companyInfo.id
            };
          }
        } else {
          DATA.loading = false;
          // 企业营业执照基础信息
          DATA.companyInfo = {
            address: "",
            businessScope: "",
            economicType: null,
            email: "",
            fax: "",
            legalPerson: "",
            legalPhone: "",
            name: "",
            phone: "",
            postalCode: "",
            registerCapital: "",
            shortName: "",
            isAuthorize: false,
            riskLevel: 5,
            isEnable: true,
            provinceCode: null,
            cityCode: null,
            countyCode: null,
            townCode: null,
            type: 1,
            businessLicenseList: []
          };
          //地理坐标
          DATA.coordinates = {
            latitude: null,
            longitude: null
          };
          // 采矿许可证信息
          DATA.miningInfo = {};
          // 安全生产信息
          DATA.safetyProductionInfo = {};
          // 三同时信息
          DATA.threeMeanwhileInfo = [];
          // 矿山生产基本信息
          DATA.mineProductionBaseInfo = {};
          // 爆破公司信息
          DATA.blastCompanyInfo = {};
          // 矿山生产相关服务信息
          DATA.mineProductionServeInfo = {
            emergencyPlan: [],
            outsourcingSecurity: [],
            rescueAgreement: [],
            securityInsurance: [],
            annualTechnicalService: []
          };
          // 作业场所职业病危害申报回执
          DATA.receiptInfo = {
            occupationalDiseaseReceipt: []
          };
          // 职业卫生信息
          DATA.occupationalInfo = {
            unitHealthTest: [],
            occupationalHealthTest: []
          };
          // 矿山生产信息
          DATA.mineProductionInfo = {
            miningMethod: "",
            openWay: "",
            transportMethod: "",
            rockDrilling: "",
            blasthole: "",
            goafTreatmentMethod: "",
            safeHaven: "",
            type: 1
          };
          // 企业全景图
          DATA.panoramaInfo = {};
          // 矿山排土场信息
          DATA.mineDumpInfo = {
            mineDumpingInfo: []
          };
          // 安全人员信息
          DATA.securityPersonnelInfo = {};
          // 企业其他台账信息
          DATA.parameterInfo = {
            ledgerInfoList: []
          };
          // 应急演练
          DATA.emergencyInfo = {
            emergencyDrillList: []
          };
        }
      },
      handleChangeRadio: ({ data, item }: any) => {
        if (item.prop === "isBlastingCompany") {
          DATA.isBlastingCompany = data;
        }
      },
      handleChangeCompanyType: ({ formdata, item }: any) => {
        if (item.prop === "type") {
          DATA.companyType = formdata[item.prop];
        }
      },
      // 资料完整度
      dataIntegrity: async () => {
        if (
          STORE.state.globalData.companyInfo.companyId &&
          !STORE.state.globalData.isSignOut
        ) {
          let { data } = await getDataIntegrity({
            companyId: STORE.state.globalData.companyInfo.companyId
          });
        }
      }
    });
    watch(
      () => STORE.state.globalData.companyInfo.companyId,
      async () => {
        await METHODS.handleGetCompanyDetails();
        if (STORE.state.user.personnel.unitType === 1) {
          DATA.isAuthorize = true;
        } else {
          DATA.isAuthorize = DATA.companyInfo
            ? DATA.companyInfo.isAuthorize
            : false;
        }
      }
    );

    watch(
      () => STORE.state.globalData.collection,
      (newVal) => {
        let list: any = document.querySelector(".box .list");
        list.style.left = newVal ? "105px" : "220px";
      },
      {
        // immediate: true,
      }
    );
    onBeforeRouteLeave((to, form, next) => {
      switch (DATA.active) {
        case 0:
          if (!companyInfoRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 1:
          if (!coordinateRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 2:
          if (!miningInfoRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 3:
          if (!safetyProductionRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 4:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
          break;
        case 5:
          if (!mineProductionBaseRef.value.disable) {
            prompt();
          } else if (DATA.isBlastingCompany) {
            if (!blastCompanyRef.value.disable) {
              prompt();
            } else {
              METHODS.dataIntegrity();
              isToSignIn();
              next();
            }
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 6:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
          break;
        case 7:
          if (!mineProductionInfoRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 8:
          if (!panoramaRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 9:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
          break;
        case 10:
          if (!securityPersonnelRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 11:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
          break;
        case 12:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
          break;
        default:
          break;
      }
      function prompt() {
        ElMessageBox.confirm("数据还未保存,请确认?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "不保存",
          closeOnClickModal: false,
          showClose: false,
          type: "warning"
        })
          .then(() => {
            next(false);
          })
          .catch(async () => {
            await METHODS.dataIntegrity();
            isToSignIn();
            next();
          });
      }

      // 判断是否退出登录
      function isToSignIn() {
        if (to.path === "/login") {
          STORE.dispatch("FedLogOut");
          ElMessage({
            message: "退出成功",
            type: "success"
          });
        }
      }
    });

    onMounted(async () => {
      let newVal = STORE.state.globalData.collection;
      let list: any = document.querySelector(".box .list");
      list.style.left = newVal ? "105px" : "220px";

      await METHODS.handleGetCompanyDetails();
      if (STORE.state.user.personnel.unitType === 1) {
        DATA.isAuthorize = true;
      } else {
        DATA.isAuthorize = DATA.companyInfo
          ? DATA.companyInfo.isAuthorize
          : false;
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      companyInfoRef,
      coordinateRef,
      miningInfoRef,
      safetyProductionRef,
      threeMeanwhileRef,
      mineProductionBaseRef,
      blastCompanyRef,
      mineProductionServeRef,
      receiptRef,
      occupationalInfoRef,
      mineProductionInfoRef,
      panoramaRef,
      mineDumpInfoRef,
      securityPersonnelRef,
      parameterInfoRef,
      emergencyRef
    };
  }
});
</script>
<style scoped lang="scss">
a {
  display: inline-block;
}
/deep/.ccom {
  height: calc(100% - 50px) !important;
}
.container {
  background-color: #eaeaea;
  padding: 10px 20px 20px 20px;
  height: 100% !important;
}
.box {
  width: 100%;
  z-index: 9999;
  .list {
    transition: all 0.3s linear;
    background: #fff;
    border: 1px solid #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    // width: 250px;
    width: 12%;
    max-height: 70%;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0;
    }
    padding: 5px 10px;
    position: fixed;
    top: 130px;
    // left: 230px;
    font-size: 14px;
    li {
      padding: 8px 0;
      cursor: pointer;
      &:hover {
        color: #f5be1f;
      }
    }
    .active {
      color: #f5be1f;
    }
  }
}
</style>