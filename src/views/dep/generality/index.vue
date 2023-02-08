<template>
  <!-- 全市矿山概况页面 -->
  <el-row class="page container">
    <!-- 政府 -->
    <el-col :span="24">
      <el-row>
        <el-col
          :span="24"
          class="d_flex d_flex_sb title"
        >
          <h3>{{ pageDate.yearly }}年全市矿山概况</h3>
          <div>
            <el-date-picker
              v-model="date"
              type="year"
              placeholder="请选择年份"
              @change="handleChangeYear"
              :disabled-date="disabledDate"
            >
            </el-date-picker>
          </div>
        </el-col>
        <el-col
          :span="24"
          v-loading="loading"
        >
          <textarea
            class="textarea"
            placeholder="暂无内容"
            v-model="pageDate.overview"
            :disabled="disable"
          ></textarea>
          <el-button
            type="primary"
            class="button"
            v-if="showBtnList.includes('edit')"
            @click="handleSave"
          >{{
            disable ? "编 辑" : "保 存"
          }}</el-button>
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
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { RES_SUCCESS } from '@/api/common/common';
import {
  getFindOneOverview,
  createOverview,
  updateOverview,
} from '@/api/dep/generality';

import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  components: {},
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      date: new Date(),

      pageDate: {
        yearly: new Date().getFullYear(),
        overview: '',
      },
      disable: true,
      isAdd: true,
      loading: false,
    });
    let METHODS = reactive({
      //获取数据
      handleGetData: () => {
        DATA.loading = true;
        getFindOneOverview({ yearly: DATA.pageDate.yearly })
          .then((res) => {
            if (res.data.code == 200 && res.data.data) {
              DATA.pageDate = res.data.data;
              DATA.isAdd = false;
              DATA.loading = false;
            } else {
              DATA.pageDate.overview = '';
              DATA.isAdd = true;
              DATA.loading = false;
            }
          })
          .catch((error) => {});
      },
      // 改变年份
      handleChangeYear: (val: any) => {
        DATA.pageDate.yearly = new Date(val).getFullYear();
        DATA.disable = true;
        METHODS.handleGetData();
      },
      // 进行保存
      handleSave: () => {
        DATA.disable = !DATA.disable;
        if (DATA.disable) {
          //发起请求
          if (DATA.isAdd) {
            createOverview(DATA.pageDate).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                proxy.$message.success('保存数据成功');
                METHODS.handleGetData();
              }
            });
          } else {
            updateOverview(DATA.pageDate).then((res) => {
              if (res.data.code == RES_SUCCESS) {
                proxy.$message.success('保存数据成功');
                METHODS.handleGetData();
              }
            });
          }
        }
      },
      // 禁用未来日期
      disabledDate: (date: Date) => {
        return new Date(date).getFullYear() > new Date().getFullYear();
      },
    });
    onMounted(() => {
      METHODS.handleGetData();
      if (ROUTE.meta.children?.length > 0) {
        ROUTE.meta.children.forEach((item: any) => {
          showBtnList.value.push(item.perms);
        });
      }
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
.page {
  // margin: 40px 30px;
  .title {
    margin-bottom: 20px;
  }
}
.textarea {
  width: 100%;
  height: 65vh;
  padding: 30px;
  resize: none;
  border: 1px solid #dcdfe6;
  overflow-y: scroll;
  &:focus {
    border: 1px solid #409eff;
  }
  &[disabled] {
    background: #f5f7fa;
    cursor: not-allowed;
  }
  &::-webkit-scrollbar {
    width: 0;
  }
}
.button {
  margin-top: 10px;
  float: right;
}
</style>
