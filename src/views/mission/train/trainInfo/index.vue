<template>
  <el-row  class="container">
    <el-col :span="24" style="padding: 20px 100px">
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :options="options"
        :rules="rules"
        :styles="styles"
        ref="formRef"
      >
        <template #accessory>
          <el-upload
            class="upload-demo"
            :action="IMG_URL"
            :headers="getItemtoken"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
            multiple
          >
            <el-button class="mr-10" type="primary">添加附件</el-button>
            <template #tip>
              <div class="el-upload__tip pt-5">注意 : 可上传多个附件</div>
            </template>
          </el-upload>
        </template>
        <template #videoData>
          <EleUpload
            :videoList="videoList"
            :isUploadImage="false"
            :multiple="true"
            :isFlex="true"
            class="eleUpload"
            tip="注意 : 可上传多个视频"
            @uploadVideoSuccess="handleUploadVideoSuccess"
            @deleteSolid="deleteSolid"
          />
        </template>
      </ele-form>
    </el-col>
    <el-col :span="24" class="mb-20">
      <div class="w-100 tac">
        <el-button class="mr-10" @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import EleForm from "@/components/eleForm/index.vue";
import EleUpload from "@/components/eleUpload/index.vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from "@/api/common/common";
import {
  createTrainRecordsInfo,
  updateTrainRecordsInfo,
} from "@/api/mission/train";
import { ElMessage } from "element-plus";
import { filterTime } from "@/utils/filtration";
export default defineComponent({
  components: { EleForm, EleUpload },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    let formRef: any = ref(null);
    let DATA: any = reactive({
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      formData: {
        name: "",
        checkTime: null,
        organizer: "",
        participant: "",
        summary: "",
        fileIds: [],
        videoIds: [],
      },
      renderFormArr: [
        {
          label: "标题",
          type: "input",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "title",
        },
        {
          label: "组织人（团体）",
          type: "input",
          labelWidth: "150px",
          style: {
            width: "45%",
          },
          prop: "organizer",
        },
        {
          label: "时间",
          type: "date",
          labelWidth: "150px",
          placeholder: "请选择时间",
          style: {
            width: "45%",
          },
          prop: "happenTime",
        },
        {
          label: "参与人（团体）",
          type: "input",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "participant",
        },
        {
          label: "内容概要",
          type: "input",
          inputType: "textarea",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "contentSummary",
        },

        {
          label: "总结",
          type: "input",
          inputType: "textarea",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          prop: "summary",
        },
        {
          label: "附件",
          type: "slot",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          slotName: "accessory",
        },
        {
          label: "视频资料",
          type: "slot",
          labelWidth: "150px",
          style: {
            width: "100%",
          },
          slotName: "videoData",
        },
      ],

      options: {},
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        happenTime: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        organizer: [
          { required: true, message: "请输入组织人(团体)", trigger: "blur" },
        ],
        participant: [
          { required: true, message: "请输入参与人(团体)", trigger: "blur" },
        ],
      },
      videoList: [], //附件
      fileList: [], //视频
      files: [],
    });
    let METHODS = reactive({
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(",");
            }
            if (Array.isArray(DATA.formData.videoIds)) {
              DATA.formData.videoIds = DATA.formData.videoIds.join(",");
            }
            DATA.formData.happenTime = filterTime(
              DATA.formData.happenTime,
              "/"
            );

            delete DATA.formData.createTime;
            delete DATA.formData.updateTime;
            delete DATA.formData.files;
            delete DATA.formData.videos;
            //发起请求
            if (DATA.formData.id) {
              let { data } = await updateTrainRecordsInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "编辑成功",
                  type: "success",
                });
                setTimeout(() => {
                  history.go(-1);
                }, 1000);
              }
            } else {
              let { data } = await createTrainRecordsInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "添加成功",
                  type: "success",
                });
                setTimeout(() => {
                  history.go(-1);
                }, 1000);
              }
            }
          }
        });
      },
      handleBack: () => {
        history.go(-1);
      },

      handleUploadSuccess: (res: any) => {
        if (Array.isArray(DATA.formData.fileIds)) {
          DATA.formData.fileIds.push(res.data.id);
        } else {
          DATA.formData.fileIds =
            DATA.formData.fileIds === ""
              ? []
              : DATA.formData.fileIds.split(",");
          DATA.formData.fileIds.push(res.data.id);
        }

        DATA.files.push(res.data);
      },
      handleRemove: (res: any, fileList: any) => {
        let deleteUrl = "";
        if (res.response) {
          deleteUrl = res.response.data.path;
        } else {
          deleteUrl = res.url; //获取要删除的文件路径
        }
        let fileIds = [];
        // 获取删除文件在文件列表对应的索引值
        let i = DATA.files.findIndex((item: any) => item.path == deleteUrl);
        DATA.files.splice(i, 1);
        for (let item of DATA.files) {
          fileIds.push(item.id);
        }
        DATA.formData.fileIds = fileIds.join(",");
      },
      handleUploadVideoSuccess: (res: any) => {
        DATA.videoList.push({ path: IMG_File + res.data.path });
        if (Array.isArray(DATA.formData.videoIds)) {
          DATA.formData.videoIds.push(res.data.id);
        } else {
          DATA.formData.videoIds = DATA.formData.videoIds.split(",");
          DATA.formData.videoIds.push(res.data.id);
        }
      },
      deleteSolid: (index: number) => {
        DATA.videoList.splice(index, 1);
        DATA.formData.videoIds.splice(index, 1);
      },
    });

    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token"),
      };
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);

      // 获取数据
      DATA.formData = Object.assign({}, STORE.state.globalData.trainInfo);
      DATA.fileList = [];
      DATA.files=[]
      DATA.formData.fileIds = [];
      if (DATA.formData.files != null) {
        DATA.files = DATA.formData.files;
        for (let item of DATA.formData.files) {
          DATA.formData.fileIds.push(item.id);
          DATA.fileList.push({
            name: item.name,
            url: IMG_File + item.path,
          });
        }
      }
      DATA.videoList = [];
      DATA.formData.videoIds = [];
      if (DATA.formData.videos != null) {
        for (let item of DATA.formData.videos) {
          DATA.formData.videoIds.push(item.id);
          DATA.videoList.push({
            path: IMG_File + item.path,
          });
        }
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      getItemtoken,
      formRef,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
/deep/ textarea {
  height: 100px;
  resize: none;
  border: 1px solid #dcdfe6;
  overflow-y: scroll;
}
/deep/.el-upload__tip {
  height: 12px;
  line-height: 12px;
  position: absolute;
  left: 0;
  bottom: -12px;
}
.eleUpload{
  margin-top: 10px;
}
</style>