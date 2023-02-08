<template>
  <!-- 隐患统计页面 -->
  <el-row class="page container">
    <el-col :span="24">
      <el-row>
        <!-- 显示列表 -->
        <el-col :span="24" class="d_flex d_flex_sb">
          <div class="list mb-10">
            <ul class="d_flex">
              <li
                v-for="(item, index) in pageList"
                :key="index"
                :class="{ active: currentIndex == index }"
                @click="handleClickList(index)"
              >
                {{ item }}
              </li>
              <div class="line"></div>
            </ul>
          </div>
        </el-col>

        <!-- 搜索功能 -->
        <el-col :span="24" class="d_flex d_flex_sb" style="padding: 20px">
          <div></div>
          <div class="d_flex top_search">
            <el-date-picker
              v-model="date"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="mr-10"
              style="width: 400px"
              prefix-icon="el-icon-date"
              :disabled-date="disabledDate"
            >
            </el-date-picker>
            <el-button type="primary" @click="handleSearch">
              <span>搜索</span>
            </el-button>
          </div>
        </el-col>

        <!-- 显示表格 -->
        <el-col :span="24" class="mt-10" v-loading="loading">
          <ele-table
            :tableData="tableData"
            :renderTable="currentIndex == 0 ? renderTable : renderTable2"
            :isborder="true"
          >
          </ele-table>

          <!-- 汇总 -->
          <table
            width="100%"
            align="center"
            cellspacing="0"
            cellpadding=""
            class="table2"
          >
            <tr>
              <td rowspan="2" class="total">汇总</td>
              <td>{{ total.checkCompany }}</td>
              <td>{{ total.checkDanger }}</td>
              <td>{{ total.hiddenDangerElimination }}</td>
              <td>{{ total.rectificationRate }} %</td>
            </tr>
          </table>

          <!-- 显示备注 -->
          <div class="comment mt-10">
            <div v-show="currentIndex == 0">注 : 各区域隐患排查统计</div>
            <div v-show="currentIndex == 1">注 : 各部门隐患排查统计</div>
          </div>
        </el-col>
      </el-row>
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
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import { RES_SUCCESS } from "@/api/common/common";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import {
  getDangerCensusDepartment,
  getDangerCensusRegion,
} from "@/api/trouble";
import { filterTime } from "@/utils/filtration";
export default defineComponent({
  components: {
    EleTable,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let DATA: any = reactive({
      date: undefined,
      // 显示列表
      pageList: ["区域统计", "单位统计"],
      currentIndex: 0, //当前索引
      params: {
        endTime: undefined,
        startTime: undefined,
      },
      paramsCopy: {
        endTime: undefined,
        startTime: undefined,
      },
      //表格
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
        },
        {
          label: "行政区域",
          type: "text",
          prop: "region",
        },
        {
          label: "排查企业(家次)",
          type: "text",
          prop: "checkCompany",
        },
        {
          label: "排查隐患数",
          type: "text",
          prop: "checkDanger",
        },
        {
          label: "已整改数",
          type: "text",
          prop: "hiddenDangerElimination",
        },
        {
          label: "整改率",
          type: "text",
          prop: "rectificationRate",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return row.rectificationRate + "%";
          },
        },
      ],
      renderTable2: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
        },
        {
          label: "单位名称(部门)",
          type: "text",
          prop: "department",
        },
        {
          label: "排查企业(家次)",
          type: "text",
          prop: "checkCompany",
        },
        {
          label: "排查隐患数",
          type: "text",
          prop: "checkDanger",
        },
        {
          label: "已整改数",
          type: "text",
          prop: "hiddenDangerElimination",
        },
        {
          label: "整改率",
          type: "text",
          prop: "rectificationRate",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return row.rectificationRate + "%";
          },
        },
      ],

      total: {
        checkCompany: 0,
        checkDanger: 0,
        hiddenDangerElimination: 0,
        rectificationRate: 0,
      },
      totalCopy: {
        checkCompany: 0,
        checkDanger: 0,
        hiddenDangerElimination: 0,
        rectificationRate: 0,
      },
    });
    let METHODS = reactive({
      disabledDate:(value:any)=>{
        return value.getTime() > Date.now()
      },
      summaryMethod: (params: any) => {},
      // 点击菜单列表
      handleClickList: (index: Number) => {
        DATA.currentIndex = index;
        DATA.date = undefined;
        DATA.total = Object.assign({}, DATA.totalCopy);
        DATA.params = Object.assign({}, DATA.paramsCopy);

        METHODS.handleGetData(DATA.params); //获取数据
      },

      //   获取数据
      handleGetData: async (params: any) => {
        DATA.loading = true;
        if (DATA.date) {
          params.startTime = filterTime(DATA.date[0], "/");
          params.endTime = filterTime(DATA.date[1], "/");
        }else{
          params.startTime = undefined
          params.endTime = undefined
        }
        
        if (DATA.currentIndex == 0) {
          //获取区域列表
          let { data } = await getDangerCensusRegion(params);
          if (data.code === RES_SUCCESS) {
            DATA.tableData = data.data;
            DATA.loading = false;

            METHODS.handleDeal();
          }
        } else {
          //获取单位列表
          let { data } = await getDangerCensusDepartment(params);
          if (data.code === RES_SUCCESS) {
            DATA.tableData = data.data;
            DATA.loading = false;

            METHODS.handleDeal();
          }
        }
      },

      // 汇总数据处理
      handleDeal: () => {
        if (DATA.tableData.length) {
          for (const item of DATA.tableData) {
            DATA.total.checkCompany += item.checkCompany;
            DATA.total.checkDanger += item.checkDanger;
            DATA.total.hiddenDangerElimination += item.hiddenDangerElimination;
            DATA.total.rectificationRate += item.rectificationRate;
          }
          DATA.total.rectificationRate = (
            DATA.total.rectificationRate / DATA.tableData.length
          ).toFixed(1);
        }
      },

      // 搜索
      handleSearch: () => {
        DATA.total = Object.assign({}, DATA.totalCopy); //恢复默认值
        METHODS.handleGetData(DATA.paramsCopy);
      },
    });
    onMounted(() => {
      METHODS.handleGetData(DATA.params);
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
.page {
  // margin: 40px 30px;

  .list {
    position: relative;
    width: 100%;
    ul {
      li {
        padding-bottom: 10px;
        margin-right: 30px;
        font-size: 14px;
        width: 84px;
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
  // 注的样式
  .comment {
    font-size: 14px;
    color: #999;
  }
}

.table2 {
  margin-top: 30px;
  font-size: 14px;
  color: #606266;
  tr {
    height: 50px;
    width: 100%;
  }
  th,
  td {
    border: 1px solid #ebeef5;
    text-align: center;
    width: calc(100% / 6);
  }
  .total {
    width: calc(100% / 3);
    font-size: 16px;
    font-weight: 700;
  }
}
</style>
