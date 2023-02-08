<template>
  <el-row class="container" v-loading="loading">
    <el-col :span="20" class="pr-20">
      <!-- 基本信息 -->
      <big-container class="mb-20">
        <template #header>
          <div class="d_flex d_flex_sb">
            <h3 class="ml-20">基本信息</h3>
            <el-button
              class="edit"
              type="text"
              @click="handleSkipEditpage"
              v-if="
                !(
                  user.personnel.unitType === 2 &&
                  user.personnel.companyId !==
                    STORE.state.globalData.companyInfo.companyId
                ) && STORE.state.globalData.industryEditBtn
              "
              >进入编辑页 >>>
            </el-button>
          </div>
        </template>
        <template #body>
          <!-- 营业执照信息 -->
          <div class="mb-20">
            <LittleContainer title="营业执照信息" />
            <div v-if="companyInfo">
              <DescriptionsList
                class="p-20"
                :options="companyInfoOption"
                :data="{ ...companyInfo, ...coordinates }"
              />
              <!-- 营业执照表格 -->
              <ele-table
                v-if="companyInfo?.businessLicenseList?.length > 0"
                :tableData="companyInfo.businessLicenseList"
                :renderTable="companyInfoRenderTable"
                :isPreview="true"
              ></ele-table>
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 经营许可证信息 -->
          <div class="mb-20">
            <LittleContainer title="经营许可证信息" />
            <div v-if="managementInfo">
              <DescriptionsList
                class="p-20"
                :options="managementInfoOption"
                :data="managementInfo"
              />
              <!-- 经营许可证信息表格 -->
              <ele-table
                v-if="managementInfo?.managementLicenseList?.length > 0"
                :tableData="managementInfo.managementLicenseList"
                :renderTable="managementInfoRenderTable"
                :isPreview="true"
              ></ele-table>
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>
        </template>
      </big-container>

      <!-- 其他 -->
      <big-container class="mb-20" title="其他">
        <template #body>
          <!-- 企业其他台账信息 -->
          <div class="mb-20">
            <LittleContainer title="企业其他台账信息" class="mb-20" />
            <!-- 企业其他台账信息表格 -->
            <ele-table
              v-if="ledgerInfoList?.length > 0"
              :tableData="ledgerInfoList"
              :renderTable="ledgerInfoListRenderTable"
              :isPreview="true"
            ></ele-table>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 应急演练 -->
          <div>
            <LittleContainer title="应急演练" class="mb-20" />
            <!-- 应急演练表格 -->
            <ele-table
              v-if="emergencyInfo?.length > 0"
              :tableData="emergencyInfo"
              :renderTable="emergencyInfoRenderTable"
              :isPreview="true"
            ></ele-table>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>
        </template>
      </big-container>
    </el-col>
    <el-col :span="4">
      <!-- 企业标签云 -->
      <big-container title="企业标签云">
        <template #body>
          <CloudLabel :labelList="labelList" />
        </template>
      </big-container>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BigContainer from "../companyDetails/component/bigContainer.vue";
import LittleContainer from "../companyDetails/component/littleContainer.vue";
import DescriptionsList from "../companyDetails/component/descriptionsList.vue";
import EleTable from "@/components/eleTable/index.vue";
import CloudLabel from "@/components/cloudLabel/index.vue";
import { getCity, getCounty, getProvince, getTown } from "@/api/region";
import { getByTradeDetails } from "@/api/ent/trade";
import {
  getByKey,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from "@/api/common/common";
import { filterTime } from "@/utils/filtration";
import { getLabel } from "@/api/company";
import { useState } from "@/hooks/useMapper";
export default defineComponent({
  components: {
    BigContainer,
    LittleContainer,
    DescriptionsList,
    EleTable,
    CloudLabel,
  },
  setup(props) {
    const ROUTE = useRoute();
    const STORE = useStore();
    const ROUTER: any = useRouter();
    let { user } = useState(["user"]);
    let DATA: any = reactive({
      loading: false,
      labelList: [],
      // 企业营业执照基础信息
      companyInfo: {},
      // 经营许可证信息
      managementInfo: {},
      // 企业其他台账信息
      ledgerInfoList: [],
      emergencyInfo: [],
      //地理坐标
      coordinates: {
        latitude: null,
        longitude: null,
      },
      /**  营业执照基本信息 **/
      companyInfoOption: [
        {
          label: "企业名称",
          prop: "name",
          width: "50%",
        },
        {
          label: "企业简称",
          prop: "shortName",
          width: "50%",
        },
        {
          label: "法人代表",
          prop: "legalPerson",
          width: "50%",
        },
        {
          label: "法人联系方式",
          prop: "legalPhone",
          width: "50%",
        },
        {
          label: "企业类型",
          prop: "type",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let type = "";
            DATA.companyType.forEach((item: any) => {
              if (item.value === row.type) {
                type = item.name;
              }
            });
            return type
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${type}</span>`
              : false;
          },
        },
        {
          label: "经济类型",
          prop: "economicType",
          slot: true,
          width: "50%",
          formatter: (row: any) => {
            let economicType = "";
            STORE.state.globalData.economicTypeList.forEach((item: any) => {
              if (item.value === row.economicType) {
                economicType = item.name;
              }
            });
            return economicType
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${economicType}</span> `
              : false;
          },
        },
        {
          label: "注册资本",
          prop: "registerCapital",
          width: "100%",
        },
        {
          label: "经营范围",
          prop: "businessScope",
          width: "100%",
        },
        {
          label: "企业注册地址",
          prop: "townCode",
          width: "100%",
          formatter: (row: any) => {
            return DATA.registerAddress;
          },
        },
        {
          label: "邮政编码",
          prop: "postalCode",
          width: "50%",
        },
        {
          label: "企业电话",
          prop: "phone",
          width: "50%",
        },
        {
          label: "企业传真",
          prop: "fax",
          width: "50%",
        },
        {
          label: "电子邮箱",
          prop: "email",
          width: "50%",
        },
        {
          label: "企业/工厂中心地理坐标",
          prop: "longitude",
          slot: true,
          width: "100%",
          formatter: (row: any) => {
            let info = "";
            info = `
            <span class="el-tag el-tag--info el-tag--light" style="font-size:14px">北纬${row.latitude}°</span> 
            <span class="el-tag el-tag--info el-tag--light" style="font-size:14px">东经${row.longitude}°</span>
            `;
            return row.latitude ? info : false;
          },
        },
      ],
      companyInfoRenderTable: [
        {
          label: "统一社会信用代码",
          type: "text",
          prop: "code",
        },
        {
          label: "营业执照有效期",
          type: "text",
          formatter: (row: any) => {
            if (row.endTime) {
              return `${filterTime(row.startTime, "-", false)} - ${filterTime(
                row.endTime,
                "-",
                false
              )}`;
            } else {
              return `${filterTime(row.startTime, "-", false)} - 长期`;
            }
          },
        },
        {
          label: "登记机关",
          type: "text",
          prop: "unit",
        },
        {
          label: "扫描件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ],
      // 企业类型列表
      companyType: [{ name: "工贸行业企业", value: 4 }],
      registerAddress: "",
      /** 经营许可证信息 */
      managementInfoOption: [
        {
          label: "企业名称",
          prop: "companyName",
          width: "50%",
        },
        {
          label: "法定代表人",
          prop: "legalPerson",
          width: "50%",
        },
        {
          label: "单位地址",
          width: "100%",
          formatter: () => {
            return DATA.managementAddress;
          },
        },
        {
          label: "经营方式",
          prop: "businessMethods",
          width: "100%",
        },
        {
          label: "许可范围",
          prop: "licenseScope",
          width: "100%",
        },
      ],
      managementInfoRenderTable: [
        {
          label: "证书编号",
          type: "text",
          prop: "code",
        },
        {
          label: "许可证有效期限",
          type: "text",
          width: 350,
          formatter: (row: any) => {
            let timer = `${filterTime(
              row.startTime,
              "-",
              false
            )} - ${filterTime(row.endTime, "-", false)}`;
            return timer;
          },
        },
        {
          label: "有效期延续时间",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.extensionTime, "-", false);
          },
        },
        {
          label: "发证机关",
          type: "text",
          prop: "unit",
        },
        {
          label: "扫描件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ],
      managementAddress: "",
      ledgerInfoListRenderTable: [
        {
          label: "添加时间",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.addTime);
          },
        },
        {
          label: "台账类型",
          type: "text",
          prop: "type",
          formatter: (row: any) => {
            let type = "";
            DATA.type.forEach((item: any) => {
              if (item.value === row.type) {
                type = item.name;
              }
            });
            return type;
          },
        },
        {
          label: "文件",
          type: "file",
          prop: "fileName",
          name: "fileName",
          href: "filePath",
        },
        {
          label: "备注",
          type: "text",
          prop: "remark",
        },
      ],
      type: [],
      /** 应急演练 */
      emergencyInfoRenderTable: [
        {
          label: "演练时间",
          prop: "drillTime",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.drillTime, "-", false);
          },
        },
        {
          label: "参与人员",
          prop: "participant",
          type: "text",
        },
        {
          label: "演练内容",
          prop: "content",
          type: "text",
        },
        {
          label: "演练情况效果",
          prop: "result",
          type: "text",
        },
        {
          label: "附件",
          type: "file",
          moreFile: true,
          prop: "files",
          href: "path",
          name: "name",
        },
      ],
    });
    let METHODS = reactive({
      // 政府人员 获取企业数据
      handleGetCompanyDetails: async () => {
        if (STORE.state.globalData.companyInfo.companyId) {
          let { data } = await getByTradeDetails({
            companyId:
              STORE.state.user.personnel.unitType === 2 &&
              ROUTE.path === "/ent/industry"
                ? STORE.state.user.personnel.companyId
                : STORE.state.globalData.companyInfo.companyId,
          });
          if (data.code === RES_SUCCESS) {
            // 获取企业营业基本信息
            DATA.companyInfo = data.data.companyInfo;
            DATA.registerAddress = await METHODS.handleregisterAddress(
              data.data.companyInfo.provinceCode,
              data.data.companyInfo.cityCode,
              data.data.companyInfo.countyCode,
              data.data.companyInfo.townCode,
              data.data.companyInfo.address
            );
            // 获取经营许可证信息
            DATA.managementInfo = data.data.managementInfo;
            if (data.data.managementInfo) {
              DATA.managementAddress = await METHODS.handleregisterAddress(
                data.data.managementInfo.provinceCode,
                data.data.managementInfo.cityCode,
                data.data.managementInfo.countyCode,
                data.data.managementInfo.townCode,
                data.data.managementInfo.address
              );
            }

            //地理坐标
            DATA.coordinates = {
              latitude: data.data.companyInfo.latitude,
              longitude: data.data.companyInfo.longitude,
            };
            //企业其他台账
            DATA.ledgerInfoList = data.data.ledgerInfoList;
            // 应急演练
            DATA.emergencyInfo = data.data.emergencyDrillList;
          }
        }
      },
      // 获取字典数据
      handleGetDist: async (key: string) => {
        if (sessionRead(key)) {
          return sessionRead(key);
        } else {
          let { data } = await getByKey({ key });
          if (data.code === RES_SUCCESS) {
            sessionWrite(key, data.data);
            return data.data;
          }
        }
      },
      // 根据省code回显数据
      handleProvinceCode: async (code: number) => {
        let { data } = await getProvince({ code });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 根据市code回显数据
      handleCityCode: async (code: number) => {
        let { data } = await getCity({ code });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 根据区、县code回显数据
      handleCountyCode: async (code: number) => {
        let { data } = await getCounty({ code });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 根据乡、镇code回显数据
      handleTownCode: async (code: number) => {
        let { data } = await getTown({ code });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 拼接地址
      handleregisterAddress: async (
        provinceCode: number,
        cityCode: number,
        countyCode: number,
        townCode: number,
        address: string
      ) => {
        let province,
          city,
          county,
          town,
          info = "";
        provinceCode &&
          (province = await METHODS.handleProvinceCode(provinceCode));
        cityCode && (city = await METHODS.handleCityCode(cityCode));
        countyCode && (county = await METHODS.handleCountyCode(countyCode));
        townCode && (town = await METHODS.handleTownCode(townCode));
        if (province) {
          info += province.name;
        }
        if (city) {
          info += `/${city.name}`;
        }
        if (county) {
          info += `/${county.name}`;
        }
        if (town) {
          info += `/${town.name}`;
        }
        return address ? `${info}/${address}` : info;
      },
      // 跳转编辑页面
      handleSkipEditpage: async () => {
        await STORE.commit("setCompanyInfo", {
          type: STORE.state.globalData.companyInfo.type,
          companyId: STORE.state.globalData.companyInfo.companyId,
        });
        ROUTER.push({
          name: "createTrade",
        });
      },
      // 获取标签云
      handlegetLabel: async () => {
        let { data } = await getLabel({
          companyId:
            STORE.state.user.personnel.unitType === 2 &&
            ROUTE.path === "/ent/industry"
              ? STORE.state.user.personnel.companyId
              : STORE.state.globalData.companyInfo.companyId,
        });
        if (data.code === RES_SUCCESS) {
          DATA.labelList = data.data;
        }
      },
    });
    onMounted(async () => {
      STORE.commit("setTitle", ROUTE.params.title || "企业档案管理");
      STORE.commit("setTwoTitle", ROUTE.params.twoTitle || "工贸行业管理");
      METHODS.handlegetLabel();
      DATA.loading = true;
      await METHODS.handleGetCompanyDetails();
      DATA.loading = false;
      DATA.type = await METHODS.handleGetDist("t_company_ledger_type"); //企业类型
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      user,
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
}
.edit {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 20px;
  &:hover {
    color: $textColor;
  }
}
/deep/ .el-loading-spinner {
  top: 7%;
}
</style>