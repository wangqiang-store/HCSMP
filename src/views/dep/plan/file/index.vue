<template>
  <!-- 年度计划 - 文化tab页面 -->
  <el-row>
    <!-- 添加和搜索 -->
    <el-col
      :span="24"
      class="d_flex d_flex_sb search"
    >
      <el-button
        @click="handleCreate"
        type="primary"
        v-if="showBtnList.includes('create')"
      ><i class="el-icon-plus mr-5"></i>添加文件</el-button>
      <div v-else></div>
      <div>
        <el-date-picker
          class="mr-10"
          v-model="date"
          type="year"
          prefix-icon="el-icon-time"
          placeholder="请选择年份"
          :disabled-date="disabledDate"
          @change="(val) => handleChangeYear(val)"
        >
        </el-date-picker>
      </div>
    </el-col>

    <!-- 表格列表 -->
    <el-col
      :span="24"
      class="mt-10"
      v-loading="loading"
    >
      <ul
        class="dataList"
        v-if="listData.length > 0"
      >
        <li
          v-for="(item, index) in listData"
          :key="index"
          @click="handleGoDetail(item)"
        >
          <el-card>
            <div class="d_flex d_flex_sb">
              <div>{{ index + 1 }}. {{ item.fileName }}</div>
              <div>
                {{ item.createTime.replace(/\//g, "-").slice(0, 16) }}
                <i
                  v-show="showBtnList.includes('delete')"
                  @click.stop="handleDelete(item)"
                  class="el-icon-delete"
                ></i>
              </div>
            </div>
          </el-card>

        </li>
      </ul>
      <el-empty
        :image-size="200"
        v-else
      ></el-empty>

      <!-- 分页 -->
      <ele-pagination
        :total="total"
        :currentPage="pagingParamsCopy.page"
        @handleCurrentChange="
          (val) =>
            handleCurrentChange(
              val,
              pagingParams,
              pagingParamsCopy,
              handleGetPagingData
            )
        "
        @handleSizeChange="
          (val) =>
            handleSizeChange(
              val,
              pagingParams,
              pagingParamsCopy,
              handleGetPagingData,
              total
            )
        "
      ></ele-pagination>
    </el-col>

    <!-- 添加模态框 -->
    <el-col :span="24">
      <el-dialog
        title="添加监督检查文件"
        v-model="dialogVisible"
        :before-close="handleCancel"
        width="30%"
      >
        <el-form
          :model="dialogFormData"
          status-icon
          :rules="rules"
          ref="formRef"
          label-width="60px"
        >
          <el-form-item
            label="文件"
            prop="fileName"
          >
            <div
              class="d_flex"
              style="line-height: 40px"
            >
              <el-input
                style="width:80%; display：inline-block;vertical-align:middle"
                v-model="dialogFormData.fileName"
                autocomplete="off"
                :disabled="true"
                class="uploadInput"
              >
              </el-input>
              <el-upload
                class="upload-demo"
                style="display：inline-block;vertical-align:middle"
                action="/file/upload"
                :headers="getItemtoken"
                :before-upload="beforeUpload"
                :on-success="handleUploadSuccess"
                :show-file-list="false"
              >
                <el-button
                  size="small"
                  type="primary"
                  style="margin-bottom: 5px"
                >浏览</el-button>
              </el-upload>
            </div>
            <div class="el-upload__tip">
              只能上传docx/pdf格式文件, 并且只能上传一份
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
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
  computed,
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import ElePagination from '@/components/elePagination/index.vue';
import {
  currentChange,
  getByKey,
  RES_SUCCESS,
  sizeChange,
} from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
import {
  getYearFilePage,
  createYearFile,
  deleteYearFile,
} from '@/api/dep/plan';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  components: {
    ElePagination,
  },
  props: {
    showBtnList: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();

    let DATA: any = reactive({
      // 显示列表
      currentIndex: 0,
      date: new Date(),
      pagingParams: {
        limit: 10,
        page: 1,
        yearly: '',
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        yearly: '',
      },
      //表格
      loading: false,
      listData: [],

      total: 0,
      dialogVisible: false,
      dialogFormData: {
        fileId: '',
        fileName: '',
        creatorName: STORE.state.user.username,
        creator: STORE.state.user.personnel.id,
      },
      dialogFormDataCopy: {
        fileId: '',
        fileName: '',
        creatorName: STORE.state.user.username,
        creator: STORE.state.user.personnel.id,
      },
      rules: {
        fileName: [{ required: true, message: '此为必填项', trigger: 'blur' }],
      },
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (DATA.date) {
          pagingParams.yearly = new Date(DATA.date).getFullYear();
        }

        let { data } = await getYearFilePage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.listData = data.data.records;
          DATA.total = data.data.total;
        }
      },

      // 改变年份获取数据
      handleChangeYear: (val: any) => {
        DATA.pagingParams = Object.assign({}, DATA.pagingParamsCopy);
        DATA.pagingParams.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParams); //获取数据
      },

      // 添加按钮
      handleCreate: (index: number) => {
        DATA.dialogFormData = Object.assign({}, DATA.dialogFormDataCopy);
        DATA.dialogVisible = true;
      },

      //点击列表文件
      handleGoDetail: (row: any) => {
        ROUTER.push({
          name: 'planDetails',
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
        sessionStorage.setItem(
          'planDetails',
          JSON.stringify({ ...row, showBtnList: props.showBtnList })
        );
      },

      //删除数据
      handleDelete: (row: any) => {
        proxy
          .$confirm('是否确定删除该文件?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          .then(async () => {
            deleteYearFile({ id: row.id })
              .then((res) => {
                if (res.data.code === RES_SUCCESS) {
                  proxy.$message.success('删除成功');
                  // 刷新数据
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
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

      //弹框取消按钮
      handleCancel: () => {
        DATA.dialogVisible = false;
        proxy.$refs['formRef'].clearValidate();
      },

      // 确认按钮
      handleConfirm: () => {
        proxy.$refs['formRef']
          .validate()
          .then((valid: boolean) => {
            if (valid) {
              createYearFile(DATA.dialogFormData).then((res) => {
                if (res.data.code == RES_SUCCESS) {
                  proxy.$message.success('添加成功');
                  DATA.dialogVisible = false;
                  DATA.pagingParams.page = 1;
                  METHODS.handleGetPagingData(DATA.pagingParams); //获取数据
                }
              });
            }
          })
          .catch((err: any) => {});
        // 添加请求
      },

      // 切换分页页面
      handleCurrentChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any
      ) => {
        currentChange(val, pagingParams, pagingParamsCopy, handleGetPagingData);
      },
      // 切换表格显示个数
      handleSizeChange: (
        val: number,
        pagingParams: any,
        pagingParamsCopy: any,
        handleGetPagingData: any,
        total: number
      ) => {
        sizeChange(
          val,
          pagingParams,
          pagingParamsCopy,
          handleGetPagingData,
          total
        );
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

      //获取分页数据
      METHODS.handleGetPagingData(DATA.pagingParams);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
      STORE,
      getItemtoken,
    };
  },
});
</script>
<style scoped lang="scss">
.search {
  padding: 0 20px 0 20px;
  .el-button {
    margin-left: 0px;
    margin-top: 10px;
  }
}

//
.dataList {
  padding: 10px 20px;
  li {
    //   margin-bottom: 16px;
    font-size: 14px;
    // padding: 10px 0;
    margin-bottom: 14px;
    cursor: pointer;
    color: #333;
    &:hover {
      box-shadow:0 0 10px 1px #c9e1ec ;
      // background: #e8f5fb;
    }
    //删除图标
    i {
      margin: 0 10px;
      color: #fb6363;
      font-size: 18px;
      padding: 0 10px;
    }
  }
}

.uploadInput {
  margin-right: 10px;
}
</style>
