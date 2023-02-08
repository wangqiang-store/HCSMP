<template>
  <div class="container">
    <el-card class="login_box">
      <div class="tac login_box_left">
        <h1 class="login_title">英德市安全生产信息管理系统</h1>
        <el-image
          class="image"
          :src="require('../../assets/image/cooperate.png')"
        ></el-image>
      </div>
      <div class="login_box_right">
        <div style="width: 70%" class="flex-y">
          <h3 style="margin-bottom: 30px;color: #666;">用户登录</h3>
          <div class="login">
            <el-form :model="loginParams" :rules="rules" ref="ruleForm">
              <el-form-item prop="username" style="width: 100%">
                <el-input
                  style="width: 100%"
                  placeholder="请输入用户账号"
                  v-model="loginParams.username"
                >
                  <template #prefix>
                    <i class="iconfont icon-yonghu"></i>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password" style="width: 100%">
                <el-input
                  style="width: 100%"
                  placeholder="请输入登录密码"
                  v-model="loginParams.password"
                  type="password"
                  show-password
                  @keydown.enter="handleSign"
                >
                  <template #prefix>
                    <i class="iconfont icon-suo2"></i>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item style="width: 100%">
                <el-button
                  style="width: 100%; padding: 17px; letter-spacing: 0.2em"
                  type="primary"
                  @click="handleSign"
                  >登录</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 二次验证模态框 -->
    <el-dialog
      title="二次验证"
      v-model="dialogFormVisible"
      @close="closeDialogFormVisible"
    >
      <div style="text-align: center">
        <h4 class="mb-10">
          动态验证码有4次的容错，也就是说最近2分钟的验证码都有效
        </h4>
      </div>
      <el-input v-model="code" placeholder="请输入动态密码"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="VerifyModalTwice">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  getCurrentInstance,
} from "vue";
import { useRouter } from "vue-router";
import md5 from "js-md5";
import { RES_SUCCESS } from "@/api/common/common";
import { ElMessage } from "element-plus";

export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const ROUTER = useRouter();
    const STORE = useStore();
    // 表单实例
    let ruleForm = ref(null);
    let DATA: any = reactive({
      loginParams: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
        ],
      },
      md5Password: "", //加密的用户密码

      dialogFormVisible: false, //二次验证框
      code: "",
    });
    let METHODS: any = reactive({
      handleSign: async () => {
        let form: any = ruleForm.value;
        form.validate(async (valid: boolean) => {
          if (valid) {
            DATA.loginParams.username = DATA.loginParams.username.trim();
            // DATA.loginParams.password = md5(DATA.loginParams.password);
            DATA.md5Password = md5(DATA.loginParams.password);
            let { data } = await STORE.dispatch("Login", {
              username: DATA.loginParams.username,
              password: DATA.md5Password,
            });
            if (data.data?.isBinding) {
              DATA.dialogFormVisible = true;
              STORE.commit("setBindingState", data.data.isBinding);
            } else {
              if (data.code === RES_SUCCESS) {
                await ROUTER.push("/");
                ElMessage({
                  message: "登录成功",
                  type: "success",
                });
              }
              STORE.commit("setBindingState", data.data?.isBinding);
            }
          }
        });
      },

      // 确认二次绑定
      VerifyModalTwice() {
        if (!DATA.code) {
          ElMessage({
            message: "请输入动态密码",
            type: "warning",
          });
          return;
        }
        STORE.dispatch("TwoLogin", {
          code: DATA.code,
          username: DATA.loginParams.username,
          password: DATA.md5Password,
        }).then((res) => {
          if (res.data.code == 200) {
            //登录成功
            proxy.$message({
              type: "success",
              message: "登录成功",
            });
            DATA.loading = false;
            //跳转
            ROUTER.push({ path: "/" });
          }
        }).catch((err)=>{});
      },
      // 二次验证关闭
      closeDialogFormVisible() {
        DATA.loading = false;
        DATA.code = "";
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ruleForm,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  // background-color: #224380;
  background-image: linear-gradient(to right,#3175e4,#5d93e7);
  .login_box {
    width: 60%;
    height: 600px;
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    /deep/ .el-card__body {
      display: flex;
      width: 100%;
    }
    .login_box_left {
      // flex: 1;
      width: 50%;
      /deep/ .el-image__inner {
        -webkit-user-drag: none;
      }
      .login_title {
        margin-bottom: 30px;
        font-size: calc(100vw / 68.7);
        letter-spacing: 0.2em;
        white-space: nowrap;
        color: #666;
      }
    }
    .login_box_right {
      // flex: 1;
      width: 50%;
      display: flex;
      justify-content: center;
      /deep/ .el-input__inner {
        padding-top: 25px;
        padding-bottom: 25px;
        padding-left: 40px;
        // background-color: #faffbd;
      }
      .el-button {
        // background-color: #224380;
        background-color: #3785ea;
        border-radius: 25px;
      }
      .el-input {
        box-shadow: 0 0 10px 1px var(--el-input-border-color);
      }
    }
  }
  .flex-y {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/deep/ .el-input__prefix,
/deep/ .el-input__suffix {
  display: flex;
  align-items: center;
  padding-left: 10px;
}
</style>