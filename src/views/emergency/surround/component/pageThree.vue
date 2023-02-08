 <template>
  <!-- 周边基础数据 - 表格3页面 -->
  <el-row>
    <!-- 显示表格 -->
    <el-col
      :span="24"
      class="mt-10"
    >
      <div
        class="d_flex"
        style="padding-bottom: 20px"
        :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
      >
        <el-button
          @click="handleCreate"
          type="primary"
          v-if="showBtnList.includes('create')"
        >
          <i class="el-icon-circle-plus-outline mr-5"></i>
          <span>添加周边类型</span>
        </el-button>

        <div class="d_flex">
          <el-input
            placeholder="请输入类型名称"
            v-model="pagingParams.content"
            clearable
            class="mr-10"
            style="width: 400px"
          ></el-input>
          <el-button
            type="primary"
            @click="handleSearch"
          >
            <span>搜索</span>
          </el-button>
        </div>
      </div>
      <!-- 表格 -->
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :iconList="iconList"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
      >
        <template #image="row">
          <el-image
            :src="IMG_File + row.row.filePath"
            class="img"
          ></el-image>
        </template>
      </ele-table>
      <!-- 备注 -->
      <div class="mt-10">
        <span
          class="iconfont mr-20"
          v-for="(val, i) of iconLists"
          :key="i"
          :class="val.icon"
          :style="{ color: val.color }"
          style="font-size: 14px"
          v-show="val.isShow"
        >
          <i style="color: #cccccc"> {{ val.text }}</i>
        </span>
      </div>

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

    <!-- 添加/编辑 - 模态框 -->
    <el-col :span="24">
      <el-dialog
        :title="addOrEditTitle"
        v-model="addOrEditVisible"
        width="35%"
        :before-close="handleCancel"
      >
        <ele-form
          :formData="formData"
          :renderFormArr="renderFormArr"
          :rules="rules"
          ref="formRef"
        >
          <!-- 图标上传 -->
          <template #upload>
            <el-upload
              class="upload-demo"
              :action="IMG_URL"
              list-type="picture-card"
              :headers="getItemtoken"
              :auto-upload="false"
              :on-change="handleChangeUpload"
              :on-remove="handleRemove"
              :on-preview="handlePictureCardPreview"
              :file-list="fileList"
              ref="upload"
              multiple
            >
              <i class="el-icon-plus"></i>
              <template #tip>
                <div class="el-upload__tip">注意 : 上传的图片尺寸为30x30px , 并且只能上传单个</div>
              </template>
            </el-upload>
          </template>
        </ele-form>
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

    <!-- 图片剪裁 -->
    <el-dialog
      title="图片剪裁"
      v-model="imgVisible"
      append-to-body
      :before-close="handleImgCancel"
    >
      <div class="cropper-content">
        <div
          class="cropper"
          style="text-align: center"
        >
          <VueCropper
            ref="cropper"
            :img="option.img"
            :outputSize="option.size"
            :outputType="option.outputType"
            :info="true"
            :full="option.full"
            :canMove="option.canMove"
            :canMoveBox="option.canMoveBox"
            :original="option.original"
            :autoCrop="option.autoCrop"
            :fixed="option.fixed"
            :fixedNumber="option.fixedNumber"
            :centerBox="option.centerBox"
            :infoTrue="option.infoTrue"
            :fixedBox="option.fixedBox"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
          />
        </div>
      </div>
      <div class="dialog-footer mt-20">
        <el-button @click="handleImgCancel">取 消</el-button>
        <el-button
          type="primary"
          @click="finish"
        >确认</el-button>
      </div>
    </el-dialog>

    <!-- 图标放大 -->
    <el-dialog
      v-model="dialogImageUrlVisible"
      width="20%"
    >
      <img
        width="100%"
        :src="dialogImageUrl"
        alt=""
      />
    </el-dialog>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import axios from 'axios';
import {
  currentChange,
  IMG_URL,
  IMG_File,
  RES_SUCCESS,
  sizeChange,
} from '@/api/common/common';
import {
  getPeripheralTypePage,
  createPeripheralTypeInfo,
  deletePeripheralTypeInfo,
  updatePeripheralTypeInfo,
} from '@/api/emergency/surround';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
    VueCropper,
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
      pagingParams: {
        limit: 10,
        page: 1,
        content: '',
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: '',
      },

      //表格
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 60,
        },
        {
          label: '类型名称',
          type: 'text',
          prop: 'peripheral',
        },
        {
          label: '图标',
          type: 'slot',
          prop: 'image',
          slotName: 'image',
        },
        {
          label: '操作',
          type: 'iconHandle',
          width: 300,
        },
      ],
      iconList: [],
      iconLists: [],

      // 模态框
      addOrEditTitle: '',
      addOrEditVisible: false,
      formData: {
        peripheral: '',
        fileId: '',
      },
      formDataCopy: {
        peripheral: '',
        fileId: '',
      },
      renderFormArr: [
        {
          label: '周边类型',
          type: 'input',
          prop: 'peripheral',
          style: {
            width: '95%',
          },
        },
        {
          label: '图标',
          type: 'slot',
          slotName: 'upload',
          prop: 'fileId',
          style: {
            width: '95%',
          },
        },
      ],
      rules: {
        peripheral: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        fileId: [{ required: true, message: '此为必填项', trigger: 'blur' }],
      },
      fileList: [],
      // 裁剪组件的基础配置option
      option: {
        img: '', // 裁剪图片的地址
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        canMoveBox: true, // 截图框能否拖动
        autoCropWidth: 30, // 默认生成截图框宽度
        autoCropHeight: 30, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
      fileName: '',
      imgVisible: false, //图片裁剪显示隐藏
      total: 0,

      dialogImageUrlVisible: false, //图标放大
      dialogImageUrl: '',
    });
    let METHODS = reactive({
      handlePictureCardPreview: (file: any) => {
        DATA.dialogImageUrl = file.url;
        DATA.dialogImageUrlVisible = true;
      },
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        // if (STORE.state.user.personnel.unitType !== 1) {
        //   pagingParams.companyId = STORE.state.user.personnel.companyId;
        // }

        let { data } = await getPeripheralTypePage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },

      // 点击搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },

      handleCreate: () => {
        DATA.addOrEditTitle = '添加周边类型';
        DATA.addOrEditVisible = true;
        DATA.fileList = [];
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },

      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.addOrEditVisible = true;
            DATA.addOrEditTitle = '编辑周边类型';
            // 数据处理
            DATA.formData = Object.assign({}, row);
            DATA.fileList = [];
            DATA.fileList.push({
              name: row.fileName,
              url: IMG_File + row.filePath,
            });

            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该周边类型?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deletePeripheralTypeInfo({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  proxy.$message.success('删除成功');
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      //弹框取消按钮
      handleCancel: () => {
        DATA.addOrEditVisible = false;
        proxy.$refs['formRef'].resetForm();
      },

      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs['formRef'].submitForm().then(async (valid: boolean) => {
          if (valid) {
            //发起请求
            if (DATA.formData.id) {
              let { data } = await updatePeripheralTypeInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success('编辑成功');
                DATA.addOrEditVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await createPeripheralTypeInfo(DATA.formData);
              if (data.code === RES_SUCCESS) {
                proxy.$message.success('添加成功');
                DATA.addOrEditVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            }
          }
        });
      },

      handleRemove: (res: any, fileList: any) => {
        DATA.fileList = [];
        DATA.formData.fileId = undefined;
      },

      // 选择图片
      handleChangeUpload(file: any, fileList: any) {
        const isJPG =
          file.raw.type === 'image/jpeg' || file.raw.type === 'image/png';
        if (!isJPG) {
          proxy.$message.error('上传图片只能是 JPG/PNG 格式!');
          return false;
        }

        // 选择上传后将图片地址赋值给裁剪框显示图片
        nextTick(async () => {
          DATA.option.img = URL.createObjectURL(file.raw);
          DATA.loading = false;
          DATA.imgVisible = true;
          DATA.fileName = file.name.split('.')[0];
        });
      },

      // 取消裁剪
      handleImgCancel: () => {
        DATA.imgVisible = false;
        if (DATA.fileList.length > 0) {
          DATA.fileList = [
            { name: DATA.formData.fileName, url: DATA.formData.filePath },
          ];
        } else {
          DATA.fileList = [];
        }
      },

      // 裁剪后确定
      finish() {
        // 获取截图的 blob 数据
        proxy.$refs['cropper'].getCropBlob((blob: any) => {
          DATA.loading = true;
          DATA.imgVisible = false;
          let formData = new FormData();
          formData.append('file', blob, DATA.fileName + '.png');

          axios({
            method: 'post',
            url: IMG_URL,
            data: formData,
            headers: {
              Authorization: localStorage.getItem('Admin-Token'),
            },
          }).then(function (res) {
            if (res.data.code == 200) {
              let item = res.data.data;
              DATA.imgVisible = false;
              DATA.formData.fileId = String(item.id);
              DATA.formData.fileName = item.name;
              DATA.formData.filePath = item.path;
              DATA.fileList = [{ name: item.name, url: item.path }];
            }
          });
        });
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
      METHODS.handleGetPagingData(DATA.pagingParams);
      DATA.iconList = [
        {
          icon: 'icon-bianji',
          handleType: 'edit',
          color: '#409eff',
          text: '编辑周边情况',
          isShow: props.showBtnList.includes('edit'),
        },
        {
          icon: 'icon-cha',
          handleType: 'delete',
          text: '删除周边情况',
          color: '#ff5454',
          isShow: props.showBtnList.includes('delete'),
        },
      ];
      DATA.iconLists = [
        {
          icon: 'icon-bianji',
          color: '#409eff',
          text: '编辑类型信息',
          isShow: props.showBtnList.includes('edit'),
        },
        {
          icon: 'icon-cha',
          text: '删除类型信息',
          color: '#ff5454',
          isShow: props.showBtnList.includes('delete'),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      IMG_File,
      getItemtoken,
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
.cropper-content {
  .cropper {
    width: auto;
    height: 300px;
    img {
      width: 100%;
    }
  }
}

/deep/ .el-dialog__body {
  width: 100%;
  z-index: 9999;
  img {
    width: 100%;
  }
}
/deep/.el-table td{
  padding: 12px 0;
}

/deep/.cell {
  text-align: center !important;
  .el-image{
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
  }
}
/deep/.img {
  display: inline-block !important;
}
</style>
