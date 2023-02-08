<template>
  <el-row>
    <el-col :span="24">
      <!-- 非煤企业风险等级 占比图 -->
      <init-echarts
        id="noncoalRiskLevel"
        :options="noncoalRiskLevelOptions"
        :innerWidth="innerWidth"
        :innerHeight="innerHeight"
      ></init-echarts>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, reactive, ref, toRefs } from "vue";
import InitEcharts from "@/components/initEcharts/index.vue";
import { RES_SUCCESS } from "@/api/common/common";
import { nonMediaEnterpriseRisk } from "@/api/report/repSum";
export default defineComponent({
  components: { InitEcharts },
  props: {
    innerWidth: {
      type: Number,
    },
    innerHeight: {
      type: Number,
    },
    isShowlabel: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    //  非煤风险等级 占比数据  内圈
    let noncoalRiskLevelData: any = ref([]);
    // 非煤风险等级 企业数量 外圈
    let noncoalRiskLevelSumData: any = ref([]);
    let DATA: any = reactive({
      /** 非煤风险等级占比 */
      noncoalRiskLevelOptions: {
        title: {
          text: "非煤矿山企业风险等级占比图",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          // formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: function (params: any) {
            let htmlStr = "";
            switch (params.componentIndex) {
              case 0:
                htmlStr += `<div style='border-color:${params.color}'><p>企业风险等级</p><p>${params.name}: ${params.value} (${params.percent}%)</p></div>`;
                break;
              case 1:
                htmlStr += `<div style='border-color:${params.color}'><p style="font-weight: bold">${params.name}</p><p style="font-weight: bold">企业: ${params.value}个</p>`;
                if (params.data.list.length > 0) {
                  params.data.list.forEach((item: any, index: number) => {
                    htmlStr += `<p>${index + 1}. <span>${item.name}</span></p>`;
                  });
                }
                htmlStr += "</div>";
                break;
              default:
                break;
            }
            return htmlStr;
          },
          confine: true,
          className: "tool",
          position: ['30%', '30%']
        },
        legend: {
          data: ["A级", "B级", "C级", "D级", "未定级"],
          top: "6%",
        },
        series: [
          {
            name: "等级",
            type: "pie",
            selectedMode: "single",
            radius: [0, "30%"],
            label: {
              position: "inner",
              fontSize: 14,
            },
            labelLine: {
              show: false,
            },
            data: noncoalRiskLevelData.value,
          },
          {
            name: "企业数量",
            type: "pie",
            radius: ["45%", "60%"],
            labelLine: {
              length: 30,
            },
            label: props.isShowlabel
              ? {
                  formatter:
                    "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
                  backgroundColor: "#F6F8FC",
                  borderColor: "#8C8D8E",
                  borderWidth: 1,
                  borderRadius: 4,
                  rich: {
                    a: {
                      color: "#6E7079",
                      lineHeight: 22,
                      align: "center",
                    },
                    hr: {
                      borderColor: "#8C8D8E",
                      width: "100%",
                      borderWidth: 1,
                      height: 0,
                    },
                    b: {
                      color: "#4C5058",
                      fontSize: 14,
                      fontWeight: "bold",
                      lineHeight: 33,
                    },
                    per: {
                      color: "#fff",
                      backgroundColor: "#4C5058",
                      padding: [3, 4],
                      borderRadius: 4,
                    },
                  },
                }
              : {},
            data: noncoalRiskLevelSumData.value,
          },
        ],
      },
    });
    let METHODS = reactive({
      // 获取非煤风险等级占比数据
      handleRiskLevel: async () => {
        let { data } = await nonMediaEnterpriseRisk();
        if (data.code === RES_SUCCESS) {
          if (data.data !== null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              // 内圈
              item.zongTotal &&
                noncoalRiskLevelData.value.push({
                  value: item.zongTotal,
                  name: item.riskLevelName,
                });
            });
            noncoalRiskLevelData.value[0].selected = true;
            DATA.noncoalRiskLevelOptions.series[0].data =
              noncoalRiskLevelData.value;
            METHODS.handleRiskLevelSum(data.data);
          }
        }
      },
      // 获取非煤风险等级企业个数 外圈
      handleRiskLevelSum: (data: any) => {
        let list: Array<any> = [];
        data.forEach((item: any) => {
          switch (item.riskLevel) {
            case 1:
              item.diXiaTotal &&
                list.push({
                  value: item.diXiaTotal,
                  name: "A级地下矿山",
                  list: item.diXiaList,
                });
              item.luTianTotal &&
                list.push({
                  value: item.luTianTotal,
                  name: "A级露天矿山",
                  list: item.luTianList,
                });
              break;
            case 2:
              item.diXiaTotal &&
                list.push({
                  value: item.diXiaTotal,
                  name: "B级地下矿山",
                  list: item.diXiaList,
                });
              item.luTianTotal &&
                list.push({
                  value: item.luTianTotal,
                  name: "B级露天矿山",
                  list: item.luTianList,
                });
              break;
            case 3:
              item.diXiaTotal &&
                list.push({
                  value: item.diXiaTotal,
                  name: "C级地下矿山",
                  list: item.diXiaList,
                });
              item.luTianTotal &&
                list.push({
                  value: item.luTianTotal,
                  name: "C级露天矿山",
                  list: item.luTianList,
                });
              break;
            case 4:
              item.diXiaTotal &&
                list.push({
                  value: item.diXiaTotal,
                  name: "D级地下矿山",
                  list: item.diXiaList,
                });
              item.luTianTotal &&
                list.push({
                  value: item.luTianTotal,
                  name: "D级露天矿山",
                  list: item.luTianList,
                });
              break;
            case 5:
              item.diXiaTotal &&
                list.push({
                  value: item.diXiaTotal,
                  name: "未定级地下矿山",
                  list: item.diXiaList,
                });
              item.luTianTotal &&
                list.push({
                  value: item.luTianTotal,
                  name: "未定级露天矿山",
                  list: item.luTianList,
                });
              break;
            default:
              break;
          }
        });
        DATA.noncoalRiskLevelOptions.series[1].data = list;
      },
    });
    onBeforeMount(async () => {
      await METHODS.handleRiskLevel();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.home /deep/.tool {
  left: -10px !important;
  width: 80% !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  &::-webkit-scrollbar {
    width: 0;
  }
  white-space: break-spaces !important;
}
/deep/.tool {
  // left: 50px !important;
  width: 60% !important;
  max-width: 400px;
  max-height: 400px !important;
  overflow-y: auto !important;
  &::-webkit-scrollbar {
    width: 0;
  }
  white-space: break-spaces !important;
}
</style>