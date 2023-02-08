<template>
  <!-- 只是查看整改记录 -->
  <el-row  class="container">
    <el-col :span="24" style="padding: 20px">
      <ele-descriptions
        :column="4"
        :border="true"
        :title="'整改信息'"
        :renderDescriptionsArr="renderDescriptionsArr"
        :listData="formData"
      >
      </ele-descriptions>
    </el-col>

    <!-- 附件 -->
    <el-col :span="24" style="padding: 20px" class="file">
      <div class="title">现场检查相关材料附件:</div>
      <div class="content flex">
        <div v-if="partList.length" class="box1">
          <div
            class="box2 d_flex d_flex_column d_flex_sa"
            v-for="(item, index) in partList"
            :key="index"
            style="height: 160px"
          >
            <a target="_blank" class="image" @click="handleFile(item)">
              <el-image
                v-if="
                  item.path.indexOf('.png') > -1 ||
                  item.path.indexOf('.jpg') > -1
                "
                :src="item.path"
                style="height: 160px"
              ></el-image>
              <el-image
                v-else
                :src="require('../../../../assets/image/word.png')"
              ></el-image>
            </a>

            <span>{{ item.name }}</span>
            <i class="el-icon-download" @click="download(item)"></i>
          </div>
        </div>
        <el-empty :image-size="160" style="flex: 1;" v-else></el-empty>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import EleDescriptions from "@/components/eleDescriptions/index.vue";
import { getRectificationReportDetail } from "@/api//security/updateReport";
import { getByKey, RES_SUCCESS } from "@/api/common/common";
import { getProvince, getCity, getCounty, getTown } from "@/api/region";
import { formatDate } from "@/utils/filtration";
export default defineComponent({
  components: { EleDescriptions },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    let formRef: any = ref(null);
    let DATA: any = reactive({
      loading: false,
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      formData: {},
      renderDescriptionsArr: [
        {
          label: "企业名称 :",
          span: 4,
          prop: "companyName",
        },
        {
          label: "企业地址 :",
          span: 4,
          prop: "address1",
        },
        {
          label: "整改基本情况描述 :",
          span: 4,
          prop: "basicDescribe",
        },
        {
          label: "执法人员:",
          span: 4,
          prop: "personnelNames",
        },
        {
          label: "存在隐患数 :",
          span: 2,
          prop: "hiddenDangerExists",
        },
        {
          label: "已消除隐患数 :",
          span: 2,
          prop: "hiddenDangerElimination",
        },
        {
          label: "巡检时间 :",
          span: 2,
          prop: "checkTime",
        },
        {
          label: "整改到期时间 :",
          span: 2,
          prop: "expireTime",
        },
        {
          label: "是否存在重大隐患 :",
          span: 2,
          prop: "isMajorHiddenDanger",
        },
        {
          label: "是否完成整改",
          span: 2,
          prop: "isRectification",
        },
      ],

      partList: [],
    });
    let METHODS = reactive({
      //获取数据
      handleGetDate: async () => {
        DATA.loading = true;
        DATA.formData = Object.assign({}, STORE.state.globalData.updateReportInfo);
        let { data } = await getRectificationReportDetail({
          id: DATA.formData.id,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData = data.data;
          
          if (DATA.formData.files) {
            DATA.partList = DATA.formData.files;
          }

          //回显企业地址
          if (DATA.formData.companyId) {
            STORE.state.globalData.companyList.forEach((item: any) => {
              if (item.id == DATA.formData.companyId) {
                DATA.formData.companyName = item.name;
                DATA.formData.provinceCode = item.provinceCode;
                DATA.formData.cityCode = item.cityCode;
                DATA.formData.countyCode = item.countyCode;
                DATA.formData.townCode = item.townCode;
                DATA.formData.address = item.address;
                return;
              }
            });
          }

          METHODS.handletProvinceCode();
          METHODS.handleCityCode();
          METHODS.handleCountyCode();
          METHODS.handleTownCode();

          DATA.formData.isMajorHiddenDanger = DATA.formData.isMajorHiddenDanger
            ? "是"
            : "否";
          DATA.formData.isRectification = DATA.formData.isRectification
            ? "是"
            : "否";
          DATA.formData.checkTime = formatDate(DATA.formData.checkTime);
          DATA.formData.expireTime = formatDate(DATA.formData.expireTime);

          DATA.loading = false;
        }
      },

      // 下载文件
      download: (item: any) => {
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = item.path;
        link.setAttribute("download", item.name);
        document.body.appendChild(link);
        link.click();
      },
      // 点击附件图片
      handleFile: (item: any) => {
        let type = item.path.split(".")[1];
        let bool = ["png", "jpg", "pdf"].indexOf(type);
        if (bool > 0) {
          window.open(item.path);
        } else {
          METHODS.download(item);
        }
      },

      // 根据省code回显数据
      handletProvinceCode: async () => {
        let { data } = await getProvince({
          code: DATA.formData.provinceCode as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 = data.data.name ? data.data.name : "";
        }
      },
      // 根据市code回显数据
      handleCityCode: async () => {
        let { data } = await getCity({
          code: DATA.formData.cityCode as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) + " " + data.data.name;
        }
      },
      // 根据区、县code回显数据
      handleCountyCode: async () => {
        let { data } = await getCounty({
          code: DATA.formData.countyCode as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) + " " + data.data.name;
        }
      },
      // 根据乡、镇code回显数据
      handleTownCode: async () => {
        let { data } = await getTown({
          code: DATA.formData.townCode as number,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData.address1 =
            String(DATA.formData.address1) +
            " " +
            data.data.name +
            " " +
            DATA.formData.address;
        }
      },
    });
    onMounted(() => {
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);
        
      //获取数据
      METHODS.handleGetDate();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      formRef,
    };
  },
});
</script>
<style scoped lang="scss">
.container{
  height: calc(100% - 40px) !important;
  padding-top: 0;
  padding-bottom: 0;
}
// 描述列表
/deep/ table td.is-bordered-label.is-left {
  width: 16%;
  text-align: right;
  background: none;
  font-weight: 700;
  color: black;
}
/deep/table td.el-descriptions__content.is-left {
  text-align: left;
  color: #333333;
}
/deep/tr {
  td {
    &:nth-child(4) {
      width: 34% !important;
    }
  }
}

.file {
  font-size: 14px;
  .title {
    border: 1px solid #e0e4f0;
    background-color: #f4f6fa;
    padding: 14px 10px;
    font: 700 14px "黑体";
  }
  .content {
    flex-wrap: wrap !important;
    font: 400 14px "黑体";
    border: 1px solid #e0e4f0;
    border-top: none;
    padding: 20px;
    .box1 {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      .box2 {
        width: calc(100% / 8);
        height: 220px !important;
        .image {
          width: 90%;
          // height: 100%;
          text-align: center;
          cursor: pointer;
          img {
            width: 100% !important;
            height: 160px !important;
          }
        }
        i {
          font-size: 26px;
          color: #cbcbcb;
          padding: 0px 5px;
          cursor: pointer;
          &:hover {
            color: #1a8adb;
          }
        }
      }
    }
  }
}
</style>