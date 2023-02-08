<template>
  <!-- 全市矿山目录页面 -->
  <el-row class="page container">
    <!-- 政府 -->
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

        <!-- 显示表格 -->
        <el-col :span="24" class="mt-10" v-loading="loading">
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :isborder="true"
            :cellStyle="tableCellStyle"
          >
            <template #safeProcess="scope">
              <div v-if="scope.row.safeProcess">
                <el-tag
                  v-for="(item, index) in safeProcessList"
                  :key="index"
                  v-show="scope.row.safeProcess.indexOf(item.name)!=-1"
                  :type="item.type"
                  >{{ scope.row.safeProcess }}</el-tag
                >
              </div>
              <div v-else></div>
            </template>
          </ele-table>
          <!-- 显示备注 -->
          <div class="comment mt-10">
            <div v-show="currentIndex == 0">
              证照齐全{{ total }}家，其中{{
                effective
              }}家安全生产许可证将于今年有效期满。
            </div>
            <div v-show="currentIndex == 1">
              新改扩建矿山企业共{{ total }}家，其中{{ notBuilt }}家未建。
            </div>
            <div v-show="currentIndex == 2">共{{ total }}家已过期。</div>
            <div v-show="currentIndex == 3">共{{ total }}家已注销。</div>
            <div v-show="currentIndex == 4">共{{ total }}家已关闭。</div>
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
    <!-- 企业 -->
    <!-- <el-col :span="24">
      <el-empty description="无访问页面权限"></el-empty>
    </el-col> -->
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
import ElePagination from "@/components/elePagination/index.vue";
import { formatDate } from "@/utils/filtration";
import { currentChange, RES_SUCCESS, sizeChange } from "@/api/common/common";
import {
  getPageComplete,
  getPageBuild,
  getPageExpired,
  getPageLogout,
  getPageClose,
  getTermOfValidity,
  getNoBuilt,
} from "@/api/dep/catalog";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  components: {
    EleTable,
    ElePagination,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let DATA: any = reactive({
      // 显示列表
      pageList: [
        "证照齐全企业",
        "在建矿山企业",
        "证件过期企业",
        "已注销企业",
        "已关闭企业",
      ],
      currentIndex: 0, //当前索引
      effective: 0, //获取X家证今年有效期满(证照齐全企业)
      notBuilt: 0, //获取x家未建(在建矿山企业)
      pagingParams: {
        limit: 10,
        page: 1,
        companyId:undefined
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
        companyId:undefined
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
          width: 60,
        },
        {
          label: "企业名称",
          type: "text",
          prop: "mineName",
          width: 350,
        },
        {
          label: "企业类型",
          type: "text",
          prop: "companyType",
        },
        {
          label: "矿种",
          type: "text",
          prop: "mineType",
        },
        {
          label: "生产规模(万吨/年)",
          type: "text",
          prop: "productionScale",
        },
        {
          label: "采矿许可证有效期",
          type: "text",
          formatter: (row: any) => {
            return row.mineStartTime
              ? `${formatDate(row.mineStartTime)} \n ${formatDate(
                  row.mineEndTime
                )}`
              : "";
          },
        },
        {
          label: "安全生产许可证号",
          type: "text",
          prop: "safeCode",
        },
        {
          label: "安全生产许可证有效期",
          type: "text",
          formatter: (row: any) => {
            return row.safeStartTime
              ? `${formatDate(row.safeStartTime)} \n ${formatDate(
                  row.safeEndTime
                )}`
              : "";
          },
        },
        {
          label: "安全许可证进程",
          type: "slot",
          prop: "safeProcess",
          slotName: "safeProcess",
          width:200
        },
        {
          label: "采矿负责人",
          type: "text",
          prop: "legalPerson",
        },
        {
          label: "联系方式",
          type: "text",
          prop: "legalPhone",
        },
        {
          label: "办公电话",
          type: "text",
          prop: "phoneFax",
        },
        {
          label: "备注",
          type: "text",
          prop: "remark",
        },
      ],
      
      safeProcessList: [
        { name: "有效期内", type: "" },
        { name: "已期满", type: "danger" },
        { name: "已满期", type: "danger" },
        { name: "已注销", type: "info" },
        { name: "建设", type: "" },
        { name: "未建", type: "" },
      ],

      total: 0,
    });
    let METHODS = reactive({
      // 点击菜单列表
      handleClickList: (index: Number) => {
        DATA.currentIndex = index;
        DATA.pagingParams.page=1
        DATA.pagingParamsCopy.page=1
        METHODS.handleGetPagingData(DATA.pagingParams); //获取数据
      },
      //   获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        //获取企业id
        let comId = STORE.state.user.personnel.companyId?STORE.state.user.personnel.companyId:undefined
        // 判断是否是政府或企业  
        if(STORE.state.user.personnel.unitType !==1){
          pagingParams.companyId = comId
        }else{
          pagingParams.companyId = undefined
        }
        switch (DATA.currentIndex) {
          case 0:
            // 获取证照齐全企业列表
            getPageComplete(pagingParams).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                DATA.tableData = res.data.data.records;
                DATA.total = res.data.data.total;
                DATA.loading = false;
              }
            });
            // 获取X家证今年有效期满(证照齐全企业)
            
            getTermOfValidity({companyId:comId}).then((res) => {
              if (res.data.code === RES_SUCCESS) {
                DATA.effective = res.data.data.effective;
              }
            });
            break;
          case 1:
            //获取在建矿山企业列表
            getPageBuild(pagingParams).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                DATA.tableData = res.data.data.records;

                DATA.total = res.data.data.total;
                DATA.loading = false;
              }
            });
            //获取x家未建(在建矿山企业)
            getNoBuilt({companyId:comId}).then((res) => {
              if (res.data.code === RES_SUCCESS) {
                DATA.notBuilt = res.data.data.notBuilt;
              }
            });
            break;
          case 2:
            getPageExpired(pagingParams).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                DATA.tableData = res.data.data.records;
                3;
                DATA.total = res.data.data.total;
                DATA.loading = false;
              }
            });
            break;
          case 3:
            getPageLogout(pagingParams).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                DATA.tableData = res.data.data.records;
                DATA.total = res.data.data.total;
                DATA.loading = false;
              }
            });
            break;
          case 4:
            getPageClose(pagingParams).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                DATA.tableData = res.data.data.records;
                DATA.total = res.data.data.total;
                DATA.loading = false;
              }
            });
            break;
          default:
            break;
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

      // 单元格样式处理
      tableCellStyle: ({ row, column, rowIndex, columnIndex }: any) => {
        // 安全生产许可证有效期
        if (columnIndex == 7) {
          let returnVal = "";
          switch (METHODS.compareTime(row.safeEndTime)) {
            case true:
              returnVal = "background:#e8f5fb;";
              break;
            case false:
              returnVal = "background:#ffe6e6;";
              break;
            default:
              break;
          }
          return returnVal;
        }

        //采矿许可证有效期
        if (columnIndex == 5) {
          let returnVal = "";
          switch (METHODS.compareTime(row.mineEndTime)) {
            case true:
              returnVal = "background:#e8f5fb;";
              break;
            case false:
              returnVal = "background:#ffe6e6;";
              break;
            default:
              break;
          }
          return returnVal;
        }
      },
      //过期时间 true过期 false半年内过期 null未过期
      compareTime: (expireTime: any) => {
        if (!expireTime) {
          return null;
        }
        // 转换时间格式，并转换为时间戳
        function tranDate(time: any) {
          return new Date(time.replace(/-/g, "/")).getTime();
        }
        // 到期时间
        let startTime = tranDate(expireTime);
        // 获取当前时间，格式为 2018-9-10
        let thisDate = new Date();
        let currentTime =
          thisDate.getFullYear() +
          "-" +
          (thisDate.getMonth() + 1) +
          "-" +
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
    });
    onMounted(() => {
      // if (STORE.state.user.personnel.unitType === 1) {
        //获取数据
        METHODS.handleGetPagingData(DATA.pagingParams);
      // }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formatDate,
      STORE,
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

  .comment {
    font-size: 14px;
    color: #999;
  }
}

/deep/ .el-table .cell {
  text-align: center;
  white-space: pre-line; /*保留换行符*/
}
</style>
