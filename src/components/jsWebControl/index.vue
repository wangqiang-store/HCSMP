<template>
  <el-row style="height: 100%">
    <el-col :span="24" style="height: 100%">
      <!--视频窗口展示-->
      <div id="playWnd" class="playWnd" ref="playWndEle"></div>
      <!-- style="left: 109px; top: 133px;" -->
    </el-col>
  </el-row>
</template>
<script>
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
} from "vue";
// 引入视频插件依赖
import { ElMessage } from "element-plus";
import { IMG_File } from "@/api/common/common";
import { onBeforeRouteLeave } from "vue-router";
export default defineComponent({
  props: {
    playMode: {
      type: Number,
      default: 0,
    },
    layout: {
      type: String,
      default: "2x2",
    },
    openRealTimeMonitoring: {
      type: Function,
    },
  },
  emits: ["cbIntegrationCallBack"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    //使用element-resize-detector 监听左边 菜单栏 缩放
    let elementResizeDetectorMaker = require("element-resize-detector"); //导入
    let erd;
    let timer;

    let oWebControl;
    // 判断 鼠标点击时间
    let isClickDate = ref(false);
    let playWndEle = ref();
    let DATA = reactive({
      //声明公用变量
      initCount: 0,
      pubKey: "",
      playWndWidth: null,
      playWndHeight: null,
    });
    let METHODS = reactive({
      // 创建播放实例
      initPlugin: () => {
        oWebControl = new WebControl({
          szPluginContainer: "playWnd", // 指定容器id
          iServicePortStart: 15900, // 指定起止端口号，建议使用该值
          iServicePortEnd: 15909,
          szClassId: "23BF3B0A-2C56-4D97-9C03-0CB103AA8F11", // 用于IE10使用ActiveX的clsid
          cbConnectSuccess: function () {
            // 创建WebControl实例成功
            oWebControl
              .JS_StartService("window", {
                // WebControl实例创建成功后需要启动服务
                dllPath: "./VideoPluginConnect.dll", // 值"./VideoPluginConnect.dll"写死
              })
              .then(
                function () {
                  // 启动插件服务成功
                  oWebControl.JS_SetWindowControlCallback({
                    // 设置消息回调
                    cbIntegrationCallBack: METHODS.cbIntegrationCallBack,
                  });

                  oWebControl
                    .JS_CreateWnd(
                      "playWnd",
                      DATA.playWndWidth,
                      DATA.playWndHeight
                    )
                    .then(function () {
                      //JS_CreateWnd创建视频播放窗口，宽高可设定
                      METHODS.init(); // 创建播放实例成功后初始化
                    });
                },
                function () {
                  // 启动插件服务失败
                }
              );
          },
          cbConnectError: function () {
            // 创建WebControl实例失败
            oWebControl = null;
            ElMessage({
              message: "插件未启动，正在尝试启动，请稍候...",
              type: "warning",
            });
            WebControl.JS_WakeUp("VideoWebPlugin://"); // 程序未启动时执行error函数，采用wakeup来启动程序
            DATA.initCount++;
            if (DATA.initCount < 3) {
              timer = setTimeout(function () {
                METHODS.initPlugin();
              }, 3000);
            } else {
              proxy
                .$confirm(
                  "插件启动失败，请检查插件是否安装或下载插件?",
                  "提示",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                  }
                )
                .then(() => {
                  let a = document.createElement("a");
                  a.href = `${IMG_File}/files/fixed/VideoWebPlugin.exe`;
                  a.download = "VideoWebPlugin.exe";
                  a.click();
                })
                .catch(() => {});
            }
          },
          cbConnectClose: function (bNormalClose) {
            // 异常断开：bNormalClose = false
            // JS_Disconnect正常断开：bNormalClose = true
            console.log("cbConnectClose");
            oWebControl = null;
          },
        });
      },
      // 设置窗口控制回调
      setCallbacks: () => {
        oWebControl.JS_SetWindowControlCallback({
          cbIntegrationCallBack: METHODS.cbIntegrationCallBack,
        });
      },
      // 推送消息
      cbIntegrationCallBack: (oData) => {
        // showCBInfo(JSON.stringify(oData.responseMsg));
        emit("cbIntegrationCallBack", oData.responseMsg);
      },
      //初始化
      init: () => {
        METHODS.getPubKey(function () {
          ////////////////////////////////// 请自行修改以下变量值	////////////////////////////////////
          var appkey = "24145565"; //综合安防管理平台提供的appkey，必填
          var secret = METHODS.setEncrypt("bizdsaRVxOqrEx1Xluvz"); //综合安防管理平台提供的secret，必填
          var ip = "120.24.60.191"; //综合安防管理平台IP地址，必填
          var playMode = props.playMode; //初始播放模式：0-预览，1-回放
          var port = 443; //综合安防管理平台端口，若启用HTTPS协议，默认443
          var snapDir = "D:\\SnapDir"; //抓图存储路径
          var videoDir = "D:\\VideoDir"; //紧急录像或录像剪辑存储路径
          var layout = props.layout; //playMode指定模式的布局
          var enableHTTPS = 1; //是否启用HTTPS协议与综合安防管理平台交互，这里总是填1
          var encryptedFields = "secret"; //加密字段，默认加密领域为secret
          var showToolbar = 1; //是否显示工具栏，0-不显示，非0-显示
          var showSmart = 1; //是否显示智能信息（如配置移动侦测后画面上的线框），0-不显示，非0-显示
          var buttonIDs =
            "0,16,256,257,258,259,260,512,513,514,515,516,517,768,769"; //自定义工具条按钮
          ////////////////////////////////// 请自行修改以上变量值	////////////////////////////////////

          oWebControl
            .JS_RequestInterface({
              funcName: "init",
              argument: JSON.stringify({
                appkey: appkey, //API网关提供的appkey
                secret: secret, //API网关提供的secret
                ip: ip, //API网关IP地址
                playMode: playMode, //播放模式（决定显示预览还是回放界面）
                port: port, //端口
                snapDir: snapDir, //抓图存储路径
                videoDir: videoDir, //紧急录像或录像剪辑存储路径
                layout: layout, //布局
                enableHTTPS: enableHTTPS, //是否启用HTTPS协议
                encryptedFields: encryptedFields, //加密字段
                showToolbar: showToolbar, //是否显示工具栏
                showSmart: showSmart, //是否显示智能信息
                buttonIDs: buttonIDs, //自定义工具条按钮
              }),
            })
            .then(function (oData) {
              oWebControl.JS_Resize(DATA.playWndWidth + 2, DATA.playWndHeight); // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
              props.openRealTimeMonitoring && props.openRealTimeMonitoring();
            });
        });
      },
      //获取公钥
      getPubKey: (callback) => {
        oWebControl
          .JS_RequestInterface({
            funcName: "getRSAPubKey",
            argument: JSON.stringify({
              keyLength: 1024,
            }),
          })
          .then(function (oData) {
            if (oData.responseMsg.data) {
              DATA.pubKey = oData.responseMsg.data;
              callback();
            }
          });
      },
      //RSA加密
      setEncrypt: (value) => {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(DATA.pubKey);
        return encrypt.encrypt(value);
      },
      // 设置窗口裁剪，当因滚动条滚动导致窗口需要被遮住的情况下需要JS_CuttingPartWindow部分窗口
      setWndCover: () => {
        var iWidth = document.documentElement.clientWidth;
        var iHeight = document.documentElement.clientHeight;
        var oDivRect = playWnd.getBoundingClientRect();

        var iCoverLeft = oDivRect.left < 0 ? Math.abs(oDivRect.left) : 0;
        var iCoverTop = oDivRect.top < 0 ? Math.abs(oDivRect.top) : 0;
        var iCoverRight =
          oDivRect.right - iWidth > 0 ? Math.round(oDivRect.right - iWidth) : 0;
        var iCoverBottom =
          oDivRect.bottom - iHeight > 0
            ? Math.round(oDivRect.bottom - iHeight)
            : 0;

        iCoverLeft =
          iCoverLeft > DATA.playWndWidth ? DATA.playWndWidth : iCoverLeft;
        iCoverTop =
          iCoverTop > DATA.playWndHeight ? DATA.playWndHeight : iCoverTop;
        iCoverRight =
          iCoverRight > DATA.playWndWidth ? DATA.playWndWidth : iCoverRight;
        iCoverBottom =
          iCoverBottom > DATA.playWndHeight ? DATA.playWndHeight : iCoverBottom;

        oWebControl.JS_RepairPartWindow(
          0,
          0,
          DATA.playWndWidth + 1,
          DATA.playWndHeight
        ); // 多1个像素点防止还原后边界缺失一个像素条
        if (iCoverLeft != 0) {
          oWebControl.JS_CuttingPartWindow(
            0,
            0,
            iCoverLeft,
            DATA.playWndHeight
          );
        }
        if (iCoverTop != 0) {
          oWebControl.JS_CuttingPartWindow(
            0,
            0,
            DATA.playWndWidth + 1,
            iCoverTop
          ); // 多剪掉一个像素条，防止出现剪掉一部分窗口后出现一个像素条
        }
        if (iCoverRight != 0) {
          oWebControl.JS_CuttingPartWindow(
            DATA.playWndWidth - iCoverRight,
            0,
            iCoverRight,
            DATA.playWndHeight
          );
        }
        if (iCoverBottom != 0) {
          oWebControl.JS_CuttingPartWindow(
            0,
            DATA.playWndHeight - iCoverBottom,
            DATA.playWndWidth,
            iCoverBottom
          );
        }
      },
      //  插件默认不 置顶
      setStickCover: () => {
        oWebControl.JS_CuttingPartWindow(
          0,
          0,
          DATA.playWndWidth + 1,
          DATA.playWndHeight
        );
      },
      //视频预览功能
      handlePreview: ({
        cameraIndexCode,
        streamMode = 0,
        transMode = 1,
        gpuMode = 0,
        wndId = -1,
      }) => {
        // 365aff8e8f31422faf39977ed3d708ec
        var cameraIndexCode = cameraIndexCode; //获取输入的监控点编号值，必填
        var streamMode = streamMode; //主子码流标识：0-主码流，1-子码流
        var transMode = transMode; //传输协议：0-UDP，1-TCP
        var gpuMode = gpuMode; //是否启用GPU硬解，0-不启用，1-启用
        var wndId = wndId; //播放窗口序号（在2x2以上布局下可指定播放窗口）

        cameraIndexCode = cameraIndexCode.replace(/(^\s*)/g, "");
        cameraIndexCode = cameraIndexCode.replace(/(\s*$)/g, "");

        oWebControl.JS_RequestInterface({
          funcName: "startPreview",
          argument: JSON.stringify({
            cameraIndexCode: cameraIndexCode, //监控点编号
            streamMode: streamMode, //主子码流标识
            transMode: transMode, //传输协议
            gpuMode: gpuMode, //是否开启GPU硬解
            wndId: wndId, //可指定播放窗口
          }),
        });
      },
      //停止全部预览
      handleStopAllPreviews: () => {
        oWebControl.JS_RequestInterface({
          funcName: "stopAllPreview",
        });
      },
      //录像回放功能
      handlePlayback: ({
        cameraIndexCode,
        startTime,
        endTime,
        recordLocation = 0,
        wndId = -1,
      }) => {
        // replace('-', '/').replace('-', '/')
        var cameraIndexCode = cameraIndexCode; //获取输入的监控点编号值，必填
        var startTimeStamp = new Date(startTime).getTime(); //回放开始时间戳，必填
        var endTimeStamp = new Date(endTime).getTime(); //回放结束时间戳，必填
        var recordLocation = recordLocation; //录像存储位置：0-中心存储，1-设备存储
        var transMode = 1; //传输协议：0-UDP，1-TCP
        var gpuMode = 0; //是否启用GPU硬解，0-不启用，1-启用
        var wndId = wndId; //播放窗口序号（在2x2以上布局下可指定播放窗口）

        oWebControl.JS_RequestInterface({
          funcName: "startPlayback",
          argument: JSON.stringify({
            cameraIndexCode: cameraIndexCode, //监控点编号
            startTimeStamp: Math.floor(startTimeStamp / 1000).toString(), //录像查询开始时间戳，单位：秒
            endTimeStamp: Math.floor(endTimeStamp / 1000).toString(), //录像结束开始时间戳，单位：秒
            recordLocation: recordLocation, //录像存储类型：0-中心存储，1-设备存储
            transMode: transMode, //传输协议：0-UDP，1-TCP
            gpuMode: gpuMode, //是否启用GPU硬解，0-不启用，1-启用
            wndId: wndId, //可指定播放窗口
          }),
        });
      },
      handleStopAllPlayback: () => {
        // 停止回放
        oWebControl.JS_RequestInterface({
          funcName: "stopAllPlayback",
        });
      },
    });

    // 监听 模型容器 元素宽度
    let monitorModelContainer = () => {
      // 创建实例
      erd = elementResizeDetectorMaker();
      erd.listenTo(document.querySelector(".el-aside"), function (element) {
        nextTick(() => {
          window.onresize();
        });
      });
    };

    onMounted(async () => {
      DATA.playWndWidth = playWndEle.value.clientWidth;
      DATA.playWndHeight = playWndEle.value.clientHeight;
      // 监听resize事件，使插件窗口尺寸跟随DIV窗口变化
      window.onresize = () => {
        if (oWebControl != null) {
          DATA.playWndWidth = playWndEle.value.clientWidth;
          DATA.playWndHeight = playWndEle.value.clientHeight;
          oWebControl.JS_Resize(DATA.playWndWidth + 2, DATA.playWndHeight);
          METHODS.setWndCover();
        }
      };
      // 监听滚动条scroll事件，使插件窗口跟随浏览器滚动而移动
      window.onscroll = (e) => {
        if (oWebControl != null) {
          oWebControl.JS_Resize(DATA.playWndWidth + 2, DATA.playWndHeight);
          METHODS.setWndCover();
        }
      };
      // 监听鼠标移动mousemove事件，使插件取消置顶
      window.onmousemove = (e) => {
        // console.log('e: ', e);
        // "el-menu-item"
        if (oWebControl != null) {
          if (
            ([
              "el-dialog__body",
              "el-dialog__header",
              "el-dialog__footer",
              "el-form",
            ].includes(e.target.classList[0]) &&
              !["home", "handle"].includes(e.target.classList[1])) ||
            ![undefined, null].includes(e.target.form) ||
            ["确 定", "取 消"].includes(e.target.innerText) ||
            isClickDate.value
          ) {
            METHODS.setStickCover();
          } else {
            oWebControl.JS_RepairPartWindow(
              0,
              0,
              DATA.playWndWidth + 1,
              DATA.playWndHeight
            );
          }
        }
      };
      // 监听鼠标点击click事件,使插件取消置顶
      window.onclick = (e) => {
        if (oWebControl != null) {
          let isLeft;
          document.querySelectorAll(".datetime").forEach((item) => {
            item.dataset.popperPlacement === "left" && (isLeft = true);
          });
          document
            .querySelectorAll(".el-picker-panel__link-btn")
            .forEach((item) => {
              item.onclick = () => {
                oWebControl.JS_RepairPartWindow(
                  0,
                  0,
                  DATA.playWndWidth + 1,
                  DATA.playWndHeight
                );
                isClickDate.value = false;
              };
            });
          if (
            e.target.offsetParent &&
            e.target.offsetParent.className.indexOf("timeDate") !== -1 &&
            isLeft
          ) {
            METHODS.setStickCover();
            isClickDate.value = true;
          } else {
            oWebControl.JS_RepairPartWindow(
              0,
              0,
              DATA.playWndWidth + 1,
              DATA.playWndHeight
            );
            isClickDate.value = false;
          }
        }
      };
      METHODS.initPlugin();
      monitorModelContainer();
    });
    onUnmounted(() => {
      // 标签关闭
      if (oWebControl != null) {
        oWebControl.JS_HideWnd(); // 先让窗口隐藏，规避可能的插件窗口滞后于浏览器消失问题
        oWebControl.JS_Disconnect().then(
          function () {
            // 断开与插件服务连接成功
          },
          function () {
            // 断开与插件服务连接失败
          }
        );
      }
      clearTimeout(timer)
    });

    onBeforeUnmount(() => {
      // erd.removeAllListeners(document.querySelector('.el-aside'));
    });

    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      playWndEle,
    };
  },
});
</script>
<style scoped lang="scss">
.playWnd {
  // margin: 30px 0 0 20px;
  margin: 0 auto;
  // width: 1000px; /*播放容器的宽和高设定*/
  width: 100%;
  // height: 600px;
  height: 100%;
  border: 1px solid red;
}
</style>