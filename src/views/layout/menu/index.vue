<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      background-color="transparent"
      text-color="#444"
      :collapse="isCollapse"
      router
      unique-opened
      active-text-color="#409eff"
    >
      <template v-for="item of routers" :key="item.path">
        <!-- :index="item.children[0].path" -->
        <el-menu-item
          class="home"
          :class="{ isCollapse: isCollapse }"
          v-if="
            (item.children != undefined && item.name == 'Layout') ||
            (item.children != undefined && item.children.length === 0)
          "
          :index="item.path === '/' ? item.redirect : item.path"
        >
          <i class="el-icon-s-home"></i>
          <template #title>
            <span>{{ item.meta.title }}</span>
          </template>
        </el-menu-item>
        <!-- <el-menu-item
          class="home"
          v-if="
            (item.children != undefined && item.name == 'Layout') ||
            (item.children != undefined && item.children.length === 0)
          "
          :index="item.path === '/' ? item.redirect : item.path"
          >{{ item.meta.title }}</el-menu-item
        > -->
        <!--  @click="skipHome(item.path)" -->
        <el-submenu
          :index="item.path"
          v-if="
            item.children != undefined &&
            item.children.length > 0 &&
            item.name !== 'Layout'
          "
        >
          <template #title>
            <i
              :class="
                activeIndex.includes(item.path)
                  ? `${item.icon} active`
                  : `${item.icon}`
              "
            ></i>
            <span :class="{ active: activeIndex.includes(item.path) }">{{
              item.meta.title
            }}</span>
          </template>
          <div>
            <el-menu-item
              v-for="val of item.children"
              :key="`${val.path}`"
              :index="`${item.path}/${val.path}`"
              style="width: 100%; text-align: center"
            >
              <!-- @click="skipMoudel(`${item.path}/${val.path}`)" -->
              {{ val.meta.twoTitle }}
            </el-menu-item>
          </div>
        </el-submenu>
      </template>
    </el-menu>
    <el-radio-group v-model="isCollapse" id="collapse" class="collapse">
      <el-radio-button
        v-if="isCollapse"
        @click="handleCollapse(false)"
        :label="false"
        class="right"
        ><i class="el-icon-arrow-right"></i>
      </el-radio-button>
      <el-radio-button
        v-else
        class="left"
        :label="true"
        @click="handleCollapse(true)"
        ><i class="el-icon-arrow-left"></i
      ></el-radio-button>
    </el-radio-group>

    <el-dialog title="????????????" v-model="dialogVisible" width="30%" top="8vh">
      <ele-form
        :formData="updatePwdFormData"
        :rules="updatePwdRules"
        :renderFormArr="renderFormArr"
        ref="updatePwdForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">??? ???</el-button>
          <el-button type="primary" @click="handleConfirmUpdate"
            >??? ???</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- ???????????? -->
    <el-dialog
      custom-class="twoDialog"
      v-model="TheSecondBindingDialogVisible"
      @close="closeTheSecondBindingDialog"
    >
      <el-steps :active="active + 1" finish-status="success">
        <el-step title="?????? 1" description="?????????????????????????????????"></el-step>
        <el-step title="?????? 2" description="?????????????????????"></el-step>
      </el-steps>
      <div class="TheSecondBindingBox">
        <div id="qrcode" v-show="active == 0" ref="qrCodeUrl"></div>
        <div v-show="active == 0">
          <p>????????????????????????????????????</p>
          <p>Google???????????????</p>
          <p>Authy</p>
          <p>FreeOTP</p>
          <p>?????????????????????</p>
          <p>????????????TOTP?????????APP</p>
          <p>??????????????????????????????6??????????????????</p>
        </div>
      </div>
      <div v-show="active == 1">
        <el-input
          placeholder="?????????????????????"
          v-model="dynamicPassword"
        ></el-input>
      </div>
      <div style="text-align: right">
        <el-button
          style="margin-top: 12px"
          @click="next(-1)"
          v-show="active != 0"
          >?????????</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="next(1)"
          v-show="active != 1"
          >?????????</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="next(1)"
          v-show="active == 1"
          type="primary"
          >??????</el-button
        >
      </div>
    </el-dialog>

    <!-- ???????????? -->
    <el-dialog v-model="unboundDialogVisible">
      <div class="TheSecondBindingBox">
        <div>
          <h4 class="mb-10">?????????????????????????????????????????????????????????</h4>
        </div>
        <el-input
          placeholder="?????????????????????"
          v-model="unboundDynamicPassword"
          ref="unboundDialogInput"
        ></el-input>
      </div>
      <div style="text-align: right">
        <el-button
          style="margin-top: 12px"
          @click="unboundDialogVisible = false"
          >??????</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="confirmUnbound"
          type="primary"
          >??????</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  reactive,
  onMounted,
  ref,
  toRef,
  toRefs,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import EleForm from "@/components/eleForm/index.vue";
import { verifyPwd } from "@/api/common/verify";
import {
  updatePwd,
  createSecretUri,
  bindingSecret,
  removeSecret,
} from "@/api/system/sysUser";
import md5 from "js-md5";
import QRCode from "qrcodejs2";
import { RES_SUCCESS, sessionRead, sessionWrite } from "@/api/common/common";
import { ElMessage } from "element-plus";
import { useState } from "@/hooks/useMapper";
export default defineComponent({
  components: {
    EleForm,
  },
  setup() {
    // ??????vue??????
    const { proxy }: any = getCurrentInstance();
    // ??????store??????
    const STORE = useStore();
    // ??????????????????
    const ROUTE = useRoute();
    const ROUTER = useRouter();
    let { globalData } = useState(["globalData"]);
    // ?????????????????????
    var validatePass = (rule: any, value: any, callback: any) => {
      if (value.length < 8) {
        callback(new Error("??????????????????8???"));
      } else {
        if (verifyPwd.test(value)) {
          callback();
        } else {
          callback(new Error("??????????????????????????????????????????????????????"));
        }
      }
    };
    let validatePass2 = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("?????????????????????"));
      } else if (value !== DATA.updatePwdFormData.newPwd) {
        callback(new Error("???????????????????????????!"));
      } else {
        callback();
      }
    };
    let DATA: any = reactive({
      isCollapse: false,
      windowInnerWidth: window.innerWidth,
      routeWhiteList: [
        "/createCompany",
        "/supervisionInfo",
        "/fileDetails",
        "/planDetails",
        "/createTrade",
        "/companyDetails",
        "/tradeDetails",
        "/propagandaInfo",
        "/trainInfo",
        "/checkInfo",
        "/checkDetails",
        "/updateReportInfo",
        "/updateReportDetails",
        "/dailyInfo",
        "/dailyDetails",
      ],
      activeIndex: sessionRead("oldPath"),
      routers: STORE.state.user.routers,
      dialogVisible: false,
      // ????????????
      updatePwdFormData: {
        newPwd: "",
        oldPwd: "",
        confirmPwd: "",
      },
      renderFormArr: [
        {
          label: "?????????",
          prop: "oldPwd",
          type: "input",
          inputType: "password",
        },
        {
          label: "?????????",
          prop: "newPwd",
          type: "input",
          inputType: "password",
        },
        {
          label: "????????????",
          prop: "confirmPwd",
          type: "input",
          inputType: "password",
        },
      ],
      updatePwdRules: {
        oldPwd: [
          { required: true, message: "?????????????????????", trigger: "blur" },
        ],
        newPwd: [
          { required: true, message: "?????????????????????", trigger: "blur" },
          { validator: validatePass, trigger: "change" },
        ],
        confirmPwd: [
          { required: true, message: "?????????????????????", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" },
        ],
      },
      currentRoutePath: "",
      pathList: ["/createCompany", "/createTrade"], //?????? ????????? ??????????????????

      //????????????
      active: 0,
      dynamicPassword: "", //????????????
      TheSecondBindingDialogVisible: false, //???????????????
      unboundDialogVisible: false, //?????????????????????
      unboundDynamicPassword: "", //????????????????????????
      link: "", //??????????????????
      secret: "",
    });
    let METHODS: any = reactive({
      handleCollapse(bool: string) {
        STORE.commit("setCollection", bool);
        // sessionStorage.setItem("collection",bool)
      },
      // ????????????
      TheSecondBinding() {
        if (DATA.TheSecondBindingDialogVisible) return;

        DATA.dynamicPassword = "";
        DATA.TheSecondBindingDialogVisible = true;
        //
        createSecretUri().then((res: any) => {
          // console.log(res);
          DATA.link = res.data.data;
          DATA.secret = res.data.data.split("=")[1];
          nextTick(() => {
            this.qrcode();
          });
        });
      },
      // ???????????????????????????
      closeTheSecondBindingDialog() {
        DATA.active = 0;
        let ele: any = document.getElementById("qrcode");
        ele.innerHTML = "";
      },
      next(n: any) {
        DATA.active += n;
        if (DATA.active >= 2) {
          if (DATA.dynamicPassword == "") {
            DATA.active = 1;
            proxy.$message({
              type: "info",
              message: "?????????????????????",
            });
            return;
          }

          bindingSecret({
            code: DATA.dynamicPassword,
            secret: DATA.secret,
          })
            .then((res: any) => {
              if (res.data.code == 200) {
                proxy.$message({
                  type: "success",
                  message: "????????????",
                });
                STORE.commit("setBindingState", res.data.data);
                DATA.TheSecondBindingDialogVisible = false;
              } else {
                DATA.active = 1;
                // proxy.$message.error(res.data.msg);
              }
            })
            .catch((err) => {});
        }
      },

      // ??????????????????
      unbind() {
        DATA.unboundDynamicPassword = "";
        DATA.unboundDialogVisible = true;
        nextTick(() => {
          proxy.$refs.unboundDialogInput.focus();
        });
      },
      //??????????????????
      confirmUnbound() {
        if (DATA.unboundDynamicPassword == "") {
          proxy.$message({
            type: "info",
            message: "?????????????????????",
          });
          return;
        }
        removeSecret({ code: DATA.unboundDynamicPassword })
          .then((res: any) => {
            if (res.data.code == 200) {
              proxy.$message({
                type: "success",
                message: "????????????",
              });
              STORE.commit("setBindingState", res.data.data);
              DATA.unboundDialogVisible = false;
            }
          })
          .catch((err) => {});
      },

      // ???????????????
      qrcode() {
        let qrcode = new QRCode(proxy.$refs.qrCodeUrl, {
          width: 200,
          height: 200, // ??????
          text: DATA.link, // ???????????????
          colorDark: "#000000",
          colorLight: "#ffffff",
          // render: 'canvas' ,   // ???????????????????????????????????? table???canvas????????????canvas???
          // background: '#f0f',   // ?????????
          // foreground: '#ff0'    // ?????????
        });
      },

      handleClose(done: any) {
        done();
      },
      handleUpdatePwd: () => {
        DATA.dialogVisible = true;
        nextTick(() => {
          proxy.$refs["updatePwdForm"].resetForm();
        });
      },
      // ??????????????????
      handleConfirmUpdate: () => {
        let { newPwd, oldPwd } = DATA.updatePwdFormData;
        proxy.$refs["updatePwdForm"]
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              newPwd = md5(newPwd);
              oldPwd = md5(oldPwd);
              let { data } = await updatePwd({ newPwd, oldPwd });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "??????????????????",
                  type: "success",
                });
                DATA.dialogVisible = false;
              }
            }
          });
      },
      confirmEvent() {
        ROUTER.push("/login");
        if (!DATA.pathList.includes(DATA.currentRoutePath)) {
          STORE.dispatch("FedLogOut");
          ElMessage({
            message: "????????????",
            type: "success",
          });
        }
      },
      // ??????
      handleHelp: () => {
        let a = document.createElement("a");
        a.href = "/files/fixed/?????????????????????????????????????????????????????????.pdf";
        a.target = "_blank";
        a.click();
      },
      // skipMoudel: (path: string): void => {
      //   ROUTER.push(path);
      // },
      // skipHome: (path: string): void => {
      //   if (path === '/') {
      //     ROUTER.push(path);
      //   }
      // },
    });
    watch(
      () => ROUTE.path,
      (newData, oldData) => {
        DATA.currentRoutePath = newData;
        if (DATA.routeWhiteList.includes(newData)) {
          DATA.activeIndex = ROUTE.meta.parentPath;
          if (oldData != undefined) {
            sessionWrite("oldPath", ROUTE.meta.parentPath);
          } else {
            DATA.activeIndex = sessionRead("oldPath");
          }
        } else {
          DATA.activeIndex = newData;
        }
      },
      {
        immediate: true,
      }
    );

    onMounted(() => {
      DATA.routers = STORE.state.user.routers.map((item: any) => {
        switch (item.name) {
          case "system":
            item.icon = "el-icon-s-tools";
            break;
          case "trouble":
            item.icon = "el-icon-s-opportunity";
            break;
          case "enforcement":
            item.icon = "el-icon-s-flag";
            break;
          case "mission":
            item.icon = "el-icon-mic";
            break;
          case "report":
            item.icon = "el-icon-s-data";
            break;
          case "emergency":
            item.icon = "el-icon-s-management";
            break;
          case "monitor":
            item.icon = "el-icon-video-camera-solid";
            break;
          case "security":
            item.icon = "el-icon-s-marketing";
            break;
          case "ent":
            item.icon = "el-icon-s-finance";
            break;
          case "dep":
            item.icon = "el-icon-guide";
            break;
          default:
            break;
        }
        return item;
      });
      STORE.commit("setCollection", false);

      let bodyHeight =
        document.body.clientWidth || document.documentElement.clientWidth;
      bodyHeight < 960 ? (DATA.isCollapse = true) : (DATA.isCollapse = false);

      window.addEventListener("resize", onresizeFn);
      function onresizeFn(e: any) {
        if (e.target?.innerWidth < 960) {
          METHODS.handleCollapse(true);
          DATA.isCollapse = true;
        } else {
          DATA.isCollapse = false;
          METHODS.handleCollapse(false);
        }
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      ROUTER,
    };
  },
});
</script>

<style lang="scss" scoped>
// .active{
//   color: $themeColor;
// }
.el-menu {
  //
  background-color: rgba($color: #f1f3f9, $alpha: 0.7) !important;
  box-sizing: border-box;
  // width: 100%;
  border-radius: 10px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 50px;
  height: calc(100vh - 70px);
  &::-webkit-scrollbar {
    width: 0;
  }
  /deep/.el-submenu__title {
    padding-left: 15px !important;
    padding-right: 42px !important;
    overflow: hidden !important;
    &:hover {
      border-radius: 25px !important;
      background-color: rgba($color: #3181ea, $alpha: 0.2) !important;
    }
  }
  .is-active.el-submenu {
    overflow: hidden;
    background-color: transparent !important;
  }

  /deep/.el-menu-item {
    text-align: left !important;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    padding-left: 0;
    &:hover {
      border-radius: 50px !important;
      background-color: rgba($color: #3181ea, $alpha: 0.2) !important;
    }
  }
  .el-menu-item:not(.home) {
    min-width: 170px !important;
  }
  .is-active.el-menu-item {
    border-radius: 25px;
    background-color: #1a73e8 !important;
    padding: 0;
    color: $textColor !important;
  }
  /deep/.el-submenu__icon-arrow,
  .el-icon-arrow-down {
    color: $themeColor;
    font-weight: 700;
  }
}
.collapse {
  position: absolute;
  left: 10px;
  right: 0;
  bottom: 10px;
  width: calc(100% - 20px);
  overflow: hidden;
  border: #1a73e8;
  border-radius: 0 0 10px 10px !important;
  // padding: 0 10px;
  .el-radio-button {
    width: 100%;
    // border-radius: 0 0 10px 10px;
    background-color: $themeColor;
    /deep/.el-radio-button__inner {
      width: 100%;
      border: 1px solid $themeColor;
      i {
        color: $textColor;
        font-size: 18px;
        font-weight: 700;
      }
    }
    // &.right {
    //   width: 55px !important;
    //   overflow: hidden;
    // }
    // &.left {
    //   width: 180px !important;
    // }
  }
}
/deep/.el-submenu__title {
  font-size: 14px;
  font-weight: 700;
}
.home {
  // width: 100%;
  height: 50px;
  line-height: 50px;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  padding-left: 15px !important;
  & div {
    text-align: left;
    padding-right: 100px !important;
    left: -10px !important;
  }
}
.el-menu-item.is-active.home.isCollapse {
  background-color: transparent !important;
  &:hover {
    border-radius: 50px !important;
    background-color: rgba($color: #3181ea, $alpha: 0.2) !important;
  }
  i {
    color: $themeColor;
  }
}
/deep/.el-menu-item.home div {
  left: -5px !important;
}

//??????
.TheSecondBindingBox {
  #qrcode {
    margin-bottom: 20px;
    display: inline-block;
    img {
      width: 132px;
      height: 132px;
      background-color: #fff; //?????????????????????
      padding: 6px; // ??????padding????????????????????????
      box-sizing: border-box;
    }
  }
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>