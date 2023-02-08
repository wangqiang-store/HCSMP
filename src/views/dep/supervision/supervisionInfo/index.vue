<template>
  <el-row class="container">
    <el-col :span="24" style="padding: 0 20px">
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :radios="radios"
        :options="options"
        :rules="rules"
        :styles="styles"
        ref="formRef"
      >
        <template #accessory>
          <el-upload
            class="upload-demo"
            drag
            :action="IMG_URL"
            :headers="getItemtoken"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传单个附件</em>
            </div>
            <div class="el-upload__tip">注意 : 可上传多个附件</div>
            <template #tip>
              <!-- <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div> -->
            </template>
          </el-upload>
        </template>
        <template #videoData>
          <EleUpload
            :videoList="videoList"
            :isUploadImage="false"
            :multiple="true"
            :isFlex="true"
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
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useStore } from "vuex";
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from "@/api/common/common";
import {
  createDepartSupervision,
  updateDepartSupervision,
} from "@/api/dep/supervision";
import { ElMessage } from "element-plus";
import { filterTime } from "@/utils/filtration";
export default defineComponent({
  components: { EleForm, EleUpload },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    const ROUTER = useRouter();
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
        checkTime: null,
        companyType: null,
        fileIds: [],
        name: "",
        organizer: "",
        participant: "",
        summary: "",
        type: null,
        videoIds: [],
      },
      renderFormArr: [
        {
          label: "名称",
          type: "input",
          labelWidth: "120px",
          style: {
            width: "100%",
          },
          prop: "name",
        },
        {
          label: "类型",
          type: "select",
          labelWidth: "120px",
          value: "value",
          title: "name",
          style: {
            width: "45%",
          },
          prop: "type",
        },
        {
          label: "时间",
          type: "date",
          labelWidth: "120px",
          placeholder: "请选择时间",
          style: {
            width: "45%",
          },
          prop: "checkTime",
        },
        {
          label: "行业类型",
          type: "radio",
          labelWidth: "120px",
          value: "value",
          title: "name",
          style: {
            width: "100%",
          },
          prop: "companyType",
        },
        {
          label: "组织人",
          type: "input",
          labelWidth: "120px",
          style: {
            width: "45%",
          },
          prop: "organizer",
        },
        {
          label: "参与人",
          type: "input",
          labelWidth: "120px",
          style: {
            width: "45%",
          },
          prop: "participant",
        },
        {
          label: "内容概要",
          type: "input",
          inputType: "textarea",
          labelWidth: "120px",
          style: {
            width: "100%",
          },
          prop: "summary",
        },
        {
          label: "附件",
          type: "slot",
          labelWidth: "120px",
          style: {
            width: "100%",
          },
          slotName: "accessory",
        },
        {
          label: "视频资料",
          type: "slot",
          labelWidth: "120px",
          style: {
            width: "100%",
          },
          slotName: "videoData",
        },
      ],
      radios: {
        companyType: [
          {
            value: 1,
            name: "非煤矿山行业",
          },
          {
            value: 4,
            name: "工贸行业",
          },
        ],
      },
      options: {},
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        checkTime: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        companyType: [
          { required: true, message: "请选择行业类型", trigger: "change" },
        ],
        summary: [
          { required: true, message: "请输入内容概要", trigger: "blur" },
        ],
      },
      videoList: [],
      fileList: [],
      files: [],
    });
    let METHODS = reactive({
      // 获取部门行政监管
      handleSupervisionType: async () => {
        let { data } = await getByKey({ key: "t_depart_supervision_type" });
        if (data.code === RES_SUCCESS) {
          DATA.options.type = data.data;
        }
      },
      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(",");
            }
            if (Array.isArray(DATA.formData.videoIds)) {
              DATA.formData.videoIds = DATA.formData.videoIds.join(",");
            }
            DATA.formData.checkTime = filterTime(DATA.formData.checkTime, "/");
            if (DATA.formData.id) {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              delete DATA.formData.files;
              delete DATA.formData.videos;
              let { data } = await updateDepartSupervision(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "编辑成功",
                  type: "success",
                });
                history.go(-1);
                // ROUTER.push({
                //   name: "supervision",
                //   params: {
                //     content: ROUTE.params.content,
                //     yearly: ROUTE.params.yearly,
                //     limit: +ROUTE.params.limit || 10,
                //     page: +ROUTE.params.page || 1,
                //   },
                // });
              }
            } else {
              let { data } = await createDepartSupervision(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "添加成功",
                  type: "success",
                });
                history.go(-1);
                // ROUTER.push({
                //   name: "supervision",
                //   params: {
                //     content: ROUTE.params.content,
                //     yearly: ROUTE.params.yearly,
                //     limit: +ROUTE.params.limit || 10,
                //     page: +ROUTE.params.page || 1,
                //   },
                // });
              }
            }
          }
        });
      },
      handleBack: () => {
        history.go(-1);
        // ROUTER.push({
        //   name: "supervision",
        //   params: {
        //     content: ROUTE.params.content,
        //     yearly: ROUTE.params.yearly,
        //     limit: +ROUTE.params.limit || 10,
        //     page: +ROUTE.params.page || 1,
        //   },
        // });
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
    onBeforeRouteLeave((to, from, next) => {
      if (to.path !== "/dep/supervision") {
        sessionStorage.removeItem("supervisionPageParams");
      }
      next(true);
    });
    onMounted(() => {
      METHODS.handleSupervisionType();
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);
      DATA.formData = Object.assign({}, STORE.state.globalData.supervisionInfo);
      DATA.fileList = [];
      DATA.formData.fileIds = [];
      if (DATA.formData.files != null) {
        DATA.files = DATA.formData.files;
        for (let item of DATA.formData.files) {
          DATA.formData.fileIds.push(item.id);
          DATA.fileList.push({
            id: item.id,
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
/deep/.el-upload__tip {
  height: 12px;
  line-height: 12px;
  position: absolute;
  left: 0;
  bottom: -12px;
}

/deep/.el-upload-list__item {
  width: 500px;
}
</style>