<template>
  <el-row>
    <el-col
      :span="24"
      class="content"
    >
      <!-- <el-image
        :src="require('../../../assets/image/logo.png')"
        :fit="'cover'"
        @click="ROUTER.push('/')"
      ></el-image> -->
      <div class="headerLeft">英德市安全生产信息管理系统</div>
      <div class="headerRight">
        <el-dropdown
          trigger="click"
          class="userDropdown"
        >
          <i
            class="iconfont icon-yonghu yonghu"
            style="font-size: 24px"
            @click="handleUser"
          >
          </i>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>{{
                STORE.state.user.username
              }}</el-dropdown-item>
              <el-dropdown-item v-show="!STORE.state.user.BindingState">
                <span
                  style="display: inline-block"
                  @click="TheSecondBinding"
                >
                  二次验证
                </span>
              </el-dropdown-item>
              <el-dropdown-item v-show="STORE.state.user.BindingState">
                <span
                  style="display: inline-block"
                  @click="unbind"
                >取消二次绑定</span>
              </el-dropdown-item>
              <el-dropdown-item @click="handleUpdatePwd">修改密码</el-dropdown-item>
              <el-dropdown-item @click="handleHelp">帮助</el-dropdown-item>
              <el-dropdown-item>
                <span
                  style="display: inline-block"
                  @click="onAbout"
                >关于</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-popconfirm
          confirmButtonText="确定"
          cancelButtonText="取消"
          icon="el-icon-info"
          iconColor="#d19a56"
          title="是否确定退出登录？"
          @confirm="confirmEvent"
        >
          <template #reference>
            <i
              class="iconfont icon-tuichudenglu"
              style="font-size: 24px; padding-left: 20px"
            ></i>
          </template>
        </el-popconfirm>
      </div>

      <el-dialog
        title="修改密码"
        v-model="dialogVisible"
        width="30%"
        top="8vh"
      >
        <ele-form
          :formData="updatePwdFormData"
          :rules="updatePwdRules"
          :renderFormArr="renderFormArr"
          ref="updatePwdForm"
        ></ele-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirmUpdate"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 二次绑定 -->
      <el-dialog
        custom-class="twoDialog"
        v-model="TheSecondBindingDialogVisible"
        @close="closeTheSecondBindingDialog"
      >
        <el-steps
          :active="active + 1"
          finish-status="success"
        >
          <el-step
            title="步骤 1"
            description="扫描二维码获取动态密码"
          ></el-step>
          <el-step
            title="步骤 2"
            description="请输入动态密码"
          ></el-step>
        </el-steps>
        <div class="TheSecondBindingBox">
          <div
            id="qrcode"
            v-show="active == 0"
            ref="qrCodeUrl"
          ></div>
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
          >上一步</el-button>
          <el-button
            style="margin-top: 12px"
            @click="next(1)"
            v-show="active != 1"
          >下一步</el-button>
          <el-button
            style="margin-top: 12px"
            @click="next(1)"
            v-show="active == 1"
            type="primary"
          >提交</el-button>
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
          >取消</el-button>
          <el-button
            style="margin-top: 12px"
            @click="confirmUnbound"
            type="primary"
          >确定</el-button>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { useStore } from "vuex";
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  reactive,
  onMounted,
  toRefs,
  watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import EleForm from "@/components/eleForm/index.vue";
import { verifyPwd } from "@/api/common/verify";
import {
  updatePwd,
  createSecretUri,
  bindingSecret,
  removeSecret
} from "@/api/system/sysUser";
import md5 from "js-md5";
import QRCode from "qrcodejs2";
import { RES_SUCCESS, sessionRead, sessionWrite } from "@/api/common/common";
import { ElMessage, ElNotification } from "element-plus";
import { useState } from "@/hooks/useMapper";
import axios from "axios";
export default defineComponent({
  components: {
    EleForm
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
      isComputerScreen: true,
      windowInnerWidth: window.innerWidth,
      isShowMenu: false,
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
        "/dailyDetails"
      ],
      activeIndex: sessionRead("oldPath"),
      routers: STORE.state.user.routers,
      dialogVisible: false,
      // 修改密码
      updatePwdFormData: {
        newPwd: "",
        oldPwd: "",
        confirmPwd: ""
      },
      renderFormArr: [
        {
          label: "旧密码",
          prop: "oldPwd",
          type: "input",
          inputType: "password"
        },
        {
          label: "新密码",
          prop: "newPwd",
          type: "input",
          inputType: "password"
        },
        {
          label: "确认密码",
          prop: "confirmPwd",
          type: "input",
          inputType: "password"
        }
      ],
      updatePwdRules: {
        oldPwd: [
          { required: true, message: "旧密码不能为空", trigger: "blur" }
        ],
        newPwd: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { validator: validatePass, trigger: "change" }
        ],
        confirmPwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" }
        ]
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
      configInfo: {}
    });
    let METHODS: any = reactive({
      // 二次绑定
      TheSecondBinding() {
        if (DATA.TheSecondBindingDialogVisible) return;

        DATA.dynamicPassword = "";
        DATA.TheSecondBindingDialogVisible = true;
        //
        createSecretUri().then((res: any) => {
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
              message: "请输入动态密码"
            });
            return;
          }

          bindingSecret({
            code: DATA.dynamicPassword,
            secret: DATA.secret
          })
            .then((res: any) => {
              if (res.data.code == 200) {
                proxy.$message({
                  type: "success",
                  message: "绑定成功"
                });
                STORE.commit("setBindingState", res.data.data);
                DATA.TheSecondBindingDialogVisible = false;
              } else {
                DATA.active = 1;
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
            message: "请输入动态密码"
          });
          return;
        }
        removeSecret({ code: DATA.unboundDynamicPassword })
          .then((res: any) => {
            if (res.data.code == 200) {
              proxy.$message({
                type: "success",
                message: "解绑成功"
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
          colorLight: "#ffffff"
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
                  type: "success"
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
            type: "success"
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
      // 获取系统版本
      getAppVersion: async () => {
        let { data } = await axios.get("/config/index.json");
        DATA.configInfo = data;
      },
      // 关于
      onAbout: async () => {
        ElNotification({
          title: "关于",
          message: `client ${DATA.configInfo.APP_CLIENT_VERSION} serve ${DATA.configInfo.APP_SERVER_VERSION}`,
          type: "info",
        });
      }
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
        immediate: true
      }
    );
    // watch(
    //   () => DATA.windowInnerWidth,
    //   (newVal, oldVal) => {
    //     DATA.isComputerScreen = newVal < 1600 ? false : true;
    //   },
    //   {
    //     immediate: true,
    //     deep: true,
    //   }
    // );
    onMounted(() => {
      // 监听浏览器的宽度变化
      window.onresize = function () {
        if (window.innerWidth < 1600) {
          DATA.isComputerScreen = false;
        } else {
          DATA.isComputerScreen = true;
          DATA.isShowMenu = false;
        }
      };
      METHODS.getAppVersion();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      ROUTER
    };
  }
});
</script>

<style lang="scss" scoped>
.content {
  height: 60px;
  line-height: 60px;
  // background-color: $themeColor;
  display: flex;
  justify-content: space-between;
  /deep/.el-image {
    position: absolute;
    left: -10px;
    top: -14px;
    bottom: 0;
  }
  /deep/.el-image__inner {
    height: 115%;
  }
  .headerLeft {
    color: $textColor;
    font-size: 24px;
    font-family: "黑体";
    font-style: italic;
  }
  .headerRight {
    height: 60px;
    line-height: 60px;
    i {
      color: $textColor;
      &:hover {
        // color: #ffd04b;
        color: $themeColor;
        cursor: pointer;
      }
    }
  }
}
.el-dropdown-menu__item:hover {
  color: $themeColor !important;
}

//二次
.TheSecondBindingBox {
  P {
    height: 20px;
  }
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