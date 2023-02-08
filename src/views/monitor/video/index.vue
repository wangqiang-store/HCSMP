<template>
  <el-row class="container">
    <el-col
      :span="4"
      style="padding-right: 10px; border-right: 1px solid #dcdfe6"
      class="tree"
    >
      <MonitorTree @handleNodeClick="handleNodeClick" />
    </el-col>
    <el-col
      :span="16"
      style="
        padding-left: 10px;
        padding-right: 10px;
        border-right: 1px solid #dcdfe6;
      "
      class="JsWebControl"
    >
      <p class="ml-10 mb-10 monitoring">实时监控</p>
      <JsWebControl
        ref="JsWebControlRef"
        @cbIntegrationCallBack="cbIntegrationCallBack"
        :playMode="0"
        :layout="'2x2'"
        :openRealTimeMonitoring="openRealTimeMonitoring"
      />
    </el-col>
    <el-col :span="4" style="padding-left: 10px" class="right">
      <el-descriptions
        class="margin-top"
        title="企业信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(companyInfo) !== '{}' && marking === 3"
        style="margin-bottom: 20px"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>企业名称</h4>
          </template>
          {{ companyInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>法人代表</h4>
          </template>
          {{ companyInfo.legalPerson }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <h4>法人代表联系方式</h4>
          </template>
          {{ companyInfo.legalPhone }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>地址</h4>
          </template>
          {{ companyInfo.address }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        class="margin-top"
        title="监控信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(controlInfo) !== '{}' && marking === 4"
        style="margin-bottom: 20px"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>设备名称</h4>
          </template>
          {{ controlInfo.label }}
        </el-descriptions-item>
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>设备类型</h4>
          </template>
          {{ controlInfo.cameraTypeName }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-show="marking === 4">
        <!-- 云台控制 -->
        <h4 class="monitoring mb-10">云台控制</h4>

        <!-- 大屏显示 -->
        <div class="d_flex mb-10 big_control">
          <div class="consoleControl_left">
            <div
              style="width: 33.33%; padding: 2px; display: inline-block"
              v-for="item of controlOption_direction"
              :key="item"
            >
              <a
                class="consoleControl_left_item iconfont"
                :class="item.icon ? item.icon : ''"
                @mousedown="handleConsoleControl(item.type, 0)"
                @mouseup="handleConsoleControl(item.type, 1)"
                href="javascript:;"
              >
                {{ item.text ? item.text : "" }}
              </a>
            </div>
          </div>
          <div class="consoleControl_right">
            <div
              style="padding: 2px; display: inline-block"
              v-for="item of controlOption_variate"
              :key="item"
            >
              <a
                class="consoleControl_right_item"
                @mousedown="handleConsoleControl(item.type, 0)"
                @mouseup="handleConsoleControl(item.type, 1)"
                href="javascript:;"
              >
                {{ item.text }}
              </a>
            </div>
          </div>
        </div>

        <div class="mb-10">
          <p class="mb-5">镜头速度</p>
          <el-slider v-model="speed"></el-slider>
        </div>
        <!-- 码流类型 -->
        <div class="mb-10">
          <p class="mb-5">码流类型</p>
          <el-select
            v-model="streamType"
            placeholder="码流类型"
            @change="handleChnageStreamType"
          >
            <el-option
              v-for="item in streamTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <!-- 录像路径 -->
        <!-- <div class="mb-10">
          <p class="mb-5">录像文件保存路径</p>
          <div class="d_flex">
            <el-input
              class="mr-10"
              v-model="videoPath"
            ></el-input>
            <el-button type="primary">浏览</el-button>
          </div>
        </div> -->
        <!-- 预览抓图保存路径 -->
        <!-- <div class="mb-10">
          <p class="mb-5">预览抓图保存路径</p>
          <div class="d_flex">
            <el-input
              class="mr-10"
              v-model="capturePath"
            ></el-input>
            <el-button type="primary">浏览</el-button>
          </div>
        </div> -->
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, nextTick, reactive, ref, toRefs, watch } from "vue";
import MonitorTree from "@/components/monitorTree/index.vue";
import JsWebControl from "@/components/jsWebControl/index.vue";
import { yunTaiOperation } from "@/api/Haikang";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
export default defineComponent({
  components: { MonitorTree, JsWebControl },
  setup(props) {
    const STORE = useStore();
    let JsWebControlRef: any = ref(null);
    let DATA: any = reactive({
      // 企业信息
      companyInfo: {},
      // 监控信息
      controlInfo: {},
      streamType: 0,
      streamTypeList: [
        {
          label: "主码流",
          value: 0,
        },
        {
          label: "子码流",
          value: 1,
        },
      ],
      controlOption_direction: [
        {
          icon: "icon-zuoshang",
          type: "LEFT_UP",
        },
        {
          icon: "icon-shangsanjiaoxing",
          type: "UP",
        },
        {
          icon: "icon-youshang",
          type: "RIGHT_UP",
        },
        {
          icon: "icon-zuo",
          type: "LEFT",
        },
        {
          text: "自动",
        },
        {
          icon: "icon-you",
          type: "RIGHT",
        },
        {
          icon: "icon-zuoxia",
          type: "LEFT_DOWN",
        },
        {
          icon: "icon-xiasanjiaoxing",
          type: "DOWN",
        },
        {
          icon: "icon-youxia",
          type: "RIGHT_DOWN",
        },
      ],
      controlOption_variate: [
        {
          text: "变倍+",
          type: "ZOOM_IN",
        },
        {
          text: "变倍-",
          type: "ZOOM_OUT",
        },
        {
          text: "变焦+",
          type: "FOCUS_FAR",
        },
        {
          text: "变焦-",
          type: "FOCUS_NEAR",
        },
        {
          text: "光圈+",
          type: "IRIS_ENLARGE",
        },
        {
          text: "光圈-",
          type: "IRIS_REDUCE",
        },
      ],
      videoPath: "",
      capturePath: "",
      marking: 1,
      cameraIndexCode: "",
      speed: 50,
      // 插件信息回调
      responseMsg: {},
      openRealTimeMonitoring: null,
    });
    let METHODS = reactive({
      handleNodeClick: async (data: any) => {
        switch (data.marking) {
          case 1:
            DATA.marking = 1;
            DATA.companyInfo = {};
            // JsWebControlRef.value.handleStopAllPreviews();
            break;
          case 2:
            DATA.marking = 2;
            DATA.companyInfo = {};
            // JsWebControlRef.value.handleStopAllPreviews();
            break;
          case 3:
            DATA.marking = 3;
            // if (DATA.companyInfo.id != data.id) {
            //   JsWebControlRef.value.handleStopAllPreviews();
            // }
            DATA.companyInfo = Object.assign({}, data);
            break;
          // case 4:
          //   DATA.marking = 4;
          //   DATA.cameraIndexCode = data.cameraIndexCode;
          //   DATA.controlInfo = Object.assign({}, data);
          //   JsWebControlRef.value.handlePreview({
          //     cameraIndexCode: data.cameraIndexCode,
          //     wndId: DATA.responseMsg.wndId,
          //     streamMode: DATA.streamType
          //   });
          // break;
          default:
            break;
        }

        if (data.cameraIndexCode) {
          DATA.marking = 4;
          DATA.cameraIndexCode = data.cameraIndexCode;
          DATA.controlInfo = Object.assign({}, data);
          JsWebControlRef.value.handlePreview({
            cameraIndexCode: data.cameraIndexCode,
            wndId: DATA.responseMsg.wndId,
            streamMode: DATA.streamType,
          });
        }
      },
      handleConsoleControl: async (type: string, key: number) => {
        if (type) {
          let { data } = await yunTaiOperation({
            action: key,
            cameraIndexCode: DATA.cameraIndexCode,
            command: type,
            speed: DATA.speed,
          });
          if (data.code !== "0") {
            ElMessage({
              message: "该监控设备不支持此操作",
              type: "error",
            });
          }
        }
      },
      cbIntegrationCallBack: (responseMsg: any) => {
        if (responseMsg.type === 1) {
          DATA.responseMsg = responseMsg;
          if (responseMsg.msg.cameraIndexCode) {
            DATA.cameraIndexCode = responseMsg.msg.cameraIndexCode;
            STORE.state.globalData.codeDeviceList.forEach((item: any) => {
              if (item.cameraIndexCode === responseMsg.msg.cameraIndexCode) {
                DATA.controlInfo = Object.assign({}, item);
              }
            });
          }
        }
      },
      // 切换码流
      handleChnageStreamType: () => {
        JsWebControlRef.value.handlePreview({
          cameraIndexCode: DATA.cameraIndexCode,
          wndId: DATA.responseMsg.msg.wndId,
          streamMode: DATA.streamType,
        });
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      JsWebControlRef,
    };
  },
  beforeRouteEnter(to, from, next) {
    // ...
    if (to.query.cameraIndexCode) {
      next((vm: any) => {
        vm.openRealTimeMonitoring = () => {
          vm.marking = 4;
          vm.cameraIndexCode = to.query.cameraIndexCode;
          vm.JsWebControlRef.handlePreview({
            cameraIndexCode: to.query.cameraIndexCode,
            streamMode: 0,
          });
        };
      });
    } else {
      next();
    }
  },
});
</script>
<style scoped lang="scss">
.container{
  // height: calc(100% - 40px) !important;
  overflow: hidden !important;
}
.right {
  height: calc(100vh - 160px) !important;
  overflow-y: auto;
}
.monitoring {
  border-left: 5px solid #666666;
  padding-left: 5px;
}
.JsWebControl {
  height: calc(100vh - 191px);
}
.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}
.consoleControl_left {
  width: 50%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  .consoleControl_left_item {
    width: 100%;
    height: 40px;
    min-width: 16px;
    border-radius: 4px;
    border: 1px solid #666666;
    color: #999999;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: $themeColor;
      color: $textColor;
    }
  }
}
.consoleControl_right {
  width: 50%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  .consoleControl_right_item {
    width: 60px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    border: 1px solid #666666;
    font-size: 14px;
    color: #999999;
    cursor: pointer;
    &:hover {
      background-color: $themeColor;
      color: $textColor;
    }
  }
}
/deep/ .el-select {
  width: 100%;
}
/deep/ .el-input {
  width: 100%;
}

@media screen and (max-width: 1900px) {
  .big_control {
    flex-direction: column;
  }
  .consoleControl_left,
  .consoleControl_right {
    width: 100%;
  }
}
</style>