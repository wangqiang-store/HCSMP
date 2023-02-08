<template>
  <!-- 隐患排查页面 -->
  <el-row class="container">
    <el-col
      :span="24"
      
    >
      <el-row>
        <!-- 添加/搜索 -->
        <el-col
          :span="24"
          class="d_flex mb-10"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="showBtnList.includes('create')"
          ><i class="el-icon-circle-plus-outline mr-5"></i>添加隐患排查
          </el-button>
          <div>
            <el-select
              v-model="pagingParams.treatmentMeasures"
              placeholder="处置措施类型"
              class="mr-10"
              clearable
            >
              <el-option
                v-for="(item, index) in measuresOption"
                :key="index"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请输入企业名称"
              v-model="pagingParams.content"
              style="width: 300px"
              class="mr-10"
              clearable
            ></el-input>
            <el-button
              type="primary"
              @click="handleSearch"
            ><i class="el-icon-search mr-5"></i>搜索</el-button>
          </div>
        </el-col>

        <!-- 快速定位 表格显示 备注  分页 -->
        <el-col
          :span="24"
          class="mt-10"
          v-loading="loading"
        >
          <QuickPosition @handleClickTwon="handleClickTwon" />

          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :iconList="iconList"
            :isborder="true"
            @handleBtnEvent="handleBtnEvent"
          ></ele-table>

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
      </el-row>
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
  ref,
  toRefs,
  watch,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import QuickPosition from '@/components/quickPosition/index.vue';
import Company from '@/views/ent/company/index.vue';
import {
  currentChange,
  RES_SUCCESS,
  sizeChange,
  getByKey,
} from '@/api/common/common';
import { getDangerCheckPage, deleteDangerCheckInfo } from '@/api/trouble';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    QuickPosition,
    Company,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      pagingParams: {
        limit: 10,
        page: 1,
        content: '',
        townCode: '',
        treatmentMeasures: '',
        companyId: undefined,
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        content: '',
        townCode: '',
        treatmentMeasures: '',
        companyId: undefined,
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
          width: 80,
        },
        {
          label: '行政区域',
          type: 'text',
          prop: 'townName',
        },
        {
          label: '检查企业',
          type: 'text',
          prop: 'companyName',
          width: 350,
        },
        {
          label: '检查人员',
          type: 'text',
          prop: 'personnelNames',
        },
        {
          label: '隐患及问题',
          type: 'text',
          prop: 'problem',
        },
        {
          label: '处置措施',
          type: 'text',
          prop: 'treatmentMeasures',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            let val: any = [];
            row.treatmentMeasures.split(',').forEach((element: any) => {
              for (const item of DATA.measuresOption) {
                if (element == item.value) {
                  val.push(item.name);
                }
              }
            });
            return val.join(' , ');
          },
        },
        {
          label: '创建时间',
          type: 'text',
          prop: 'createTime',
          formatter: (row: any) => {
            return row.createTime ? row.createTime.replace(/\//g, '-') : '';
          },
        },
        {
          label: '操作',
          type: 'iconHandle',
          width: 300,
        },
      ],
      iconList: [],
      iconLists: [],
      total: 0,

      // 搜索项下拉框
      measuresOption: [],
    });
    let METHODS = reactive({
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        }
        let { data } = await getDangerCheckPage(pagingParams);
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

      // 点击快速定位
      handleClickTwon: (code: number) => {
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.content = DATA.pagingParams.content;
        DATA.pagingParams.townCode = code;
        DATA.pagingParamsCopy.townCode = code;
        METHODS.handleGetPagingData({
          ...DATA.pagingParamsCopy,
          townCode: code,
        });
      },

      // 点击添加
      handleCreate: async () => {
        await STORE.commit('setCheckInfo', {
          companyId: null,
          personnel: null,
          hiddenDangerExists: null,
          hiddenDangerElimination: null,
          problem: '',
          treatmentMeasures: null,
          isRectification: false,
          specificTreatment: '',
          remark: '',
        });
        ROUTER.push({
          name: 'checkInfo',
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
          },
        });
      },

      // 表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check1':
            await STORE.commit('setCompanyInfo', {
              type: row.companyType,
              companyId: row.companyId,
            });
            await STORE.commit('setTitle', '企业档案管理');
            if (row.companyType == 4) {
              await STORE.commit('setTwoTitle', '工贸行业管理');
              ROUTER.push({
                name: 'tradeDetails',
                params: {
                  // title: ROUTE.meta.title,
                },
              });
            } else {
              await STORE.commit('setTwoTitle', '非煤矿山企业管理');
              ROUTER.push({
                name: 'companyDetails',
                params: {
                  // title: ROUTE.meta.title,
                },
              });
            }
            break;
          case 'check2':
            let val: any = [];
            // 对处置措施的处理
            row.treatmentMeasures.split(',').forEach((element: any) => {
              for (const item of DATA.measuresOption) {
                if (element == item.value) {
                  val.push(item.name);
                }
              }
            });
            row.treatmentMeasures = val.join(' , ');

            await STORE.commit('setCheckInfo', row);
            ROUTER.push({
              name: 'checkDetails',
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case 'edit':
            await STORE.commit('setCheckInfo', row);
            ROUTER.push({
              name: 'checkInfo',
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该隐患排查?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteDangerCheckInfo({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '删除成功',
                    type: 'success',
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },

      // 获取 处理措施类型
      handleGetMeasures: async () => {
        let { data } = await getByKey({ key: 't_treatment_measures_type' });
        if (data.code === RES_SUCCESS) {
          DATA.measuresOption = data.data;
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
      // 获取 处理措施类型
      METHODS.handleGetMeasures();

      METHODS.handleGetPagingData(DATA.pagingParams);
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.iconList = [
        {
          icon: 'icon-chakan',
          handleType: 'check1',
          color: '#a686ba',
          text: '查看企业详情信息',
          isShow: true,
        },
        {
          icon: 'icon-chakan2',
          handleType: 'check2',
          color: '#3fb41b',
          text: '查看隐患排查详情',
          isShow: true,
        },
        {
          icon: 'icon-bianji',
          handleType: 'edit',
          color: '#409eff',
          text: '编辑隐患排查信息',
          isShow: showBtnList.value.includes('edit'),
        },
        {
          icon: 'icon-cha',
          handleType: 'delete',
          text: '删除隐患排查信息',
          color: '#ff5454',
          isShow: showBtnList.value.includes('delete'),
        },
      ];
      DATA.iconLists = [
        {
          icon: 'icon-chakan',
          color: '#a686ba',
          text: '查看企业详情信息',
          isShow: true,
        },
        {
          icon: 'icon-chakan2',
          color: '#3fb41b',
          text: '查看隐患排查详情',
          isShow: true,
        },
        {
          icon: 'icon-bianji',
          color: '#409eff',
          text: '编辑隐患排查信息',
          isShow: showBtnList.value.includes('edit'),
        },
        {
          icon: 'icon-cha',
          text: '删除隐患排查信息',
          color: '#ff5454',
          isShow: showBtnList.value.includes('delete'),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
/deep/.icon-chakan2 {
  font-size: 34px;
}
.icon-chakan2::before {
  font-size: 22px;
}
</style>
