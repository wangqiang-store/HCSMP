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

    <el-dialog title="修改密码" v-model="dialogVisible" width="30%" top="8vh">
      <ele-form
        :formData="updatePwdFormData"
        :rules="updatePwdRules"
        :renderFormArr="renderFormArr"
        ref="updatePwdForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmUpdate"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 二次绑定 -->
    <el-dialog
      custom-class="twoDialog"
      v-model="TheSecondBindingDialogVisible"
      @close="closeTheSecondBindingDialog"
    >
      <el-steps :active="active + 1" finish-status="success">
        <el-step title="步骤 1" description="扫描二维码获取动态密码"></el-step>
        <el-step title="步骤 2" description="请输入动态密码"></el-step>
      </el-steps>
      <div class="TheSecondBindingBox">
        <div id="qrcode" v-show="active == 0" ref="qrCodeUrl"></div>
        <div v-show="active == 0">
          <p>请使用以下工具扫描二维码</p>
          <p>Google身份验证器</p>
          <p>Authy</p>
          <p>FreeOTP</p>
          <p>二次验证小程序</p>
          <p>其他基于TOTP算法的APP</p>
          <p>然后输入手机上显示的6位动态验证码</p>
        </div>
      </div>
      <div v-show="active == 1">
        <el-input
          placeholder="请输入动态密码"
          v-model="dynamicPassword"
        ></el-input>
      </div>
      <div style="text-align: right">
        <el-button
          style="margin-top: 12px"
          @click="next(-1)"
          v-show="active != 0"
          >上一步</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="next(1)"
          v-show="active != 1"
          >下一步</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="next(1)"
          v-show="active == 1"
          type="primary"
          >提交</el-button
        >
      </div>
    </el-dialog>

    <!-- 解除绑定 -->
    <el-dialog v-model="unboundDialogVisible">
      <div class="TheSecondBindingBox">
        <div>
          <h4 class="mb-10">关闭二次验证后将无法保护你的账号安全！</h4>
        </div>
        <el-input
          placeholder="请输入动态密码"
          v-model="unboundDynamicPassword"
          ref="unboundDialogInput"
        ></el-input>
      </div>
      <div style="text-align: right">
        <el-button
          style="margin-top: 12px"
          @click="unboundDialogVisible = false"
          >取消</el-button
        >
        <el-button
          style="margin-top: 12px"
          @click="confirmUnbound"
          type="primary"
          >确定</el-button
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
    // 获取vue实例
    const { proxy }: any = getCurrentInstance();
    // 获取store实例
    const STORE = useStore();
    // 获取路由实例
    const ROUTE = useRoute();
    const ROUTER = useRouter();
    let { globalData } = useState(["globalData"]);
    // 自定义验证规则
    var validatePass = (rule: any, value: any, callback: any) => {
      if (value.length < 8) {
        callback(new Error("密码长度至少8位"));
      } else {
        if (verifyPwd.test(value)) {
          callback();
        } else {
          callback(new Error("密码至少包含数字、字母、特殊字符两种"));
        }
      }
    };
    let validatePass2 = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== DATA.updatePwdFormData.newPwd) {
        callback(new Error("两次输入密码不一致!"));
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
      // 修改密码
      updatePwdFormData: {
        newPwd: "",
        oldPwd: "",
        confirmPwd: "",
      },
      renderFormArr: [
        {
          label: "旧密码",
          prop: "oldPwd",
          type: "input",
          inputType: "password",
        },
        {
          label: "新密码",
          prop: "newPwd",
          type: "input",
          inputType: "password",
        },
        {
          label: "确认密码",
          prop: "confirmPwd",
          type: "input",
          inputType: "password",
        },
      ],
      updatePwdRules: {
        oldPwd: [
          { required: true, message: "旧密码不能为空", trigger: "blur" },
        ],
        newPwd: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { validator: validatePass, trigger: "change" },
        ],
        confirmPwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" },
        ],
      },
      currentRoutePath: "",
      pathList: ["/createCompany", "/createTrade"], //判断 是否是 企业详情页面

      //二次绑定
      active: 0,
      dynamicPassword: "", //动态密码
      TheSecondBindingDialogVisible: false, //二次绑定框
      unboundDialogVisible: false, //解除二次绑定框
      unboundDynamicPassword: "", //解除绑定动态密码
      link: "", //二维码的内容
      secret: "",
    });
    let METHODS: any = reactive({
      handleCollapse(bool: string) {
        STORE.commit("setCollection", bool);
        // sessionStorage.setItem("collection",bool)
      },
      // 二次绑定
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
      // 关闭二次绑定模态窗
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
              message: "请输入动态密码",
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
                  message: "绑定成功",
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

      // 取消绑定按钮
      unbind() {
        DATA.unboundDynamicPassword = "";
        DATA.unboundDialogVisible = true;
        nextTick(() => {
          proxy.$refs.unboundDialogInput.focus();
        });
      },
      //确认解除绑定
      confirmUnbound() {
        if (DATA.unboundDynamicPassword == "") {
          proxy.$message({
            type: "info",
            message: "请输入动态密码",
          });
          return;
        }
        removeSecret({ code: DATA.unboundDynamicPassword })
          .then((res: any) => {
            if (res.data.code == 200) {
              proxy.$message({
                type: "success",
                message: "解绑成功",
              });
              STORE.commit("setBindingState", res.data.data);
              DATA.unboundDialogVisible = false;
            }
          })
          .catch((err) => {});
      },

      // 生成二维码
      qrcode() {
        let qrcode = new QRCode(proxy.$refs.qrCodeUrl, {
          width: 200,
          height: 200, // 高度
          text: DATA.link, // 二维码内容
          colorDark: "#000000",
          colorLight: "#ffffff",
          // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
          // background: '#f0f',   // 背景色
          // foreground: '#ff0'    // 前景色
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
      // 确认修改密码
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
                  message: "密码修改成功",
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
            message: "退出成功",
            type: "success",
          });
        }
      },
      // 帮助
      handleHelp: () => {
        let a = document.createElement("a");
        a.href = "/files/fixed/英德市安全生产信息管理系统用户使用手册.pdf";
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

//二次
.TheSecondBindingBox {
  #qrcode {
    margin-bottom: 20px;
    display: inline-block;
    img {
      width: 132px;
      height: 132px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
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