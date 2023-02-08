 <template>
  <!-- 周边基础数据页面 -->
  <el-row>
    <!-- 显示表格 -->
    <el-col
      :span="24"
      class="mt-10"
      v-loading="loading"
    >
      <div class="mb-20">
        <el-select
          v-model="area"
          placeholder="行政区域"
          @change="handleChangeArea"
          class="mr-10"
          clearable
        >
          <el-option
            v-for="(item, index) in areaOption"
            :key="index"
            :label="item.name"
            :value="item.code"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="companyId"
          placeholder="可输入企业名称搜索"
          @change="handleChangeCompany"
          filterable
          class="mr-10"
          clearable
        >
          <el-option
            v-for="(item, index) in companyOption"
            :key="index"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        class="mb-10"
      >
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
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  toRefs,
  watch,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { currentChange, RES_SUCCESS, sizeChange } from '@/api/common/common';
import { getCompanyByTown } from '@/api/ent/noncoalmine';
import {
  getAllPeripheralType,
  getAroundInformationPage,
} from '@/api/emergency/surround';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
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
      area: '',
      companyId: '', //要查看的企业id
      pagingParams: {
        limit: 10,
        page: 1,
        companyId: undefined, // 登录账号的身份(是企业, 否政府)
      },
      pagingParamsCopy: {
        limit: 10,
        page: 1,
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
            for (const item of DATA.peripheralType) {
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
      ],
      areaOption: STORE.state.globalData.townList,
      companyOption: [],
      peripheralType: [], //所有的周边类型列表

      total: 0,
    });
    let METHODS = reactive({
      // 获取分页数据
      handleGetPagingData: async (pagingParams: any) => {
        DATA.loading = true;
        if (STORE.state.user.personnel.unitType !== 1) {
          // 企业进来
          pagingParams.companyId = STORE.state.user.personnel.companyId;

          if (pagingParams.companyId == DATA.companyId) {
            // 是该企业的人员
            let { data } = await getAroundInformationPage(pagingParams);
            if (data.code === RES_SUCCESS) {
              DATA.loading = false;
              DATA.tableData = data.data.records;
              DATA.total = data.data.total;
            }
          } else {
            // 不是该企业的人员
            proxy.$message.warning('你无权查看其他企业的数据');
            DATA.loading = false;
            DATA.tableData = [];
            DATA.total = 0;
          }
        } else {
          // 政府进来
          pagingParams.companyId = DATA.companyId;
          let { data } = await getAroundInformationPage(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
            setTimeout(() => {
              DATA.loading = false;
            }, 100);
          }
        }
      },

      // 选择行政区域
      handleChangeArea: async () => {
        if (DATA.area == '') {
          DATA.area = null;
          return;
        }
        DATA.companyOption = [];
        // 根据镇获取下面的企业
        let { data } = await getCompanyByTown({ townCode: DATA.area });
        if (data.code === RES_SUCCESS) {
          DATA.companyOption = data.data;
          DATA.companyId = '';
        }
      },

      // 选择企业
      handleChangeCompany: () => {
        if (DATA.companyId == '') {
          DATA.companyId = null;
          return;
        }
        // 发起请求获取分页数据
        METHODS.handleGetPagingData(DATA.pagingParams);
      },

      //获取所有的周边类型列表
      getAllType: async () => {
        let { data } = await getAllPeripheralType();
        if (data.code === RES_SUCCESS) {
          DATA.peripheralType = data.data;
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

    // 监听行政区域是否有值
    watch(
      () => DATA.area,
      (newValue) => {
        if (!newValue) {
          DATA.companyId = null;
        }
      }
    );

    onMounted(() => {
      //获取所有的周边类型列表
      METHODS.getAllType();
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
</style>
