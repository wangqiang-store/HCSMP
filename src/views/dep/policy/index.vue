<template>
  <!-- 政策法规档案列表页面 -->
  <el-row class="page container">
    <!-- 政府 -->
    <el-col :span="24">
      <el-row>
        <!-- 显示法规类型 -->
        <el-col :span="24" class="d_flex d_flex_sb">
          <div class="list mb-10">
            <ul class="d_flex">
              <li
                v-for="(item, index) in pageList"
                :key="index"
                :class="{ active: currentIndex == index }"
                @click="handleClickList(item.value, index)"
              >
                {{ item.name }}
              </li>
              <div class="line"></div>
            </ul>
          </div>
        </el-col>

        <!-- 添加和搜索 -->
        <el-col :span="24" class="d_flex d_flex_sb search">
          <el-button
            v-for="(item, index) in titleList"
            :key="index"
            type="primary"
            @click="handleCreate(index + 1)"
            v-show="currentIndex == index && showBtnList.includes('create')"
            ><i class="el-icon-plus mr-5"></i>添加{{ item }}</el-button
          >

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

        <!-- 显示表格数据 -->
        <el-col :span="24" class="mt-10" v-loading="loading">
          <ul class="dataList" v-if="listData.length > 0">
            <li
              v-for="(item, index) in listData"
              :key="index"
              @click="handleGoDetail(item)"
            >
              <el-card>
                <div class="d_flex d_flex_sb">
                  <div>{{ index + 1 }}. {{ item.title }}</div>
                  <div>
                    {{
                      item.createTime
                        .replace("/", "-")
                        .replace("/", "-")
                        .slice(0, 16)
                    }}
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
          <el-empty :image-size="200" v-else></el-empty>

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
            :title="dialogTitle"
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
              class="demo-ruleForm"
            >
              <el-form-item label="名称" prop="title">
                <el-input
                  type="text"
                  v-model="dialogFormData.title"
                  autocomplete="off"
                  style="width:80%; display：inline-block"
                >
                </el-input>
              </el-form-item>

              <el-form-item label="文件" prop="fileName">
                <div class="d_flex" style="line-height: 40px">
                  <el-input
                    style="width:80%; display：inline-block;vertical-align:middle"
                    v-model="dialogFormData.fileName"
                    autocomplete="off"
                    :disabled="true"
                    class="uploadInput"
                  >
                  </el-input>
                  <!-- /file/upload -->
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
                      >浏览</el-button
                    >
                  </el-upload>
                </div>
                <!-- <el-progress v-show="imgFlag == true" :text-inside="true" type="circle"  status="success" :percentage="percent" :width="30"  style="margin: 20px 0 0 30px"></el-progress>
                <div v-show="imgFlag == true" style="color:red" >上传中,请勿操作</div> -->
                <div class="el-upload__tip">只能上传docx/pdf格式文件</div>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="handleCancel">取 消</el-button>
                <el-button type="primary" @click="handleConfirm"
                  >确 定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
    <!-- 企业 -->
    <!-- <el-col :span="24" v-else>
      <el-empty description="无访问页面权限"></el-empty>
    </el-col> -->
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
  ref,
} from "vue";
import ElePagination from "@/components/elePagination/index.vue";
import {
  currentChange,
  getByKey,
  RES_SUCCESS,
  sizeChange,
} from "@/api/common/common";
import { filterTime } from "@/utils/filtration";
import {
  getPagePolicies,
  createPolicies,
  updatePolicies,
  deletePolicies,
} from "@/api/dep/policy";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  components: {
    ElePagination,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      // 显示列表
      pageList: [],
      titleList: [
        "政策法规",
        "行政法规",
        "地方性法规",
        "部门规章",
        "政策性文件",
      ],
      currentIndex: 0,
      date: null,
      pagingParams: {
        limit: 10,
        page: 1,
        type: 1,
        yearly: "",
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        type: 1,
        yearly: "",
      },
      //表格
      loading: false,
      listData: [],

      total: 0,
      dialogVisible: false,
      dialogTitle: "",
      dialogFormData: {
        title: "",
        fileId: "",
        fileName: "",
        type: "",
        creatorName: STORE.state.user.username,
        creator: STORE.state.user.personnel.id,
      },
      dialogFormDataCopy: {
        title: "",
        fileId: "",
        fileName: "",
        type: "",
        creatorName: STORE.state.user.username,
        creator: STORE.state.user.personnel.id,
      },
      rules: {
        title: [{ required: true, message: "此为必填项", trigger: "blur" }],
        fileName: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },
      // imgFlag:false,
      // percent:0,
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        getPagePolicies(pagingParams)
          .then((res) => {
            if (res.data.code == RES_SUCCESS) {
              DATA.loading = false;
              DATA.listData = res.data.data.records;
              DATA.total = res.data.data.total;
            }
          })
          .catch(() => {});
      },

      // 获取政策法规类型
      handleGetPoliciesType: async () => {
        let { data } = await getByKey({
          key: "t_policies_and_regulations_type",
        });
        if (data.code === RES_SUCCESS) {
          DATA.pageList = data.data;
        }
      },

      // 点击列表
      handleClickList: (type: Number, index: Number) => {
        //年份显示恢复默认
        DATA.date = null;

        DATA.currentIndex = index;
        DATA.pagingParams.page = 1;
        DATA.pagingParams.type = type;

        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.type = type;
        METHODS.handleGetPagingData(DATA.pagingParams); //获取数据
      },

      // 改变年份获取数据
      handleChangeYear: (val: any) => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.yearly = !val
          ? undefined
          : Number(new Date(val).getFullYear());
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },

      // 添加按钮
      handleCreate: (index: number) => {
        DATA.dialogFormData = Object.assign({}, DATA.dialogFormDataCopy);
        DATA.dialogVisible = true;
        DATA.dialogTitle = "添加" + DATA.titleList[index - 1];

        DATA.dialogFormData.type = index;
      },

      //点击列表文件
      handleGoDetail: async (row: any) => {
        ROUTER.push({
          name: "fileDetails",
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
        sessionStorage.setItem(
          "policyDetail",
          JSON.stringify({ ...row, showBtnList: showBtnList.value })
        );
      },

      //删除数据
      handleDelete: (row: any) => {
        proxy
          .$confirm("是否确定删除该文件?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(async () => {
            deletePolicies({ id: row.id })
              .then((res) => {
                if (res.data.code === RES_SUCCESS) {
                  proxy.$message.success("删除成功");
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
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].indexOf(file.type) == -1
        ) {
          proxy.$message.error("请上传docx/pdf正确格式");
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
        proxy.$refs["formRef"].clearValidate();
      },

      // 确认按钮
      handleConfirm: () => {
        proxy.$refs["formRef"]
          .validate()
          .then((valid: boolean) => {
            if (valid) {
              createPolicies(DATA.dialogFormData).then((res) => {
                if (res.data.code == RES_SUCCESS) {
                  proxy.$message.success("添加成功");
                  DATA.dialogVisible = false;
                  DATA.pagingParams.page = 1;
                  DATA.pagingParamsCopy.page = 1;
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
        Authorization: localStorage.getItem("Admin-Token"),
      };
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);

      // 获取政策法规类型
      METHODS.handleGetPoliciesType();

      //获取分页数据
      METHODS.handleGetPagingData(DATA.pagingParams);

      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
      STORE,
      getItemtoken,
      showBtnList,
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

  .search {
    padding: 0 20px 0 20px;
    .el-button {
      margin-left: 0px;
      margin-top: 10px;
    }
  }

  // 列表类型
  .list {
    position: relative;
    width: 100%;
    ul {
      li {
        padding-bottom: 10px;
        margin-right: 30px;
        font-size: 14px;
        width: 80px;
        text-align: center;
        &:hover {
          cursor: pointer;
          color: $themeColor;
        }
        &:nth-child(5) {
          margin-right: 0;
        }
      }
      .active {
        //   padding-bottom: 5px;
        color: #409eff;
        border-bottom: 2px solid #409eff;
        z-index: 99;
      }
    }
    .line {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      border-bottom: 2px solid #e0e0e0;
    }
  }

  // 主要数据列表显示
  .dataList {
    padding: 10px 20px;
    li {
      font-size: 14px;
      // padding: 2px 2px;
      margin-bottom: 14px;
      cursor: pointer;
      color: #333;
      &:hover {
        box-shadow: 0 0 10px 1px #c9e1ec;
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
}

.uploadInput {
  margin-right: 10px;
}
</style>
