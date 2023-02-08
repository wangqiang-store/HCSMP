<template>
  <el-row>
    <el-col :span="24">
      <el-container class="outContainer">
        <el-header>
          <HeaderMenu />
        </el-header>
        <el-container class="insideContainer">
          <el-aside>
            <Menu />
          </el-aside>
          <el-main>
            <div class="com">
              <div
                class="crumbs"
                v-if="ROUTE.meta.title !== '首页'"
              >
                <el-breadcrumb
                  separator="/"
                  v-if="!routeWhiteList.includes(ROUTE.path)"
                >
                  <el-breadcrumb-item
                    to="/"
                    class="pointer"
                  >首页</el-breadcrumb-item>
                  <el-breadcrumb-item class="pointer">{{
                    ROUTE.meta.title
                  }}</el-breadcrumb-item>
                  <el-breadcrumb-item
                    class="pointer"
                    v-if="ROUTE.meta.twoTitle"
                  >{{ ROUTE.meta.twoTitle }}</el-breadcrumb-item>
                </el-breadcrumb>
                <!-- 单独页面面包屑 -->
                <el-breadcrumb
                  separator="/"
                  v-else
                >
                  <el-breadcrumb-item
                    v-if="ROUTE.meta.title !== '首页'"
                    to="/"
                    class="pointer"
                  >首页</el-breadcrumb-item>
                  <el-breadcrumb-item class="pointer">{{
                    STORE.state.globalData.title
                  }}</el-breadcrumb-item>
                  <el-breadcrumb-item
                    class="pointer"
                    @click="handleBack"
                  >{{
                    STORE.state.globalData.twoTitle
                  }}</el-breadcrumb-item>
                  <el-breadcrumb-item class="pointer">{{
                    ROUTE.meta.title
                  }}</el-breadcrumb-item>
                </el-breadcrumb>
              </div>
              <router-view class="ccom"></router-view>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Menu from "./menu/index.vue";
import HeaderMenu from "./menu/header.vue";
import { isUpdatePwd } from "@/api/system/sysUser";
import { useState } from "@/hooks/useMapper";
import { RES_SUCCESS } from "@/api/common/common";
import { getRoleModule } from "@/api/system/sysRole";
import { ElNotification } from "element-plus";

export default defineComponent({
  components: {
    Menu,
    HeaderMenu
  },
  setup() {
    let ROUTE = useRoute();
    let ROUTER = useRouter();
    let STORE = useStore();
    const { user } = useState(["user"]);
    let DATA: any = reactive({
      routeWhiteList: [
        "/createCompany",
        "/supervisionInfo",
        "/fileDetails",
        "/createTrade",
        "/companyDetails",
        "/tradeDetails",
        "/planDetails",
        "/propagandaInfo",
        "/trainInfo",
        "/checkInfo",
        "/checkDetails",
        "/updateReportInfo",
        "/updateReportDetails",
        "/dailyInfo",
        "/dailyDetails"
      ]
    });
    let METHODS: any = reactive({
      handleGetAllCompany: () => {
        STORE.dispatch("handleGetAllCompany");
      },
      handleGetEnableRole: () => {
        STORE.dispatch("handleGetEnableRole");
      },
      handleGetEnablePersonnel: () => {
        STORE.dispatch("handleGetEnablePersonnel");
      },
      handleGetNotEnablePersonnel: () => {
        STORE.dispatch("handleGetNotEnablePersonnel");
      },
      handleGetTownList: () => {
        STORE.dispatch("handleGetTownList");
      },
      handleGetAllProvince: () => {
        STORE.dispatch("handleGetAllProvince");
      },
      handleEconomicType: () => {
        STORE.dispatch("handleEconomicType");
      },
      handleUserCompanyInfo: () => {
        STORE.state.user.personnel.companyId &&
          STORE.dispatch(
            "handleCompanySensor",
            STORE.state.user.personnel.companyId
          );
      },
      // 获取用户 是否六个月修改密码
      handleIsUpdatePwd: async () => {
        let { data } = await isUpdatePwd({ userId: STORE.state.user.userId });
        if (data.code === RES_SUCCESS) {
          data.data &&
            ElNotification({
              title: "提示",
              message: "您已六个月没有修改密码",
              type: "warning",
              position: "bottom-right",
              duration: 5000
            });
        }
      },
      // 返回上一级
      handleBack: () => {
        ROUTER.push(ROUTE.meta.parentPath as string);
      },
      // 获取角色模块
      getRoleModule: async (id: any) => {
        let checkedArr: Array<number> = [];
        let { data } = await getRoleModule({ roleId: id });
        if (data.code === RES_SUCCESS) {
          data.data.forEach((item: any) => {
            checkedArr.push(item.moduleId);
          });
          // 单独保存 企业编辑按钮
          STORE.commit("setShowEditBtn", {
            isShowNonEditBtn: checkedArr.includes(91),
            isIndustryEditBtn: checkedArr.includes(97)
          });
        }
      }
    });
    onMounted(() => {
      METHODS.handleGetAllCompany();
      METHODS.handleGetEnableRole();
      METHODS.handleGetEnablePersonnel();
      METHODS.handleGetNotEnablePersonnel();
      METHODS.handleGetTownList();
      METHODS.handleGetAllProvince();
      METHODS.handleEconomicType();
      METHODS.handleUserCompanyInfo();
      METHODS.getRoleModule(STORE.state.user.roleId);
      METHODS.handleIsUpdatePwd();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ROUTE,
      STORE
    };
  }
});
</script>

<style scoped lang="scss">
.outContainer {
  background: #000 url("../../assets/bg.webp") no-repeat;
  background-size: 100% 100%;
  .el-header {
    height: 60px;
    // background-color: $themeColor;
  }

  /deep/.insideContainer {
    width: 100%;
    height: calc(100vh - 60px);
    overflow-x: hidden;
    overflow-y: hidden;
    &::-webkit-scrollbar {
      //隐藏滚动条
      width: 0;
    }

    .el-aside {
      position: relative;
      box-sizing: border-box;
      padding: 10px;
      padding-top: 0px;
      padding-bottom: 0px;
      overflow: hidden;
      border-radius: 10px;
      width: auto !important;
      &::-webkit-scrollbar {
        width: 0;
      }
    }
    .el-main {
      background-color: #eaeaea;
      overflow: hidden;
      border-radius: 10px;
      height: calc(100vh - 70px);
      margin: 0 10px 10px 10px !important;
      padding-top: 0;
      padding-left: 10px;
      padding-right: 10px;
      &::-webkit-scrollbar {
        width: 0px;
      }
      // 面包屑
      .crumbs {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        overflow: hidden;
        border-bottom: 2px solid #e0e0e0;
      }
      // 主体
      .com {
        padding: 0;
        background-color: #fff;
        height: 100%;
        width: 100% !important;
        margin-top: 10px;
        .ccom {
          // height: calc(100% - 55px);
          overflow-y: auto;
        }
      }
    }
  }
}

.pointer {
  cursor: pointer;
}
</style>