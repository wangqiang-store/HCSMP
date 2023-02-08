<template>
  <!-- 年度计划页面 -->
  <el-row class="page container">
    <el-col :span="24">
      <el-row>
        <el-col :span="24" class="d_flex d_flex_sb">
          <div class="list mb-10">
            <ul class="d_flex">
              <li
                v-for="(item, index) in pageList"
                :key="index"
                :class="{ active: currentIndex == index }"
                @click="handleClickList(index)"
              >
                {{ item.name }}
              </li>
              <div class="line"></div>
            </ul>
          </div>
        </el-col>
        <el-col :span="24" v-if="currentIndex == 0">
          <Files :showBtnList="showBtnList"></Files>
        </el-col>
        <el-col :span="24" v-if="currentIndex == 1">
          <YearPlan :showBtnList="showBtnList"></YearPlan>
        </el-col>
      </el-row>
    </el-col>
    <!-- 显示tabs类型 -->
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
import Files from "./file/index.vue";
import YearPlan from "./yearPlan/index.vue";
import { filterTime } from "@/utils/filtration";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  components: {
    ElePagination,
    Files,
    YearPlan,
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);

    let DATA: any = reactive({
      // 显示列表
      pageList: [
        { name: "文件", value: 1 },
        { name: "年度监督检查计划", value: 1 },
      ],
      currentIndex: 0,
    });
    let METHODS = reactive({
      // 点击列表
      handleClickList: (index: Number) => {
        DATA.currentIndex = index;
      },
    });
    onMounted(() => {
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
      showBtnList,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
  padding-top: 0;
}
.page {
  // margin: 40px 30px;

  // 列表类型
  .list {
    position: relative;
    width: 100%;
    ul {
      li {
        padding: 10px 20px;
        margin-right: 30px;
        font-size: 14px;
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
}
</style>
