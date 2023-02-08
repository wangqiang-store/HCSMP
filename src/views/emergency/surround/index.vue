 <template>
  <!-- 周边基础数据页面 -->
  <el-row class="page container" style="height:100%">
    <el-col :span="24">
      <el-row>
        <!-- 显示列表 -->
        <el-col
          :span="24"
          class="d_flex d_flex_sb"
        >
          <div class="list mb-10">
            <ul class="d_flex">
              <li
                v-for="(item, index) in pageList"
                :key="index"
                :class="{ active: currentIndex == index }"
                @click="currentIndex = index"
              >
                {{ item }}
              </li>
              <div class="line"></div>
            </ul>
          </div>
        </el-col>

        <!-- 显示表格 -->
        <el-col
          :span="24"
          class="mt-10"
        >
          <!-- 第一个表格部分 -->
          <div v-if="currentIndex == 0">
            <PageOne :showBtnList="showBtnList"></PageOne>
          </div>

          <!-- 第二个表格部分 -->
          <div v-if="currentIndex == 1">
            <PageTwo :showBtnList="showBtnList"></PageTwo>
          </div>

          <!-- 第三个表格部分 -->
          <div v-if="currentIndex == 2">
            <PageThree :showBtnList="showBtnList"></PageThree>
          </div>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import PageOne from './component/pageOne.vue';
import PageTwo from './component/pageTwo.vue';
import PageThree from './component/pageThree.vue';
import { useRoute } from 'vue-router';
export default defineComponent({
  components: {
    PageOne,
    PageTwo,
    PageThree,
  },
  setup(props) {
    const ROUTE: any = useRoute();
    let showBtnList = ref<Array<string>>([]);
    let DATA: any = reactive({
      // 显示列表
      pageList: ['企业周边查询', '周边信息管理', '周边类型管理'],
      currentIndex: 0, //当前索引
    });
    let METHODS = reactive({});
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
      showBtnList
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
}
// tabs表格列表
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
</style>
