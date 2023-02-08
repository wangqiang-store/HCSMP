<template>
  <el-row class="container">
    <el-col :span="24">
      <Amap
        class="amap"
        module="homePage"
        AmapId="homePage"
        :companyList="amapCompanyList"
        @getForecast="getForecast"
        @handlePlay="handlePlayVideo"
        :viewType="viewType"
      />

      <!-- 左侧选项栏 -->
      <div class="left_sidebar">
        <div
          class="mb-10 left_sidebar_item"
          v-for="item of tabList"
          :key="item.handle"
          @click="handleSidebar(item.handle)"
        >
          <img :src="item.path" width="25" height="25" />
          <p>{{ item.text }}</p>
        </div>
      </div>

      <!-- 抽屉 -->
      <div class="drawer" :class="isDrawer && 'drawer_show'">
        <div class="close nowrap">
          <span @click="isDrawer = !isDrawer">×</span>

          <!-- 搜素 -->
          <div v-if="contentType === 'search'" class="search">
            <h3 class="tac pt-20">搜索</h3>
            <div class="search_select p-20">
              <p class="mr-20" @click="handleNonRectification">
                未完成整改企业
              </p>
              <p @click="getRemovalLicenseExpiration">企业证照到期企业</p>
            </div>
            <el-input
              placeholder="请输入企业名称、详细地址或联系人"
              style="width: 90%"
              v-model="searchParams.content"
              @keydown.enter="handleSearchContent(searchParams.content)"
            >
              <template #append>
                <span
                  @click="handleSearchContent(searchParams.content)"
                  class="search_btn"
                  >搜索</span
                >
              </template>
            </el-input>
            <!-- 企业列表 -->
            <ul
              class="infinite-list"
              v-infinite-scroll="load"
              style="overflow: auto"
              v-if="searchCompanyData.length > 0 || !showEmpty"
            >
              <li
                v-for="(item, index) in searchCompanyData"
                :key="item.id"
                class="infinite-list-item"
                @click="handleSkipDetails(item)"
              >
                <p
                  :data-index="index + 1"
                  class="text-ellipsis"
                  :title="item.name"
                >
                  公司名称:{{ item.name }}
                </p>
                <p class="text-ellipsis" :title="item.address">
                  地址:{{ item.address }}
                </p>
                <p class="text-ellipsis" :title="item.legalPerson">
                  法人名称:{{ item.legalPerson }}
                </p>
                <p class="text-ellipsis" :title="item.legalPhone">
                  联系电话:{{ item.legalPhone }}
                </p>
              </li>
            </ul>
            <el-empty v-else description="暂无数据"></el-empty>
          </div>
          <!-- 天气 -->
          <div v-if="contentType === 'weather'" class="weather">
            <h3 class="tac pt-20 mb-10">天气</h3>
            <div
              v-for="item of weatherList"
              :key="item.week"
              style="width: 80%"
              class="mb-20 weather_box"
            >
              <div class="weather_head">
                <p class="ml-20 mr-20">
                  {{ item.date.split("-")[0] }}年{{
                    item.date.split("-")[1]
                  }}月{{ item.date.split("-")[2] }}日
                </p>
                <p>星期{{ filterDay(item.week) }}</p>
              </div>
              <div class="weather_body">
                <!-- <img :src="require('@/assets/image/u150.svg')" v-if="item.dayWeather.indexOf('雨') !== -1"> -->
                <i
                  v-if="item.dayWeather.indexOf('雨') !== -1"
                  class="iconfont icon-a-tianqikongqizhishu-25"
                ></i>
                <i
                  v-else-if="item.dayWeather.indexOf('阴') !== -1"
                  class="iconfont icon-tianqi"
                ></i>
                <i v-else class="iconfont icon-tianqimoni"></i>
                <div>
                  <p class="mb-5" style="color: #2390fe">
                    {{ item.dayWeather }}
                  </p>
                  <p class="mb-5" style="color: #2390fe">{{ item.dayTemp }}℃</p>
                  <p class="mb-5" style="color: #2390fe">
                    {{ item.dayWindDir }}风
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- 统计 -->
          <div v-if="contentType === 'statistics'" style="height:100%">
            <h3 class="tac pt-20">统计</h3>
            <!-- 非煤 -->
            <NoncoalRiskLevel
              :innerWidth="0.21"
              :innerHeight="0.48"
              :isShowlabel="false"
              class="mt-20 home"
            />
            <!-- 工贸 -->
            <IndustryTrade
              :innerWidth="0.21"
              :innerHeight="0.48"
              :isShowlabel="false"
              class="home"
            />
          </div>
          <!-- 文件 -->
          <div v-if="contentType === 'file'">
            <h3 class="tac pt-20 mb-20">文件</h3>
            <div class="file">
              <el-card
                class="mb-10"
                v-for="item of fileList"
                :key="item.id"
                :title="item.title"
              >
                <a :href="item.filePath" :target="item.target || ''">
                  <img width="50" class="mr-10" :src="item.iconPath" />
                  <p class="text-ellipsis">{{ item.title }}</p>
                </a>
              </el-card>
            </div>
          </div>
        </div>
      </div>

      <!-- 上边选项栏 -->
      <div class="top_sidebar">
        <div
          class="sidebar_item_top"
          :class="{ drawerUpActive: isDrawerUp && DrawerUpIndex == 0 }"
          @click="handleTopSidebar('type', 0)"
        >
          <div>企业类型</div>
        </div>
        <div
          class="sidebar_item_down"
          :class="{ drawerUpActive: isDrawerUp && DrawerUpIndex == 1 }"
          @click="handleTopSidebar('level', 1)"
        >
          <div>风险等级</div>
        </div>
      </div>
      <!-- 上边抽屉 -->
      <div class="drawerUp" v-show="isDrawerUp">
        <div class="close nowrap">
          <span @click="isDrawerUp = !isDrawerUp">×</span>
          <!-- 企业类型 -->
          <div v-if="optionType === 'type'" class="sidebar_item_top">
            <h3 class="tac pt-20 mb-10 mt-5">企业类型</h3>
            <div
              v-for="(item, index) of companyType"
              :key="item"
              @click="handleChangeCompanyType(item.type, index)"
              :class="typeActiveIndex === index && 'active'"
            >
              {{ item.text }}
            </div>
          </div>
          <!-- 风险等级 -->
          <div v-if="optionType === 'level'" class="sidebar_item_down">
            <h3 class="tac pt-20 mb-10 mt-5">风险等级</h3>
            <div
              v-for="(item, index) of riskGrade"
              :key="item"
              @click="handleChangeRiskGrade(item.grade, index)"
              :class="gradeActiveIndex === index && 'active'"
            >
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- 走马灯开 -->
      <div
        class="wrapper_container"
        id="wrapper_container"
        v-show="overduePile"
      >
        <h4 class="expiration_title">
          企业证照到期提醒
          <div>
            <i @click="overduePile = false" class="el-icon-minus"></i>
          </div>
        </h4>
        <div class="expiration_head">
          <p class="left">序号</p>
          <p class="center">企业</p>
          <p class="right_center">证件类型</p>
          <p class="right">到期时间</p>
        </div>
        <div
          class="wrapper"
          @mousemove="handlePause()"
          @mouseleave="handlePlay"
        >
          <div class="boxes">
            <div
              class="box"
              v-for="(item, index) in overdueCompanyList"
              :key="item.id"
            >
              <p class="left">{{ index + 1 }}</p>
              <p class="center text-ellipsis" :title="item.name">
                {{ item.name }}
              </p>
              <p class="right_center text-ellipsis" :title="item.licenseType">
                {{ item.licenseType }}
              </p>
              <p
                class="right text-ellipsis"
                :class="
                  new Date(item.expireTime).getTime() <= new Date().getTime()
                    ? 'warning'
                    : 'info'
                "
              >
                {{ filterTime(item.expireTime, "-", false) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- 走马灯合 -->
      <div class="wrapper_collection" @click="overduePile = !overduePile">
        <i
          class="el-icon-collection"
          :class="{ drawerUpActive: overduePile }"
        ></i>
      </div>

      <!-- 视频 -->
      <el-dialog v-model="dialogVisible" width="30%" @close="handleCloseVideo">
        <el-card>
          <video
            style="width:100%;height:100%"
            height="300"
            :src="companyInfo?.videoFileIdPath"
            controls
            id="video"
          ></video>
        </el-card>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
} from "vue";
import Amap from "@/components/amap/index.vue";
import NoncoalRiskLevel from "@/views/report/component/noncoalRiskLevel.vue";
import IndustryTrade from "@/views/report/component/industryTrade.vue";
import {
  getHomePage,
  getIncomplete,
  getLicenseExpiration,
  getRemovalLicenseExpiration,
} from "@/api/main";
import { filterTime } from "@/utils/filtration";
import { RES_SUCCESS } from "@/api/common/common";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

export default defineComponent({
  components: { Amap, NoncoalRiskLevel, IndustryTrade },
  setup() {
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE: any = useRoute();
    let DATA: any = reactive({
      overduePile: true, //走马灯是否折叠
      overdueCompanyList: [],
      animation: null, // anime实例
      yTrans: [],
      tabList: [
        {
          path: require("@/assets/image/u149.svg"),
          text: "搜索",
          handle: "search",
        },
        {
          path: require("@/assets/image/u150.svg"),
          text: "天气",
          handle: "weather",
        },
        {
          path: require("@/assets/image/u152.svg"),
          text: "统计",
          handle: "statistics",
        },
        {
          path: require("@/assets/image/u151.svg"),
          text: "文件",
          handle: "file",
        },
      ], //左侧选项栏
      isDrawer: false,
      contentType: "",
      count: 0,
      showEmpty: false,
      // 搜索内容
      searchParams: {
        content: "",
        level: null,
        type: null,
      },
      // 未整改企业
      searchCompanyData: [],
      // 分级数据
      rankedData: [],
      amapCompanyList: [],
      viewType: "grading",
      // 最近三天天气
      weatherList: [],
      // 上边选项栏
      isDrawerUp: true,
      optionType: "type",
      DrawerUpIndex: 0,
      companyType: [
        {
          text: "全部",
          type: null,
        },
        {
          text: "非煤矿山企业",
          type: 1,
        },
        {
          text: "工贸行业企业",
          type: 4,
        },
      ],
      riskGrade: [
        {
          text: "全部",
          grade: null,
        },
        {
          text: "A级",
          grade: 1,
        },
        {
          text: "B级",
          grade: 2,
        },
        {
          text: "C级",
          grade: 3,
        },
        {
          text: "D级",
          grade: 4,
        },
        {
          text: "未定级",
          grade: 5,
        },
      ],
      typeActiveIndex: 0,
      gradeActiveIndex: 0,
      // 视频
      dialogVisible: false,
      companyInfo: {},
      fileList: [
        {
          id: 1,
          title: "危化品企业信息收集表.pdf",
          filePath: "/files/fixed/危化品企业信息收集表.pdf",
          iconPath: "/files/fixed/pdf.png",
          target: "_blank",
        },
        {
          id: 2,
          title: "VideoWebPlugin.exe",
          filePath: "/files/fixed/VideoWebPlugin.exe",
          iconPath: "/files/fixed/exe.png",
        },
        {
          id: 3,
          title: "格式工厂视频转换工具.exe",
          filePath: "/files/fixed/格式工厂视频转换工具.exe",
          iconPath: "/files/fixed/exe.png",
        },
      ],
    });
    let METHODS = reactive({
      //点击上边侧边栏
      handleTopSidebar(type: string, index: number) {
        DATA.isDrawerUp = true;
        DATA.optionType = type;
        DATA.DrawerUpIndex = index;
      },
      // 初始化走马灯
      initAnime: () => {
        // DATA.yTrans = [];
        proxy.$anime.set(".box", {
          translateY: function (el: any, i: number, l: any) {
            DATA.yTrans[i] = { y: i * 40 };
            return i * 40;
          },
        });
        DATA.animation = proxy.$anime({
          targets: DATA.yTrans,
          duration: ((DATA.overdueCompanyList.length * 40) / 20.8) * 1000, //走一周持续时间
          easing: "linear",
          y: `-=${40 * DATA.overdueCompanyList.length}`,
          loop: true,
          update: function (anim: any) {
            proxy.$anime.set(".box", {
              translateY: function (el: any, i: number, l: any) {
                return DATA.yTrans[i]?.y %
                  (40 * DATA.overdueCompanyList.length) <
                  -40
                  ? (DATA.yTrans[i]?.y %
                      (40 * DATA.overdueCompanyList.length)) +
                      40 * DATA.overdueCompanyList.length
                  : DATA.yTrans[i]?.y % (40 * DATA.overdueCompanyList.length);
              },
            });
          },
        });
        // animation.pause();
      },
      handlePlay: () => {
        DATA.animation && DATA.animation.play();
      },
      handlePause: () => {
        DATA.animation && DATA.animation.pause();
      },
      // 点击侧边栏
      handleSidebar: (type: string) => {
        if (DATA.contentType === type) {
          DATA.isDrawer = !DATA.isDrawer;
        } else {
          DATA.isDrawer = true;
        }
        DATA.contentType = type;
      },
      // 点击企业类型
      handleChangeCompanyType: (type: number, index: number) => {
        DATA.typeActiveIndex = index;
        DATA.searchParams.type = type;
        DATA.searchParams.content = "";
        METHODS.handleSearch({ ...DATA.searchParams }, false);
      },
      // 点击风险等级
      handleChangeRiskGrade: (grade: number, index: number) => {
        DATA.gradeActiveIndex = index;
        DATA.searchParams.level = grade;
        DATA.searchParams.content = "";
        METHODS.handleSearch({ ...DATA.searchParams }, false);
      },
      // 搜索内容
      handleSearchContent: (content: string) => {
        DATA.searchParams.content = content;
        DATA.searchParams.level = null;
        DATA.searchParams.type = null;
        DATA.gradeActiveIndex = 0;
        DATA.typeActiveIndex = 0;
        METHODS.handleSearch({ ...DATA.searchParams }, true);
      },
      // 获取天气
      getForecast: (data: any) => {
        if (data.info === "OK") {
          DATA.weatherList = data.forecasts;
        }
      },
      // 获取未整改企业
      handleNonRectification: async () => {
        DATA.showEmpty = false;
        DATA.gradeActiveIndex = 0;
        DATA.typeActiveIndex = 0;
        DATA.searchParams.content = "";
        let { data } = await getIncomplete();
        if (data.code === RES_SUCCESS) {
          DATA.viewType = "search";
          DATA.searchCompanyData = data.data;
          DATA.amapCompanyList = data.data;
        }
        DATA.showEmpty = true;
      },
      // 获取证照企业到期企业
      handleLicenseExpires: async () => {
        let { data } = await getLicenseExpiration();
        if (data.code === RES_SUCCESS) {
          DATA.overdueCompanyList = data.data;
          DATA.amapCompanyList = data.data;
        }
      },
      // 获取证照企业到期企业 去重
      getRemovalLicenseExpiration: async () => {
        DATA.showEmpty = false;
        DATA.gradeActiveIndex = 0;
        DATA.typeActiveIndex = 0;
        DATA.searchParams.content = "";
        let { data } = await getRemovalLicenseExpiration();
        if (data.code === RES_SUCCESS) {
          DATA.viewType = "search";
          DATA.searchCompanyData = data.data;
          DATA.amapCompanyList = data.data;
        }
        DATA.showEmpty = true;
      },
      // 搜索
      handleSearch: async ({ content, level, type }: any, isData: boolean) => {
        DATA.showEmpty = false;
        DATA.searchCompanyData = [];
        let { data } = await getHomePage({
          content,
          level,
          type,
        });
        if (data.code === RES_SUCCESS) {
          if (isData) {
            DATA.searchCompanyData = data.data;
            DATA.viewType = "search";
          } else {
            DATA.rankedData = data.data;
            DATA.searchCompanyData = [];
            DATA.viewType = "grading";
          }
          DATA.amapCompanyList = data.data;
        }
        isData && (DATA.showEmpty = true);
      },
      handleSkipDetails: async (item: any) => {
        // 需要判断企业类型, 跳转对应页面
        await STORE.commit("setCompanyInfo", {
          type: item.type,
          companyId: item.id,
        });
        if (item.type === 4) {
          STORE.commit("setTwoTitle", "工贸行业管理");
          STORE.commit("setTitle", "企业档案管理");
          ROUTER.push({
            name: "tradeDetails",
          });
        } else {
          STORE.commit("setTwoTitle", "非煤矿山企业管理");
          STORE.commit("setTitle", "企业档案管理");
          ROUTER.push({
            name: "companyDetails",
          });
        }
      },
      // 播放视频
      handlePlayVideo: (companyInfo: any) => {
        DATA.companyInfo = companyInfo;
        if (companyInfo.videoFileIdPath) {
          DATA.dialogVisible = true;
        } else {
          ElMessage({
            message: "该企业暂无全景图视频,请上传!",
            type: "warning",
          });
        }
      },
      // 关掉视频
      handleCloseVideo: () => {
        let video: any = document.getElementById("video");
        video.pause();
      },
      // 滚动加载
      load: () => {
        if (DATA.count < 100) {
          DATA.count += 10;
        }
      },
      filterDay: (week: string) => {
        let day = "";
        switch (week) {
          case "1":
            day = "一";
            break;
          case "2":
            day = "二";
            break;
          case "3":
            day = "三";
            break;
          case "4":
            day = "四";
            break;
          case "5":
            day = "五";
            break;
          case "6":
            day = "六";
            break;
          case "7":
            day = "日";
            break;
          default:
            break;
        }
        return day;
      },
    });
    onMounted(async () => {
      await METHODS.handleLicenseExpires();
      await METHODS.initAnime();
      METHODS.handleSearch({ ...DATA.searchParams }, false);
    });
    onUnmounted(() => {
      DATA.animation && DATA.animation.remove(DATA.yTrans);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
    };
  },
});
</script>

<style lang="scss" scoped>
/deep/.ccom {
  height: calc(100% + 50px) !important;
}
.container {
  position: relative;
  padding: 0;
  width: 100%;
  height: 100% !important;
  .amap {
    width: 100%;
    height: 100%;
  }

  // 左侧选项栏
  .left_sidebar {
    position: absolute;
    left: 20px;
    top: 10px;
    .left_sidebar_item {
      width: 50px;
      height: 60px;
      border-radius: 4px;
      box-shadow: 0 0 2px 0 #a8e7ff;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #acacac;
      font-size: 14px;
      &:hover {
        color: $themeColor !important;
      }
    }
  }

  @mixin top_sidebar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-radius: 4px;
    box-shadow: 0 0 4px 0 silver;
    background-color: #fff;
    text-align: center;
    font-size: 14px;
  }

  @mixin top_sidebar_item($width) {
    width: $width;
    border-right: 1px solid #e9ecf2;
    padding: 10px;
    &:hover {
      color: #409eff;
    }
  }

  @mixin circle($color) {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: $color;
    margin-right: 5px;
  }

  @mixin icon($icon) {
    content: "";
    width: 20px;
    height: 20px;
    display: inline-block;
    background-image: url($icon);
    background-position: center;
    background-size: contain;
    vertical-align: bottom;
    margin-right: 5px;
  }

  // 上边选项栏
  .top_sidebar {
    position: absolute;
    top: 30px;
    right: 30px;
    font-size: 14px;
    color: #acacac;
    .sidebar_item_top,
    .sidebar_item_down {
      padding: 10px;
      background-color: #fff;
      border: 1px solid #e3f4f6;
      margin-bottom: 10px;
      border-radius: 10px;
      box-shadow: 0 0 4px 0 silver;
      cursor: pointer;
      &:hover {
        color: $themeColor;
      }
    }
  }
  .drawerUpActive {
    color: $themeColor !important;
  }
  // 上边选项栏抽屉
  .drawerUp {
    width: 150px;
    position: absolute;
    right: 120px;
    top: 10px;
    background-color: #fff;
    border-radius: 4px;
    transition: all 0.5s;
    box-shadow: 0 0 4px 0 silver;
    text-align: center;
    &::-webkit-scrollbar {
      width: 0;
      overflow-y: auto;
    }
    h3 {
      padding-top: 5px;
      // font-weight: 400;
      font-size: 18px;
    }

    .close {
      width: 100%;
      height: 100%;
      position: relative;
      span {
        cursor: pointer;
        position: absolute;
        right: 10px;
        top: 5px;
        font-size: 20px;
        color: #abb2bf;
      }
    }

    .sidebar_item_top {
      margin-bottom: 5px;
      cursor: pointer;
      div {
        margin: 0 5px;
        border-radius: 10px;
      }
      div:nth-child(1) {
        padding: 10px;
      }
      div:nth-child(2) {
        padding: 10px;
        &:hover {
          color: #409eff;
        }
      }
      div:nth-child(3) {
        padding: 10px;
        &:hover {
          color: #409eff;
        }
        &::before {
          @include icon("../../assets/image/u167.svg");
          filter: hue-rotate(100deg);
        }
        
      }
      div:nth-child(4) {
        padding: 10px;
        &:hover {
          color: #409eff;
        }
        &::before {
          @include icon("../../assets/image/u168.svg");
          filter: hue-rotate(100deg);
        }
      }
    }
    .sidebar_item_down {
      padding-bottom: 5px;
      div {
        margin: 0 5px;
        border-radius: 10px;
        padding: 10px;
        &:hover{
          color: #409eff;
        }
      }
      cursor: pointer;
      div:nth-child(1) {
        border-right: 1px solid #e9ecf2;
        padding: 10px;
      }
      // div:nth-child(2) {
      // }
      div:nth-child(3) {
        &::before {
          @include circle(#46b9f4);
        }
      }
      div:nth-child(4) {
        &::before {
          @include circle(#e29d3a);
        }
      }
      div:nth-child(5) {
        &::before {
          @include circle(#ff838f);
        }
      }
      div:nth-child(6) {
        &::before {
          @include circle(#d75166);
        }
      }
      div:nth-child(7) {
        padding: 10px;
        &:hover {
          color: #409eff;
        }
        &::before {
          @include circle(#8f8f8f);
        }
      }
    }
    .active {
      color: #fff;
      background-color: #409eff;
      &:hover {
        color: #fff !important;
      }
    }
  }

  // 抽屉
  .drawer {
    width: 0;
    height: 95%;
    position: absolute;
    left: 80px;
    top: 10px;
    background-color: #fff;
    border-radius: 4px;
    transition: all 0.5s;
    box-shadow: silver 0 0 8px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0;
      overflow-y: auto;
    }
    // 搜索
    .search {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      text-align: center;
      .search_select {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: nowrap;
        height: 40px;
        p {
          color: $themeColor;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }
      }
      .infinite-list {
        width: 100%;
        height: calc(100% - 125px);
        padding: 10px 20px 10px 20px;
        .infinite-list-item {
          padding: 10px 10px 10px 20px;
          text-align: left;
          border: 1px solid #cccccc;
          font-size: 14px;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 0 10px 0 #cccccc;
          margin-bottom: 10px;
          cursor: pointer;
          p {
            margin-bottom: 5px;
          }
          p:nth-child(1) {
            &::before {
              content: attr(data-index);
              display: inline-block;
              width: 15px;
              height: 15px;
              font-size: 12px;
              text-align: center;
              border-radius: 50%;
              background-color: #f95e5a;
              color: #fff;
            }
          }
          p:nth-child(2),
          p:nth-child(3),
          p:nth-child(4) {
            margin-left: 15px;
          }
        }
        &::-webkit-scrollbar {
          width: 0;
        }
      }
      .search_btn {
        font-size: 14px;
        display: inline-block;
        width: 100%;
        height: 100%;
        background-color: $themeColor;
        color: $textColor;
        transform: translate(20px, -10px);
        line-height: 35px;
      }
      /deep/ .el-input-group__append {
        width: 70px;
        padding: 0;
      }
    }

    // 天气
    .weather {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .weather_box {
        gap: 20px;
        border-radius: 10px;
        backdrop-filter: blur(5px);
        background-color: rgba(216, 229, 233, 0.162);
        box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px;
        .weather_head {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          background-color: #2390fe;
          color: #fff;
          padding: 10px;
          font-size: 12px;
        }
        .weather_body {
          width: 100%;
          height: 120px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          i {
            font-size: 56px;
            display: block;
            background-color: rgba(35, 144, 254, 0.6);
            padding: 20px;
            border-radius: 50%;
            color: white;
            height: 80%;
          }
          div {
            margin-right: 20px;
            p {
              font-weight: bold;
              margin-right: 20px;
            }
          }

          // background-color: #f0f6fd;
        }
      }
    }

    // 文件
    .file {
      width: 95%;
      margin: 0 auto;
      a {
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-left: 10px;
        &:hover {
          color: $themeColor;
        }
      }
    }

    .close {
      width: 100%;
      height: 100%;
      position: relative;
      span {
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 10px;
        font-size: 20px;
        color: #abb2bf;
      }
    }
  }
  .drawer_show {
    width: 25%;
    max-width: 400px;
    // min-width: 250px;
  }

  // 走马灯开
  .wrapper_container {
    transition: all 0.2s linear;
    position: absolute;
    max-height: 100%;
    right: 50px;
    // top: 500px;
    bottom: 10px;
    overflow: hidden;
    box-shadow: 0 0 8px 0 silver;
    border-radius: 5px;
    width: 22%;
    max-width: 350px;
    min-width: 250px;
    h4 {
      div {
        cursor: pointer;
        float: right;
        padding-right: 20px;
      }
    }
    .expiration_title {
      width: 100%;
      height: 45px;
      line-height: 45px;
      text-align: left;
      background-color: #fff;
      padding-left: 20px;
      font-size: 14px;
      color: #6f6f6f;
      border-bottom: 1px solid #eeeeee;
      position: absolute;
      // z-index: 999;
    }
    .expiration_head {
      transition: all 1s linear;
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap;
      background-color: #fff;
      font-size: 12px;
      color: #989898;
      text-align: center;
      position: absolute;
      top: 45px;
      z-index: 99;
      .left {
        flex: 1;
      }
      .center {
        flex: 4;
      }
      .right_center {
        flex: 2;
      }
      .right {
        flex: 2;
      }
    }

    .wrapper {
      width: 100%;
      height: 250px;
      // margin: 40px auto 0;
      background: #fff;
      overflow: hidden;
      // margin-bottom: 40px;
    }
    .boxes {
      width: 100%;
    }
    .box {
      width: 100%;
      height: 40px;
      position: absolute;
      cursor: pointer;
      background-color: #fff;
      font-size: 12px;
      color: #989898;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap;
      .left {
        flex: 1;
      }
      .center {
        flex: 4;
      }
      .right_center {
        flex: 2;
      }
      .right {
        flex: 2;
        color: #81cde6;
      }
      .info {
        color: $themeColor;
      }
      .warning {
        color: $errorColor;
      }
    }
    .boxes {
      // position: relative;
      position: absolute;
      top: 75px;
    }
  }

  // 走马灯合
  .wrapper_collection {
    position: fixed;
    right: 30px;
    bottom: 30px;
    background-color: $textColor;
    box-shadow: 0 0 4px 0 silver;

    width: 34px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    font-size: 22px;
    color: #686868;
    &:hover {
      color: $themeColor;
    }
  }

  /deep/ .el-dialog__body {
    padding: 0;
  }

  /deep/ .el-dialog__header {
    padding: 0;
  }

  /deep/ .el-dialog__close {
    &::before {
      content: "";
    }
  }
}
/deep/ .amap-ui-control-container {
  z-index: 100;
}
/deep/ .amap-ui-smp-ifwn-content-body {
  width: 300px;
}
</style>