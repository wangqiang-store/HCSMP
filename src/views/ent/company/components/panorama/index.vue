<template>
  <el-row>
    <el-col
      :span="24"
      class="mb-10"
    >
      <div class="w-100 d_flex d_flex_sb">
        <h3>企业全景图</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            @click="disable=!disable"
            v-show="disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            v-show="!disable"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
    </el-col>
    <el-col :span="24">
      <el-form
        ref="form"
        :model="panoramaFormData"
        label-width="120px"
      >
        <el-form-item label="全景图">
          <EleUpload
            :imageList="imageList"
            @uploadSuccess="uploadSuccess"
            @uploadRemove="uploadRemove"
            :disabled="disable"
            :class="{imgAndVideo:disable}"
          />
        </el-form-item>
        <el-form-item label="全景图视频">
          <EleUpload
            :isUploadImage="false"
            :videoList="videoList"
            :isFlex="false"
            :disabled="disable"
            @uploadVideoSuccess="uploadVideoSuccess"
            @deleteSolid="uploadVideoRemove"
            :class="{imgAndVideo:disable}"
          />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input
            :disabled="disable"
            v-model="panoramaFormData.remark"
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue';
import EleUpload from '@/components/eleUpload/index.vue';
import {
  createCompanyPanorama,
  updateCompanyPanorama,
} from '@/api/company/panorama';
import { useStore } from 'vuex';
import { IMG_File, RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus';
export default defineComponent({
  components: { EleUpload },
  props: {
    formData: {
      type: Object,
      default: {},
    },
    isDisable: {
      type: Boolean,
    },
  },
  setup(props) {
    const STORE = useStore();
    let DATA: any = reactive({
      panoramaFormData: {},
      disable: true,
      imageList: [],
      videoList: [],
    });
    let METHODS = reactive({
      handleSave: async () => {
        if (!DATA.panoramaFormData.companyInfoId) {
          ElMessage({
            message: '请先填写保存营业执照信息',
            type: 'warning',
          });
          return;
        }
        if (DATA.panoramaFormData.id) {
          let { data } = await updateCompanyPanorama(DATA.panoramaFormData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '企业全景图保存成功',
              type: 'success',
            });
            DATA.disable = !DATA.disable;
            let { id, videoFileId, imgFileId, remark, companyInfoId } =
              data.data;
            DATA.panoramaFormData = Object.assign(
              {},
              { id, videoFileId, imgFileId, remark, companyInfoId }
            );
          }
        } else {
          let { data } = await createCompanyPanorama(DATA.panoramaFormData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '企业全景图保存成功',
              type: 'success',
            });
            DATA.disable = !DATA.disable;
            let { id, videoFileId, imgFileId, remark, companyInfoId } =
              data.data;
            DATA.panoramaFormData = Object.assign(
              {},
              { id, videoFileId, imgFileId, remark, companyInfoId }
            );
          }
        }
      },
      uploadSuccess: (res: any) => {
        DATA.imageList.push({ url: IMG_File + res.data.path });
        DATA.panoramaFormData.imgFileId = res.data.id;
      },
      uploadRemove: () => {
        DATA.imageList = [];
        DATA.panoramaFormData.imgFileId = null;
      },
      uploadVideoSuccess: (res: any) => {
        DATA.videoList.push({ path: IMG_File + res.data.path });
        DATA.panoramaFormData.videoFileId = res.data.id;
      },
      uploadVideoRemove: (index: number) => {
        if (props.isDisable) {
          DATA.videoList = [];
          DATA.panoramaFormData.videoFileId = null;
        }
      },
    });
    watch(
      () => props.formData,
      () => {
        if (props.formData !== null) {
          let { id, videoFileId, imgFileId, remark, companyInfoId } =
            props.formData;
          DATA.panoramaFormData = Object.assign(
            {},
            { id, videoFileId, imgFileId, remark, companyInfoId }
          );
          DATA.imageList = [];
          props.formData.imgPath &&
            DATA.imageList.push({ url: IMG_File + props.formData.imgPath });
          DATA.videoList = [];
          props.formData.videoPath &&
            DATA.videoList.push({
              path: IMG_File + props.formData.videoPath,
            });
        }
      },
      {
        deep: true,
      }
    );
    watch(
      () => props.isDisable,
      () => {
        DATA.disable =
          STORE.state.user.personnel.unitType === 1
            ? props.isDisable
            : props.isDisable
            ? props.isDisable
            : !props.isDisable;
      },
      {
        immediate: true,
      }
    );
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.imgAndVideo:hover /deep/.el-upload{
  cursor: not-allowed;
  border: 1px dotted #cfd8e3;
}
/deep/ .el-textarea__inner {
  height: 180px;
}
</style>