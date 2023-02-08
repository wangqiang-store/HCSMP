<template>
  <!-- 企业证照到期提醒页面 -->
  <el-row class="container">
    <el-col :span="24">
      <el-row>
        <!-- 搜索 -->
        <el-col
          :span="24"
          class="d_flex d_flex_sb"
        >
          <span></span>
          <div>
            <el-select
              v-model="pagingParams.townCode"
              placeholder="行政地区"
              class="mr-10"
              clearable
            >
              <el-option
                v-for="(item, index) in townList"
                :key="index"
                :label="item.name"
                :value="item.code"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请搜索企业名称或证照类型"
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

        <!-- 表格 -->
        <el-col
          :span="24"
          class="mt-10"
          v-loading="loading"
        >
          <!-- 快速定位 -->
          <div class="mb-10">
            <span class="fast">快速定位 : </span>
            <span
              class="twon_item"
              :class="pagingParams.mark === '' && 'yellow'"
              @click="handleClickMark('')"
            >全部</span>
            <span
              v-for="(item, index) in markList"
              :key="index"
              class="twon_item"
              @click="handleClickMark(item.value)"
              :class="pagingParams.mark === item.value && 'yellow'"
            >{{ item.name }}</span>
            <span
              class="twon_item"
              :class="pagingParams.mark === 0 && 'yellow'"
              @click="handleClickMark(0)"
            >未标注</span>
          </div>

          <!-- 表格 -->
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :btnList="btnList"
            :isborder="true"
            :rowStyle="TableRowStyle"
            class="mb-10"
            @handleBtnEvent="handleBtnEvent"
          >
            <template #mark="scope">
              <div v-if="scope.row.mark">
                <el-tag
                  v-for="(item, index) in markList"
                  :key="index"
                  v-show="scope.row.mark == item.value"
                  :type="item.type"
                >{{ item.name }}</el-tag>
              </div>
              <div v-else></div>
            </template>
          </ele-table>

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

    <!-- 标注 - 弹框 -->
    <el-col>
      <el-dialog
        title="状态标注"
        v-model="markStateDialog"
        width="30%"
      >
        <el-radio
          v-for="(item, index) in markList"
          :key="index"
          v-model="stateMarkValue"
          :label="item.value"
        >{{ item.name }}</el-radio>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="markStateDialog = false">取 消</el-button>
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
  ref,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import RiskRanking from '@/components/riskRanking/index.vue';
import FileRemark from '@/components/fileRemark/index.vue';
import Company from '@/views/ent/company/index.vue';
import { formatDate } from '@/utils/filtration';
import {
  currentChange,
  RES_SUCCESS,
  sizeChange,
  getByKey,
} from '@/api/common/common';
import {
  getCompanyExpireByPage,
  setCompanyMark,
  getTown,
} from '@/api/ent/expire';

import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
    RiskRanking,
    FileRemark,
    Company,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      loading: true,
      //分页参数
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        townCode: '',
        mark: '',
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        townCode: '',
        mark: '',
      },
      total: 0,
      // 行政地区列表
      townList: [],

      //标注状态弹框 显示隐藏
      markStateDialog: false,
      markList: [], //标注列表
      stateMarkValue: 0, //弹框选择后的状态值

      currentDataId: 0, //当前数据的id
      currentObj: {},
      // 表格数据
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
          label: '企业名称',
          type: 'text',
          prop: 'companyName',
          width: 350,
        },
        {
          label: '企业类型',
          type: 'text',
          prop: 'companyType',
        },
        {
          label: '证照类型',
          type: 'text',
          prop: 'licenseType',
        },
        {
          label: '证件号',
          type: 'text',
          prop: 'code',
        },
        {
          label: '到期时间',
          type: 'text',
          prop: 'expireTime',
          formatter: (row: any) => {
            return formatDate(row.expireTime);
          },
        },
        {
          label: '人员证照到期人数',
          type: 'text',
          prop: 'expireSum',
        },
        {
          label: '负责人',
          type: 'text',
          prop: 'legalPerson',
        },
        {
          label: '联系方式',
          type: 'text',
          prop: 'legalPhone',
        },
        {
          label: '标注',
          prop: 'mark',
          type: 'slot',
          slotName: 'mark',
          width: 100,
        },
        {
          label: '操作',
          type: 'handle',
          width: 300,
        },
      ],
      //按钮列表
      btnList: [
        {
          text: '查看企业',
          handleType: 'check',
          type: 'primary',
          size: 'small',
        },
        {
          text: '标注状态',
          handleType: 'markState',
          size: 'small',
        },
      ],
    });
    let METHODS = reactive({
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          pagingParams.companyId = STORE.state.user.personnel.companyId;
        } else {
          pagingParams.companyId = undefined;
        }
        let { data } = await getCompanyExpireByPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          let newData = JSON.parse(JSON.stringify(data.data.records));
          // 根据日期做表格行背景处理
          DATA.tableData = newData.map((item: any) => {
            //true过期 false半年内过期 null未过期
            switch (METHODS.compareTime(item.expireTime)) {
              case true:
                item.bg = true;
                break;
              case false:
                item.bg = false;
                break;
              case null:
                item.bg = null;
                break;
              default:
                break;
            }
            return item;
          });
          DATA.total = data.data.total;
        }
      },

      // 获取弹框的标注列表
      handleGetMark: () => {
        getByKey({ key: 't_company_expire_mark' }).then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.markList = res.data.data.map((item: any) => {
              switch (item.value) {
                case 1:
                  item.type = '';
                  break;
                case 2:
                  item.type = 'danger';
                  break;
                case 3:
                  item.type = 'success';
                  break;
                case 4:
                  item.type = 'warning';
                  break;
                default:
                  break;
              }
              return item;
            });
          }
        });
      },

      // 点击快速定位 - 标注状态
      handleClickMark: (value: any) => {
        DATA.pagingParams.page = 1;
        DATA.pagingParams.mark = value;

        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.mark = value;

        // 刷新分页数据
        METHODS.handleGetPagingData({
          ...DATA.pagingParams,
        });
      },

      //获取英德市的镇信息
      getTown: () => {
        getTown().then((res) => {
          if (res.data.code === RES_SUCCESS) {
            DATA.townList = res.data.data;
          }
        });
      },

      //点击搜索
      handleSearch: () => {
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        DATA.pagingParamsCopy.page = 1;
        DATA.pagingParamsCopy.page = 1;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        // DATA.pagingParams.page = 1;
        // METHODS.handleGetPagingData(DATA.pagingParams);
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

      //表格按钮
      handleBtnEvent: async ({ row, val }: any) => {
        //val是btnList的子元素
        switch (val.handleType) {
          case 'check':
            // 需要判断企业类型, 跳转对应页面
            await STORE.commit('setCompanyInfo', {
              type: row.companyTypeValue,
              companyId: row.companyInfoId,
            });
            if (row.companyTypeValue === 4) {
              STORE.commit('setTwoTitle', '工贸行业管理');
              ROUTER.push({
                name: 'tradeDetails',
                params: {
                  title: ROUTE.meta.title,
                },
              });
            } else {
              STORE.commit('setTwoTitle', '非煤矿山企业管理');
              ROUTER.push({
                name: 'companyDetails',
                params: {
                  title: ROUTE.meta.title,
                },
              });
            }
            break;
          case 'markState':
            DATA.markStateDialog = true;
            DATA.stateMarkValue = row.mark;
            DATA.currentDataId = row.id; //获取当前数据的id

            DATA.currentObj = row; //模拟状态

            break;
          default:
            break;
        }
      },

      //标注弹框 - 确定按钮
      handleConfirm: () => {
        //设置标注 - 发起请求
        setCompanyMark({
          id: DATA.currentDataId,
          value: DATA.stateMarkValue,
        }).then((res) => {
          if (res.data.code == RES_SUCCESS) {
            DATA.markStateDialog = false;
            proxy.$message.success('标注状态设置成功');

            //无返回数据, 自己动手模拟 - 不请求刷新数据了
            DATA.currentObj.mark = DATA.stateMarkValue; //模拟标注点击后样式
            METHODS.handleGetPagingData(DATA.pagingParamsCopy);
          }
        });
      },

      //过期时间 true过期 false半年内过期 null未过期
      compareTime: (expireTime: any) => {
        if (!expireTime) {
          return null;
        }
        // 转换时间格式，并转换为时间戳
        function tranDate(expireTime: any) {
          return new Date(expireTime.replace(/-/g, '/')).getTime();
        }
        // 到期时间
        let startTime = tranDate(expireTime);
        // 获取当前时间，格式为 2018-9-10
        let thisDate = new Date();
        let currentTime =
          thisDate.getFullYear() +
          '-' +
          (thisDate.getMonth() + 1) +
          '-' +
          thisDate.getDate();
        let nowTime = tranDate(currentTime);

        //获取过期前180天的时间戳
        var tenDayAgo = startTime - 15552000000;
        // var timeAgo = new Date(tenDayAgo);
        // 如果过期
        if (nowTime > startTime) {
          return false;
        } else {
          //在180天内之内
          if (nowTime > tenDayAgo) {
            return true;
          }
          return null; //过期时间大于180天
        }
      },

      //表格行的背景色处理 false过期  true快过期
      TableRowStyle: ({ row, rowIndex }: any) => {
        // 注意，这里返回的是一个对象
        let rowBackground = { background: '' };
        if (row.bg == null) {
          rowBackground.background = '';
        } else if (row.bg == true) {
          rowBackground.background = '#e8f5fb';
        } else {
          rowBackground.background = '#ffe6e6';
        }
        return rowBackground;
      },
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);

      // 获取标注
      METHODS.handleGetMark();

      //获取英德市的镇
      METHODS.getTown();
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
      DATA.btnList = [
        {
          text: '查看企业',
          handleType: 'check',
          type:"success",
          size: 'small',
          isShow: true,
        },
        {
          text: '标注状态',
          handleType: 'markState',
          size: 'small',
          isShow: showBtnList.value.includes('label'),
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formatDate,
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
.twon_item {
  display: inline-block;
  // text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  word-wrap: break-all;
  // font-weight: 600;
  &:hover {
    color: $themeColor;
  }
}
/deep/.el-table th,
/deep/.el-table td {
  text-align: center;
}
.yellow {
  color: $textColor;
  background-color: $themeColor;
  border-radius: 10px;
  &:hover {
    color: $textColor;
  }
}
.fast {
  font-size: 16px;
  color: #606266;
  font-weight: 700 !important;
}
</style>
