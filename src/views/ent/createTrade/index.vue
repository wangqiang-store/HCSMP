<template>
  <el-row class="container">
    <!-- 滚动条 -->
    <el-col :span="4">
      <!-- <ScrollNavigation :navList="navList" :anchorClass="'.navigationCard'" /> -->
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
    <el-col :span="20" v-loading="loading">
      <!-- 营业执照信息 -->
      <el-card class="mb-20 navigationCard" v-show="active === 0">
        <CompanyInfo
          ref="companyInfoRef"
          :formData="companyInfo"
          :isDisable="isAuthorize"
        >
        </CompanyInfo>
      </el-card>
      <!-- 企业/工厂中心地理坐标 -->
      <el-card class="mb-20 navigationCard" v-show="active === 1">
        <Coordinate
          ref="coordinateRef"
          :formData="coordinates"
          :isDisable="isAuthorize"
        />
      </el-card>
      <!-- 营业许可证 -->
      <el-card class="mb-20 navigationCard" v-show="active === 2">
        <OperatingLicense
          ref="operatingLicenseRef"
          :formData="managementInfo"
          :isDisable="isAuthorize"
        />
      </el-card>
      <!-- 企业其他台账信息 -->
      <el-card class="mb-20 navigationCard" v-show="active === 3">
        <OtherParameter
          ref="otherParameterRef"
          :formData="ledgerInfoList"
          :isDisable="isAuthorize"
        />
      </el-card>
      <el-card class="mb-20 navigationCard" v-show="active === 4">
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
import { defineComponent, onMounted, reactive, ref, watch, toRefs } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import CompanyInfo from "./components/companyinfo.vue";
import Coordinate from "@/components/coordinate/index.vue";
import ScrollNavigation from "@/components/scrollNavigation/index.vue";
import OperatingLicense from "./components/operatingLicense.vue";
import OtherParameter from "./components/otherParameter.vue";
import Emergency from "./components/emergency.vue";
import { useStore } from "vuex";
import { getByTradeDetails } from "@/api/ent/trade";
import { RES_SUCCESS } from "@/api/common/common";
import { ElMessage, ElMessageBox } from "element-plus";
import { getDataIntegrity } from "@/api/company";
export default defineComponent({
  components: {
    CompanyInfo,
    Coordinate,
    ScrollNavigation,
    OperatingLicense,
    OtherParameter,
    Emergency,
  },
  props: {
    companyData: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    // let reload: any = inject('reload');
    let companyInfoRef: any = ref(null);
    let coordinateRef: any = ref(null);
    let operatingLicenseRef: any = ref(null);
    let emergencyRef: any = ref(null);
    let collection: any = ref(STORE.state.globalData.collection);
    let DATA: any = reactive({
      loading: false,
      // 企业营业执照基础信息
      companyInfo: {},
      // 经营许可证信息
      managementInfo: {},
      // 企业其他台账信息
      ledgerInfoList: {},
      // 应急演练
      emergencyInfo: {},
      //地理坐标
      coordinates: {
        latitude: null,
        longitude: null,
      },
      isAuthorize: true,
      //滚动列表
      navList: [
        {
          title: "营业执照信息",
        },
        {
          title: "企业/工厂中心地理坐标",
        },
        {
          title: "经营许可证",
        },
        {
          title: "企业其他台账信息",
        },
        {
          title: "应急演练",
        },
      ],
      active: 0,
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
              !operatingLicenseRef.value.disable
                ? prompt()
                : (DATA.active = index);
              break;
            case 3:
              DATA.active = index;
            case 4:
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
            type: "warning",
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
          let { data } = await getByTradeDetails({
            companyId: STORE.state.globalData.companyInfo.companyId,
          });
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            // 获取企业营业基本信息
            DATA.companyInfo = data.data.companyInfo;
            // 获取经营许可证信息
            DATA.managementInfo = {
              ...data.data.managementInfo,
              companyInfoId: data.data.companyInfo.id,
            } || { companyInfoId: data.data.companyInfo.id };
            //地理坐标
            DATA.coordinates = {
              id: data.data.companyInfo.id,
              latitude: data.data.companyInfo.latitude,
              longitude: data.data.companyInfo.longitude,
            };
            //企业其他台账
            DATA.ledgerInfoList = {
              ledgerInfoList: data.data.ledgerInfoList,
              companyInfoId: data.data.companyInfo.id,
            } || { companyInfoId: data.data.companyInfo.id };
            // 应急演练
            DATA.emergencyInfo = {
              emergencyDrillList: data.data.emergencyDrillList || [],
              companyInfoId: data.data.companyInfo.id,
            };
          }
        } else {
          DATA.loading = false;
          // 企业营业执照基础信息
          DATA.companyInfo = {
            companyType: null,
            isEnable: true,
            economicType: null,
            type: 4,
            businessLicenseList: [],
          };
          // 获取经营许可证信息
          DATA.managementInfo = {};
          //地理坐标
          DATA.coordinates = {
            latitude: null,
            longitude: null,
          };
          DATA.ledgerInfoList = [];
          // 应急演练
          DATA.emergencyInfo = {
            emergencyDrillList: [],
          };
        }
      },
      // 资料完整度
      dataIntegrity: async () => {
        if (STORE.state.globalData.companyInfo.companyId) {
          let { data } = await getDataIntegrity({
            companyId: STORE.state.globalData.companyInfo.companyId,
          });
        }
      },
    });
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
          if (!operatingLicenseRef.value.disable) {
            prompt();
          } else {
            METHODS.dataIntegrity();
            isToSignIn();
            next();
          }
          break;
        case 3:
          METHODS.dataIntegrity();
          isToSignIn();
          next();
        case 4:
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
          type: "warning",
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
            type: "success",
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
    watch(
      () => STORE.state.globalData.collection,
      (newVal) => {
        // console.log(222, newVal);
        let list: any = document.querySelector(".box .list");
        list.style.left = newVal ? "105px" : "220px";
      },
      {
        // immediate: true,
      }
    );
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      companyInfoRef,
      coordinateRef,
      operatingLicenseRef,
      emergencyRef,
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
a {
  display: inline-block;
}
.container {
  background-color: #eaeaea;
  padding: 10px 20px 20px 20px;
  height: 100%;
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
    padding: 5px 10px;
    position: fixed;
    top: 130px;
    // left: 220px;
    // position: fixed;
    // top: 130px;
    // left: 220px;
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