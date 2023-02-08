<template>
  <el-row
    class="container"
    style="height:100%"
  >
    <el-col
      :span="4"
      style="padding-right:10px;border-right:1px solid #dcdfe6"
      class="tree"
    >
      <MonitorTree
        @handleNodeClick="handleNodeClick"
        :devices="devicesList"
      />
    </el-col>
    <el-col
      :span="16"
      style="padding-left:10px;padding-right:10px;border-right:1px solid #dcdfe6"
      class="JsWebControl"
    >
      <JsWebControl
        ref="JsWebControlRef"
        :playMode="1"
        :layout="'1x1'"
        :isChangeDate="isChangeDate"
        @cbIntegrationCallBack="cbIntegrationCallBack"
      />
    </el-col>
    <el-col
      :span="4"
      style="padding-left:10px"
      v-show="hierarchy === 3"
    >
      <el-descriptions
        class="margin-top"
        title="企业信息"
        :column="1"
        direction="vertical"
        v-if="JSON.stringify(companyInfo) !=='{}'"
      >
        <el-descriptions-item class="mt-10 mb-5">
          <template #label>
            <h4>企业名称</h4>
          </template>
          {{companyInfo.name}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>法人代表</h4>
          </template>
          {{companyInfo.legalPerson}}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <h4>法人代表联系方式</h4>
          </template>
          {{companyInfo.legalPhone}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <h4>地址</h4>
          </template>
          {{companyInfo.address}}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
    <el-col
      :span="4"
      style="padding-left:10px"
      v-show="hierarchy === 4"
    >
      <h4 class="playback mb-10">回放</h4>
      <div class="mb-10">
        <p class="mb-5">码流类型</p>
        <el-select
          v-model="streamType"
          placeholder="码流类型"
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
      <div class="mb-10">
        <p class="mb-5">开始日期</p>
        <el-date-picker
          v-model="startDate"
          type="datetime"
          placeholder="选择日期时间"
          class="timeDate"
          popper-class="datetime"
          :disabled-date="disabledDate"
        >
        </el-date-picker>
      </div>
      <div class="mb-10">
        <p class="mb-5">结束日期</p>
        <el-date-picker
          v-model="endDate"
          type="datetime"
          placeholder="选择日期时间"
          class="timeDate"
          popper-class="datetime"
          :disabled-date="disabledDate"
        >
        </el-date-picker>
      </div>
      <div class="tar">
        <el-button
          type="primary"
          class="query"
          @click="handleQuery"
        >查询</el-button>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, nextTick, reactive, ref, toRefs } from "vue";
import MonitorTree from "@/components/monitorTree/index.vue";
import JsWebControl from "@/components/jsWebControl/index.vue";
import { filterTime } from "@/utils/filtration";
import { ElMessage } from "element-plus";
export default defineComponent({
  components: { MonitorTree, JsWebControl },
  setup(props) {
    let JsWebControlRef: any = ref(null);
    let DATA: any = reactive({
      companyInfo: {},
      hierarchy: 1,
      streamType: 0,
      startDate: "",
      endDate: "",
      streamTypeList: [
        {
          label: "主码流",
          value: 0
        },
        {
          label: "子码流",
          value: 1
        }
      ],
      devicesList: [],
      responseMsg: {},
      isChangeDate: false
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      handleNodeClick: async (data: any) => {
        switch (data.marking) {
          case 1:
            DATA.companyInfo = {};
            DATA.hierarchy = 1;
            break;
          case 2:
            DATA.companyInfo = {};
            DATA.hierarchy = 2;
            break;
          case 3:
            DATA.marking = 3;
            DATA.hierarchy = 3;
            // if (DATA.companyInfo.id != data.id) {
            //   JsWebControlRef.value.handleStopAllPreviews();
            // }
            DATA.companyInfo = Object.assign({}, data);
            break;
          // case 4:
          //   DATA.hierarchy = 4;
          //   DATA.cameraIndexCode = data.cameraIndexCode;
          //   break;
          default:
            break;
        }

        if (data.cameraIndexCode) {
          DATA.hierarchy = 4;
          DATA.cameraIndexCode = data.cameraIndexCode;
        }
      },
      handleQuery: () => {
        if (DATA.startDate && DATA.endDate) {
          if (
            new Date(DATA.endDate).getTime() <=
            new Date(DATA.startDate).getTime()
          ) {
            ElMessage({
              message: "结束日期不能小于等于开始日期",
              type: "warning"
            });
            return;
          }
          JsWebControlRef.value.handlePlayback({
            cameraIndexCode: DATA.cameraIndexCode,
            startTime: filterTime(DATA.startDate, "/"),
            endTime: filterTime(DATA.endDate, "/"),
            wndId: DATA.responseMsg.wndId,
            recordLocation: 1
          });
        } else {
          ElMessage({
            message: "请填写开始日期及结束日期",
            type: "warning"
          });
          return;
        }
      },
      cbIntegrationCallBack: (responseMsg: any) => {
        if (responseMsg.type === 1) {
          responseMsg.msg.cameraIndexCode &&
            (DATA.cameraIndexCode = responseMsg.msg.cameraIndexCode);
          DATA.responseMsg = responseMsg;
        }
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      JsWebControlRef
    };
  }
});
</script>
<style scoped lang="scss">
.tree {
  height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
}
.JsWebControl {
  height: calc(100vh - 170px);
}
.playback {
  border-left: 5px solid #666666;
  padding-left: 5px;
}
/deep/ .el-select {
  width: 100%;
}
/deep/ .el-input {
  width: 100%;
}
</style>