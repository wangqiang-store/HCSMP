<template>
  <!-- 政策法规档案详情页面 -->
  <el-row class="page container">
    <!-- 政府 -->
    <el-col :span="24">
      <el-row>
        <el-col
          :span="24"
          class="d_flex d_flex_sb title"
        >
          <div>
            <h3 class="mb-10">{{ pageData.title }}</h3>
            <div class="mb-10">
              档案文件 : {{ pageData.fileName }}
              <i
                @click="handleDownload(pageData)"
                class="el-icon-download"
              ></i>
            </div>
            <div class="mb-10 info">
              <span class="mr-10">创建人 : {{ pageData.creatorName }}</span>
              <span class="mr-10">档案类型 : {{ pageData.typeName }}</span>
              <span class="mr-10">创建时间 :
                {{ String(pageData.createTime).replace(/\//g, "-") }}</span>
            </div>
          </div>
          <div>
            <el-button
              type="primary"
              class="button"
              @click="handleEdit"
              v-if="sessionRead('policyDetail').showBtnList.includes('edit')"
            ><i class="el-icon-edit mr-10"></i>编 辑</el-button>
          </div>
        </el-col>
        <el-col :span="24" class="file">
          <!-- <div>{{httpUrl.indexOf('localhost') !=-1?"111:"+config.devServer.proxy['/'].target+ pageData.filePath:"222:"+httpUrl + pageData.filePath}}</div> -->
          <!-- <div>{{pageData.filePath}}</div> -->
          <iframe
            v-if="String(pageData.filePath).indexOf('.pdf') > 0"
            :src="pageData.filePath"
            width="100%"
            height="800"
            frameborder="1"
            id="iframe"
          >
          </iframe>
          <div
            v-else
            style="
              margin-bottom: 20px;
              min-height: 500px;
              width: 100%;
            "
            ref="docxFile"
            class="docxFile"
            v-loading="doxcLoading"
          >
          </div>
        </el-col>
      </el-row>
    </el-col>

    <!-- 编辑模态框 -->
    <el-col :span="24">
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="30%"
      >
        <el-form
          :model="dialogFormData"
          status-icon
          :rules="rules"
          ref="formRef"
          label-width="60px"
          class="demo-ruleForm"
        >
          <el-form-item
            label="名称"
            prop="title"
          >
            <el-input
              type="text"
              v-model="dialogFormData.title"
              autocomplete="off"
              style="width:80%; display:inline-block"
            >
            </el-input>
          </el-form-item>

          <el-form-item
            label="文件"
            prop="fileName"
          >
            <div class="d_flex">
              <el-input
                style="width:80%; display:inline-block"
                v-model="dialogFormData.fileName"
                autocomplete="off"
                :disabled="true"
                class="uploadInput"
              >
              </el-input>
              <el-upload
                class="upload-demo"
                style="display:inline-block"
                action="/file/upload"
                :headers="getItemtoken"
                :before-upload="beforeUpload"
                :on-success="handleUploadSuccess"
                :show-file-list="false"
              >
                <el-button
                  size="small"
                  type="primary"
                  style="margin-left: 10px; margin-bottom: 5px"
                >浏览</el-button>
              </el-upload>
            </div>
            <div class="el-upload__tip">只能上传docx/pdf格式文件</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  computed,
  ref,
} from 'vue';
import {
  RES_SUCCESS,
  getByKey,
  sessionWrite,
  sessionRead,
} from '@/api/common/common';
import { updatePolicies } from '@/api/dep/policy';
import { filterTime } from '@/utils/filtration';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import axios from 'axios';
const docx = require('docx-preview');
export default defineComponent({
  components: {},
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const config = require('../../../../vue.config');
    const ROUTE: any = useRoute();
    const docxFile = ref<HTMLElement | null>(null);
    let DATA: any = reactive({
      loading: false,
      doxcLoading: false,
      //数据
      pageData: {},
      pageList: [], //档案类型列表

      dialogVisible: false,
      dialogTitle: '',
      dialogFormData: {
        title: '',
        fileId: '',
        fileName: '',
        type: '',
      },

      rules: {
        title: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        fileName: [{ required: true, message: '此为必填项', trigger: 'blur' }],
      },

      httpUrl: location.origin,
    });
    let METHODS = reactive({
      // 获取docx数据
      getDocx: () => {
        DATA.doxcLoading = true;
        axios({
          method: 'get',
          responseType: 'blob', // 设置响应文件格式
          url: DATA.pageData.filePath,
        }).then(async ({ data }) => {
          await docx.renderAsync(data, docxFile.value); // 渲染到页面预览
          let imgList = document.querySelectorAll('.docxFile img');
          if (imgList && imgList.length > 0) {
            imgList.forEach((item: any) => {
              item.onclick = () => {
                METHODS.handlePreview();
              };
            });
          }
          DATA.doxcLoading = false;
        });
      },

      //获取数据
      handleGetData: () => {
        DATA.loading = true;
        //获取页面参数
        DATA.pageData = sessionRead('policyDetail');
      },

      // 获取政策法规类型
      handleGetPoliciesType: async () => {
        DATA.loading = true;
        let { data } = await getByKey({
          key: 't_policies_and_regulations_type',
        });
        if (data.code === RES_SUCCESS) {
          DATA.pageList = data.data;
          DATA.pageList.forEach((item: any) => {
            if (DATA.pageData.type == item.value) {
              DATA.pageData.typeName = item.name;
              DATA.loading = false;
            }
          });
        }
      },

      //编辑按钮
      handleEdit: () => {
        DATA.dialogFormData = Object.assign({}, DATA.pageData);
        DATA.dialogVisible = true;
        DATA.dialogTitle = '编辑';
      },

      // 确认按钮
      handleConfirm: () => {
        proxy.$refs['formRef']
          .validate()
          .then((valid: boolean) => {
            if (valid) {
              // 编辑请求
              updatePolicies(DATA.dialogFormData).then((res) => {
                if (res.data.code == RES_SUCCESS) {
                  DATA.dialogVisible = false;
                  proxy.$message.success('编辑成功');
                  DATA.pageData = Object.assign({}, DATA.dialogFormData);
                  sessionWrite('policyDetail', DATA.pageData);
                  METHODS.getDocx();
                }
              });
            }
          })
          .catch((err: any) => {});
      },

      beforeUpload: (file: any) => {
        if (
          [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].indexOf(file.type) == -1
        ) {
          proxy.$message.error('请上传docx/pdf正确格式');
          return false;
        }
      },

      // 上传成功
      handleUploadSuccess: (res: any) => {
        DATA.dialogFormData.fileId = res.data.id;
        DATA.dialogFormData.fileName = res.data.name;
        DATA.dialogFormData.filePath = res.data.path;
      },

      // 下载文件
      handleDownload: (pageData: any) => {
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = pageData.filePath;
        link.setAttribute('download', pageData.fileName);
        document.body.appendChild(link);
        link.click();
      },

      // 预览图片
      handlePreview: () => {
        var docxFile = document.querySelector('.docxFile') as HTMLElement;
        new Viewer(docxFile, {
          toolbar: {
            zoomIn: 4,
            zoomOut: 4,
            oneToOne: 4,
            reset: 4,
            prev: 4,
            play: {
              show: 4,
              size: 'large',
            },
            next: 4,
            rotateLeft: 4,
            rotateRight: 4,
            flipHorizontal: 4,
            flipVertical: 4,
          },
        });
      },
    });
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem('Admin-Token'),
      };
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);
      // 获取政策法规类型
      METHODS.handleGetPoliciesType();
      //获取数据
      METHODS.handleGetData();

      METHODS.getDocx();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
      getItemtoken,
      STORE,
      config,
      ROUTE,
      sessionRead,
      docxFile,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
.page {
  
  // margin: 40px 30px;
  // overflow: hidden !important;
  .title {
    margin-bottom: 20px;
  }
  .info {
    color: #a9a9a9;
    font-size: 14px;
    span {
      margin-right: 20px;
    }
  }

  .el-icon-download {
    font-size: 26px;
    color: #cbcbcb;
    padding: 0px 5px;
    cursor: pointer;
    &:hover {
      color: #1a8adb;
      transform: scale(1.2, 1.2);
    }
  }
}
.button {
  margin-top: 10px;
  float: right;
}
/deep/ .docx-wrapper {
  box-shadow: 0px 0px 10px 0px rgb(128, 128, 128);
  border-radius: 6px;
}
</style>
