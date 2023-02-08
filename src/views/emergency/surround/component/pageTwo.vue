 <template>
  <!-- 周边基础数据 - 表格2页面 -->
  <el-row>
    <el-col
      :span="24"
      class="mt-10"
      v-loading="loading"
    >
      <!-- 添加 或 搜索 -->
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
          <span>添加企业周边</span>
        </el-button>
        <div class="d_flex">
          <el-input
            placeholder="请输入周边名称或企业名称"
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

      <!-- 快速定位 -->
      <div class="mb-10">
        <span>快速定位 : </span>
        <span
          class="mr-10 twon_item"
          :class="pagingParams.typeId === '' && 'yellow'"
          @click="handleClickMark('')"
        >全部</span>
        <span
          v-for="(item, index) in options.peripheralTypeId"
          :key="index"
          class="mr-10 twon_item"
          @click="handleClickMark(item.id)"
          :class="pagingParams.typeId === item.id && 'yellow'"
        >{{ item.peripheral }}</span>
      </div>

      <!-- 表格 -->
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :iconList="iconList"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
      >
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

      <!-- 查看周边情况信息 - 模态框 -->
      <el-col :span="24">
        <el-dialog
          title="查看周边情况信息"
          v-model="checkVisible"
          width="45%"
        >
          <EleDescriptions
            :column="4"
            :border="true"
            :renderDescriptionsArr="renderDescriptionsArr"
            :listData="checkData"
          ></EleDescriptions>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="checkVisible = false">取 消</el-button>
              <el-button
                type="primary"
                @click="checkVisible = false"
              >确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-col>

      <!-- 添加/编辑 - 模态框 -->
      <el-col :span="24">
        <el-dialog
          :title="addOrEditTitle"
          v-model="addOrEditVisible"
          width="35%"
          :before-close="handleCancel"
          top="8vh"
        >
          <ele-form
            :formData="formData"
            :renderFormArr="renderFormArr"
            :rules="rules"
            :options="options"
            ref="formRef"
          >
            <!-- 经纬度按钮 -->
            <template #button>
              <el-button
                class="mr-10"
                type="primary"
                @click="handleMapButton"
                size="small"
              >采集坐标</el-button>
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

      <!-- 地图模态框 -->
      <el-col :span="24">
        <el-dialog
          v-model="mapVisible"
          v-if="mapVisible"
          width="80%"
          top="2vh"
        >
          <Amap
            class="amap"
            @getlnglat="getlnglat"
            module="companyInfo"
            :isShowSearch="true"
            placeholder="可搜索具体位置"
            :latitude="+latitude"
            :longitude="+longitude"
            AmapId="coordinate"
          />
          <el-descriptions
            class="margin-top mt-10"
            :column="1"
            size="small"
            border
          >
            <el-descriptions-item
              label-align="center"
              align="center"
            >
              <template #label>
                <i class="el-icon-map-location"></i>
                经度
              </template>
              <el-tag type="warning">
                {{ longitude }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item
              label-align="center"
              align="center"
            >
              <template #label>
                <i class="el-icon-map-location"></i>
                纬度
              </template>
              <el-tag type="warning">
                {{ latitude }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <template #footer>
            <span class="dialog-footer">
              <el-button
                @click="handleMapCancel"
                size="small"
              >取 消</el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleMapSure"
              >确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-col>

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
  </el-row>
</template>
<script lang="ts">
import {
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
import Amap from '@/components/amap/index.vue';
import EleDescriptions from '@/components/eleDescriptions/index.vue';
import { currentChange, RES_SUCCESS, sizeChange } from '@/api/common/common';
import {
  getAroundInformationPage,
  getAroundInformationByCompany,
  createAroundInformationInfo,
  deleteAroundInformationInfo,
  updateAroundInformationInfo,
  getAllPeripheralType,
} from '@/api/emergency/surround';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    EleForm,
    Amap,
    EleDescriptions,
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
    // 规则
    let validateLongitude = (rule: any, value: number, callback: any) => {
      let val = String(value);
      let numVal = Math.abs(value);
      if (String(numVal) == 'NaN') {
        callback('请输入数字格式');
      } else if (numVal > 180) {
        callback('经度范围是0 - ±180°');
      } else if (val.includes('.')) {
        let arr = val.split('.');
        if (arr[1].length > 10) {
          DATA.formData.longitude = Number(arr[0] + '.' + arr[1].slice(0, 10));
          callback();
        }
        callback();
      } else {
        callback();
      }
    };
    let validateLatitude = (rule: any, value: number, callback: any) => {
      let val = String(value);
      let numVal = Math.abs(value);
      if (String(numVal) == 'NaN') {
        callback('请输入数字格式');
      } else if (numVal > 90) {
        callback('纬度范围是0 - ±90°');
      } else if (val.includes('.')) {
        let arr = val.split('.');
        if (arr[1].length > 10) {
          DATA.formData.latitude = Number(arr[0] + '.' + arr[1].slice(0, 10));
          callback();
        }
        callback();
      } else {
        callback();
      }
    };
    let DATA: any = reactive({
      pagingParams: {
        limit: 10,
        page: 1,
        content: '',
        typeId: '',
        companyId: undefined,
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: '',
        typeId: '',
        companyId: undefined,
      },

      //表格数据
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
          label: '企业名称',
          type: 'text',
          prop: 'companyName',
          width: 350,
        },
        {
          label: '周边名称',
          type: 'text',
          prop: 'aroundName',
        },
        {
          label: '周边类型',
          type: 'text',
          prop: 'peripheralTypeId',
          formatter: (row: any) => {
            for (const item of DATA.options.peripheralTypeId) {
              if (row.peripheralTypeId == item.id) {
                return item.peripheral;
              }
            }
          },
        },
        {
          label: '联系方式',
          type: 'text',
          prop: 'contactInformation',
        },
        {
          label: '总机',
          type: 'text',
          prop: 'switchboard',
        },
        {
          label: '描述',
          type: 'text',
          prop: 'informationDescribe',
        },
        {
          label: '操作',
          type: 'iconHandle',
          width: 300,
        },
      ],
      iconList: [],
      iconLists: [],

      // 查看周边情况信息数据
      checkVisible: false,
      renderDescriptionsArr: [
        {
          label: '企业名称',
          span: 2,
          prop: 'companyName',
        },
        {
          label: '周边名称',
          span: 2,
          prop: 'aroundName',
        },
        {
          label: '周边类型',
          span: 2,
          prop: 'peripheralTypeId',
        },
        {
          label: '经度',
          span: 2,
          prop: 'longitude',
        },
        {
          label: '纬度',
          span: 2,
          prop: 'latitude',
        },
        {
          label: '总机',
          span: 2,
          prop: 'switchboard',
        },
        {
          label: '联系方式',
          span: 4,
          prop: 'contactInformation',
        },
        {
          label: '描述',
          span: 4,
          prop: 'informationDescribe',
        },
      ],
      checkData: {},

      // 周边信息数据 - 模态框
      addOrEditVisible: false,
      addOrEditTitle: '',
      latitude: '',
      longitude: '',
      formData: {
        companyId: '',
        aroundName: '',
        peripheralTypeId: null,
        contactInformation: '',
        switchboard: '',
        informationDescribe: '',
        latitude: '',
        longitude: '',
      },
      formDataCopy: {
        companyId: '',
        aroundName: '',
        peripheralTypeId: null,
        contactInformation: '',
        switchboard: '',
        informationDescribe: '',
        latitude: '',
        longitude: '',
      },
      renderFormArr: [
        {
          label: '企业名称',
          type: 'select',
          prop: 'companyId',
          filterable: true,
          placeholder: '可进行输入搜索',
          style: {
            width: '95%',
          },
          value: 'id',
          title: 'name',
        },
        {
          label: '周边名称',
          prop: 'aroundName',
          type: 'input',
          style: {
            width: '95%',
          },
        },
        {
          label: '周边类型',
          type: 'select',
          prop: 'peripheralTypeId',
          filterable: true,
          style: {
            width: '95%',
          },
          value: 'id',
          title: 'peripheral',
        },
        {
          label: '联系方式',
          type: 'input',
          inputType: 'textarea',
          prop: 'contactInformation',
          style: {
            width: '95%',
          },
        },
        {
          label: '经度',
          type: 'input',
          prop: 'longitude',
          style: {
            width: '95%',
          },
        },
        {
          label: '纬度',
          type: 'input',
          prop: 'latitude',
          style: {
            width: '95%',
          },
        },
        {
          label: '',
          type: 'slot',
          slotName: 'button',
          style: {
            width: '95%',
          },
        },
        {
          label: '总机',
          prop: 'switchboard',
          type: 'input',
          style: {
            width: '95%',
          },
        },
        {
          label: '描述',
          type: 'input',
          inputType: 'textarea',
          prop: 'informationDescribe',
          style: {
            width: '95%',
          },
        },
      ],
      rules: {
        companyId: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        aroundName: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        peripheralTypeId: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        contactInformation: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        longitude: [
          { required: true, message: '此为必填项', trigger: 'blur' },
          { validator: validateLongitude },
        ],
        latitude: [
          { required: true, message: '此为必填项', trigger: 'blur' },
          { validator: validateLatitude, trigger: 'change' },
        ],
        switchboard: [
          {
            pattern: /^(\d{3}-\d{7,8}|\d{4}-\d{7,8})$/,
            message: '请输入固话格式',
          },
        ],
      },
      options: {
        companyId: STORE.state.globalData.companyList,
        peripheralTypeId: [], //所有的周边类型列表
      },

      mapVisible: false,

      total: 0,
    });
    let METHODS = reactive({
      //   获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }

        let { data } = await getAroundInformationPage(pagingParams);
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

      // 点击添加
      handleCreate: () => {
        DATA.addOrEditTitle = '添加周边信息';
        DATA.addOrEditVisible = true;
        DATA.formData = Object.assign({}, DATA.formDataCopy);
      },

      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check2':
            // let { data } = await getAroundInformationByCompany({companyId:row.companyId});
            // if (data.code === RES_SUCCESS) {
            //   console.log("企业",data);
            // }

            DATA.checkVisible = true;
            DATA.checkData = Object.assign({}, row);
            for (const item of DATA.options.peripheralTypeId) {
              if (DATA.checkData.peripheralTypeId == item.id) {
                DATA.checkData.peripheralTypeId = item.peripheral;
              }
            }
            break;
          case 'edit':
            DATA.addOrEditTitle = '编辑周边信息';
            DATA.addOrEditVisible = true;
            DATA.formData = Object.assign({}, row);
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该企业周边信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteAroundInformationInfo({
                  id: row.id,
                });
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

      // 点击快速定位
      handleClickMark: (value: any) => {
        DATA.pagingParams.page = 1;
        DATA.pagingParams.typeId = value;
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.typeId = value;

        // 刷新分页数据
        METHODS.handleGetPagingData({
          ...DATA.pagingParams,
        });
      },

      //模态取消按钮
      handleCancel: () => {
        DATA.addOrEditVisible = false;
        proxy.$refs['formRef'].resetForm();
      },

      // 确认添加编辑
      handleConfirm: () => {
        proxy.$refs['formRef']
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              // 发起请求
              if (DATA.formData.id) {
                let { data } = await updateAroundInformationInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  proxy.$message.success('编辑成功');
                  DATA.addOrEditVisible = false;
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              } else {
                let { data } = await createAroundInformationInfo(DATA.formData);
                if (data.code === RES_SUCCESS) {
                  proxy.$message.success('添加成功');
                  DATA.addOrEditVisible = false;
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              }
            }
          })
          .catch(() => {});
      },

      // 采集坐标
      getlnglat: ({ lng, lat }: any) => {
        DATA.latitude = lat;
        DATA.longitude = lng;
      },
      handleMapButton: () => {
        DATA.latitude = DATA.formData.latitude;
        DATA.longitude = DATA.formData.longitude;
        DATA.mapVisible = true;
      },
      handleMapCancel: () => {
        DATA.mapVisible = false;
      },
      handleMapSure: () => {
        DATA.mapVisible = false;
        DATA.formData.latitude = DATA.latitude;
        DATA.formData.longitude = DATA.longitude;
      },

      //获取所有的周边类型列表
      getAllType: async () => {
        let { data } = await getAllPeripheralType();
        if (data.code === RES_SUCCESS) {
          DATA.options.peripheralTypeId = data.data;
        }
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
    onMounted(() => {
      //获取所有的周边类型列表
      METHODS.getAllType();

      //获取分页数据
      METHODS.handleGetPagingData(DATA.pagingParams);

      DATA.iconList = [
        {
          icon: 'icon-chakan2',
          handleType: 'check2',
          color: '#3fb41b',
          text: '查看周边情况信息',
          isShow: true,
        },
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
          icon: 'icon-chakan2',
          color: '#3fb41b',
          text: '查看周边情况信息',
          isShow: true,
        },
        {
          icon: 'icon-bianji',
          color: '#409eff',
          text: '编辑周边情况',
          isShow: props.showBtnList.includes('edit'),
        },
        {
          icon: 'icon-cha',
          text: '删除周边情况',
          color: '#ff5454',
          isShow: props.showBtnList.includes('delete'),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
.amap {
  width: 100%;
  height: 650px;
}
/deep/ textarea {
  height: 100px !important;
  resize: none;
  border: 1px solid #dcdfe6;
  overflow-y: scroll;
}

/deep/ .el-table .cell {
  text-align: center;
  white-space: pre-line; /*保留换行符*/
}

/deep/.icon-chakan2 {
  font-size: 32px;
}
.icon-chakan2::before {
  font-size: 20px;
}

// 描述列表样式
/deep/ table td.is-bordered-label.is-left {
  width: 24%;
  text-align: center;
  background: #f3f5fa;
  font-weight: 700;
  color: black;
}
/deep/table td.el-descriptions__content.is-left {
  text-align: center;
  color: #333333;
}

.twon_item {
  color: #0099cc;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
.yellow {
  color: #b19a66;
}

/deep/ .el-form-item__error {
  font-size: 12px;
  line-height: 1;
  padding-top: 2px !important;
  position: absolute;
}
/deep/.el-form-item {
  margin-bottom: 18px;
}
/deep/.el-dialog__body {
  padding-bottom: 18px;
}
/deep/#tipinput {
  border: 3px solid red;
  border-color: #eeece7;
  outline: none !important;
}
</style>
