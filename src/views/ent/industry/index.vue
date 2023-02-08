<template>
  <el-row class="container">
    <!-- 政府 -->
    <el-col
      :span="24"
      v-if="STORE.state.user.personnel.unitType === 1"
      class="container"
    >
      <el-row>
        <el-col
          :span="24"
          class="d_flex d_flex_sb"
          :class="showBtnList.includes('create') ? 'd_flex_sb' : 'd_flex_end'"
        >
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="showBtnList.includes('create')"
          ><i class="el-icon-plus mr-5"></i>添加企业信息</el-button>
          <div>
            <el-input
              placeholder="请输入企业名"
              v-model="pagingParams.content"
              style="width:200px"
              class="mr-10"
              clearable
            ></el-input>
            <el-button
              type="primary"
              @click="handleSearch"
            ><i class="el-icon-search mr-5"></i>搜索</el-button>
          </div>
        </el-col>
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
          <div class="mt-10">
            <span
              class="iconfont mr-10 "
              v-for="(val,i) of iconLists"
              :key="i"
              :class="val.icon"
              :style="{color: val.color}"
              style="font-size:14px"
              v-show="val.isShow"
            >
              <i style="color:#cccccc">{{val.text}}</i>
            </span>
          </div>
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleCurrentChange="(val)=>handleCurrentChange(val,pagingParams,pagingParamsCopy,handleGetPagingData)"
            @handleSizeChange="(val)=>handleSizeChange(val,pagingParams,pagingParamsCopy,handleGetPagingData,total)"
          ></ele-pagination>
        </el-col>
        <el-col :span="24">
          <!-- 风险分级模态框 -->
          <el-dialog
            title="风险分级"
            v-model="riskDialogVisible"
            width="30%"
          >
            <RiskRanking
              @handleChangeRisk="handleChangeRisk"
              :riskLevel="companyInfo.riskLevel"
              :riskList="riskList"
            />
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="riskDialogVisible = false">取 消</el-button>
                <el-button
                  type="primary"
                  @click="handleConfirmRisk"
                >确 定</el-button>
              </span>
            </template>
          </el-dialog>
          <!-- 档案备注模态框 -->
          <el-dialog
            title="档案信息备注"
            v-model="notesDialogVisible"
            width="50%"
          >
            <FileRemark :id="companyInfo.id" />
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
    <!-- 企业 -->
    <el-col
      :span="24"
      v-else
      :style="[4].includes(STORE.state.user.personnel.companyTypeId)"
    >
      <TradeDetails v-if="[4].includes(STORE.state.user.personnel.companyTypeId)" />
      <el-empty
        v-else
        description="没有此类型企业信息"
        :image="require('@/assets/image/zwxx.png')"
      ></el-empty>
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
  ref,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import QuickPosition from '@/components/quickPosition/index.vue';
import RiskRanking from '@/components/riskRanking/index.vue';
import FileRemark from '@/components/fileRemark/index.vue';
import Company from '@/views/ent/company/index.vue';
import Trade from '@/views/ent/createTrade/index.vue';
import TradeDetails from '@/views/ent/tradeDetails/index.vue';
import {
  currentChange,
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
  sizeChange,
} from '@/api/common/common';
import {
  getByGovPage,
  setRiskLevel,
  updateAuthorize,
} from '@/api/ent/noncoalmine';

import { getByTradeDetails } from '@/api/ent/trade';
import { deleteCompany } from '@/api/company/index';

import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    QuickPosition,
    RiskRanking,
    FileRemark,
    Trade,
    Company,
    TradeDetails,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        type: 4,
        townCode: '',
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        type: 4,
        townCode: '',
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
          prop: 'townCodeName',
        },
        {
          label: '企业名称',
          type: 'text',
          prop: 'name',
          width: 350,
        },
        {
          label: '法人代表',
          type: 'text',
          prop: 'legalPerson',
        },
        {
          label: '法人联系方式',
          type: 'text',
          prop: 'legalPhone',
        },
        {
          label: '风险评级',
          type: 'text',
          prop: 'riskLevel',
          formatter: (row: any) => {
            let riskLevel = '';
            DATA.riskList.forEach((item: any) => {
              if (row.riskLevel === null) {
                riskLevel = '未定级';
              } else {
                if (item.value === row.riskLevel) {
                  riskLevel = item.name;
                }
              }
            });
            return riskLevel;
          },
        },
        {
          label: '经济类型',
          type: 'text',
          prop: 'economicTypeName',
        },
        {
          label: '经营范围',
          type: 'text',
          prop: 'businessScope',
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
      townList: [],
      riskDialogVisible: false,
      // 企业信息
      companyInfo: {},
      notesDialogVisible: false,
      // 企业数据
      companyData: {},
      // 风险评级列表
      riskList: [],
    });
    let METHODS = reactive({
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType === 1) {
          // 政府人员获取的数据
          let { data } = await getByGovPage(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
          }
        }
      },
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
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
      handleCreate: async () => {
        await STORE.commit('setCompanyInfo', {
          type: null,
          companyId: null,
        });
        ROUTER.push({
          name: 'createTrade',
          params: {
            title: ROUTE.meta.title,
            twoTitle: ROUTE.meta.twoTitle,
            // isEdit: 0,
            // type: 4,
          },
        });
        sessionStorage.removeItem('companyId');
      },
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'check':
            await STORE.commit('setCompanyInfo', {
              type: row.type,
              companyId: row.id,
            });
            ROUTER.push({
              name: 'tradeDetails',
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            break;
          case 'edit':
            await STORE.commit('setCompanyInfo', {
              type: row.type,
              companyId: row.id,
            });
            ROUTER.push({
              name: 'createTrade',
              params: {
                title: ROUTE.meta.title,
                twoTitle: ROUTE.meta.twoTitle,
              },
            });
            sessionStorage.setItem(
              'companyId',
              STORE.state.globalData.companyInfo.companyId
            );
            break;
          case 'warning':
            DATA.riskDialogVisible = true;
            DATA.companyInfo = Object.assign({}, row);
            break;
          case 'auth':
            let title = '';
            if (row.isAuthorize) {
              title = '是否取消该企业授权编辑档案信息权限?';
            } else {
              title = '授权该企业编辑档案信息权限?';
            }
            proxy
              .$confirm(title, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              })
              .then(async () => {
                let { data } = await updateAuthorize({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  if (row.isAuthorize) {
                    ElMessage({
                      message: '取消该企业授权编辑档案信息权限成功',
                      type: 'success',
                    });
                  } else {
                    ElMessage({
                      message: '授权编辑档案信息权限成功',
                      type: 'success',
                    });
                  }
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          case 'grade':
            DATA.notesDialogVisible = true;
            DATA.companyInfo = Object.assign({}, row);
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该企业数据?并禁用关联人员和账号', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(async () => {
                let { data } = await deleteCompany({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '删除成功',
                    type: 'success',
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                  STORE.dispatch('handleGetAllCompany');
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      handleChangeRisk: (risk: number) => {
        DATA.companyInfo.riskLevel = risk;
      },
      // 确认风险分级
      handleConfirmRisk: async () => {
        let { data } = await setRiskLevel({
          id: DATA.companyInfo.id,
          value: DATA.companyInfo.riskLevel,
        });
        if (data.code === RES_SUCCESS) {
          DATA.riskDialogVisible = false;
          ElMessage({
            message: '风险分级设置成功',
            type: 'success',
          });
          METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        }
      },
      // 请求获取风险等级
      handleGetRiskList: async () => {
        if (sessionRead('t_risk_level')) {
          DATA.riskList = sessionRead('t_risk_level');
        } else {
          let { data } = await getByKey({ key: 't_risk_level' });
          if (data.code === RES_SUCCESS) {
            DATA.riskList = data.data;
            sessionWrite('t_risk_level', data.data);
          }
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);
      METHODS.handleGetRiskList();
      if (STORE.state.user.personnel.unitType === 2) {
        STORE.commit('setCompanyInfo', {
          type: STORE.state.user.personnel.companyTypeId,
          companyId: STORE.state.user.personnel.companyId,
        });
      }
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.iconList = [
        {
          icon: 'icon-chakan',
          handleType: 'check',
          color: '#a686ba',
          text: '查看企业详细信息',
          isShow: true,
        },
        {
          icon: 'icon-bianji',
          handleType: 'edit',
          color: '#409eff',
          text: '编辑企业信息',
          isShow: showBtnList.value.includes('edit'),
        },
        {
          icon: 'icon-fengxianyuan',
          handleType: 'warning',
          color: '#e6a23c',
          text: '风险分级标注',
          isShow: showBtnList.value.includes('label'),
        },
        {
          handleType: 'auth',
          isShow: showBtnList.value.includes('authorize'),
          condition: (row: any) => {
            let iconObj = {
              icon: '',
              color: '',
              text: '',
            };
            if (row.isAuthorize) {
              iconObj.icon = 'icon-jiesuo';
              iconObj.color = '#49c633';
              iconObj.text = '已授权企业编辑';
            } else {
              iconObj.icon = 'icon-suo2';
              iconObj.color = '#909399';
              iconObj.text = '授权企业编辑';
            }
            return iconObj;
          },
        },
        {
          icon: 'icon-qizi',
          handleType: 'grade',
          text: '档案信息备注',
          color: '#67c23a',
          isShow: showBtnList.value.includes('remark'),
        },
        {
          icon: 'icon-cha',
          handleType: 'delete',
          text: '删除企业信息',
          color: '#ff5454',
          isShow: showBtnList.value.includes('delete'),
        },
      ];
      DATA.iconLists = [
        {
          icon: 'icon-chakan',
          text: '查看企业详细信息',
          color: '#a686ba',
          isShow: true,
        },
        {
          icon: 'icon-bianji',
          text: '编辑企业信息',
          color: '#409eff',
          isShow: showBtnList.value.includes('edit'),
        },
        {
          icon: 'icon-fengxianyuan',
          text: '风险分级标注',
          color: '#e6a23c',
          isShow: showBtnList.value.includes('label'),
        },
        {
          icon: 'icon-suo2',
          text: '未授权企业编辑',
          color: '#909399',
          isShow: showBtnList.value.includes('authorize'),
        },
        {
          icon: 'icon-jiesuo',
          text: '已授权企业编辑',
          color: '#49c633',
          isShow: showBtnList.value.includes('authorize'),
        },
        {
          icon: 'icon-qizi',
          text: '档案信息备注',
          color: '#67c23a',
          isShow: showBtnList.value.includes('remark'),
        },
        {
          icon: 'icon-cha',
          text: '删除企业信息',
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
  padding-top: 10px;
}
</style>
