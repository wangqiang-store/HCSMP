<template>
  <el-row class="container" v-loading="loading">
    <el-col :span="20" class="pr-20">
      <!-- 基本信息 -->
      <big-container class="mb-20" title="基本信息">
        <template #header>
          <div class="d_flex d_flex_sb">
            <h3 class="ml-20">基本信息</h3>
            <el-button
              class="edit"
              type="text"
              v-if="
                !(
                  user.personnel.unitType === 2 &&
                  user.personnel.companyId !==
                    STORE.state.globalData.companyInfo.companyId
                ) && STORE.state.globalData.nonCoalEditBtn
              "
              @click="handleSkipEditpage"
              >进入编辑页 >>></el-button
            >
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

          <!-- 采矿许可证信息 -->
          <div class="mb-20">
            <LittleContainer title="采矿许可证信息" />
            <div v-if="miningInfo">
              <DescriptionsList
                class="p-20"
                :options="miningInfoOption"
                :data="miningInfo"
              />
              <!-- 采矿许可证信息表格 -->
              <ele-table
                v-if="miningInfo?.miningLicenseList?.length > 0"
                :tableData="miningInfo.miningLicenseList"
                :renderTable="miningInfoRenderTable"
                :isPreview="true"
              ></ele-table>
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 安全生产许可证信息 -->
          <div class="mb-20">
            <LittleContainer title="安全生产许可证信息" />
            <div v-if="safetyProductionInfo">
              <DescriptionsList
                class="p-20"
                :options="safetyProductionInfoOption"
                :data="safetyProductionInfo"
              />
              <!-- 安全生产许可证信息表格 -->
              <ele-table
                v-if="
                  safetyProductionInfo?.safetyProductionLicenseList?.length > 0
                "
                :tableData="safetyProductionInfo.safetyProductionLicenseList"
                :renderTable="safetyProductionInfoRenderTable"
                :isPreview="true"
              ></ele-table>
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 三同时及安全评价信息 -->
          <div class="mb-20">
            <LittleContainer title="三同时及安全评价信息" class="mb-20" />
            <!-- 三同时及安全评价信息表格 -->
            <ele-table
              v-if="threeMeanwhileInfo?.length > 0"
              :tableData="threeMeanwhileInfo"
              :renderTable="threeMeanwhileInfoRenderTable"
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

      <!-- 矿山生产信息 -->
      <big-container class="mb-20" title="矿山生产信息">
        <template #body>
          <!-- 矿山生产基本信息 -->
          <div class="mb-20">
            <LittleContainer title="矿山生产基本信息" />
            <div v-if="mineProductionBaseInfo">
              <DescriptionsList
                class="p-20"
                :options="mineProductionBaseInfoOption"
                :data="mineProductionBaseInfo"
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

          <!-- 爆破公司信息 -->
          <div class="mb-20">
            <LittleContainer title="爆破公司信息" />
            <div v-if="blastCompanyInfo">
              <DescriptionsList
                class="p-20"
                :options="blastCompanyInfoOption"
                :data="blastCompanyInfo"
              />
              <!-- 爆破公司信息表格 -->
              <ele-table
                v-if="blastCompanyInfo?.blastStaffInfoList?.length > 0"
                :tableData="blastCompanyInfo.blastStaffInfoList"
                :renderTable="blastCompanyInfoRenderTable"
                :isPreview="true"
              ></ele-table>
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 矿山生产相关服务信息 -->
          <div class="mb-20">
            <LittleContainer title="矿山生产相关服务信息" class="mb-20" />
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item title="年度技术服务" name="1">
                <!-- 年度技术服务表格 -->
                <ele-table
                  v-if="
                    mineProductionServeInfo?.annualTechnicalService?.length > 0
                  "
                  :tableData="mineProductionServeInfo.annualTechnicalService"
                  :renderTable="annualTechnicalServiceRenderTable"
                  :isPreview="true"
                ></ele-table>
                <el-empty
                  v-else
                  description="暂无数据"
                  :image="require('@/assets/image/zwxx.png')"
                ></el-empty>
              </el-collapse-item>
              <el-collapse-item title="应急预案备案" name="2">
                <!-- 应急预案备案表格 -->
                <ele-table
                  v-if="mineProductionServeInfo?.emergencyPlan?.length > 0"
                  :tableData="mineProductionServeInfo.emergencyPlan"
                  :renderTable="emergencyPlanRenderTable"
                  :isPreview="true"
                ></ele-table>
                <el-empty
                  v-else
                  description="暂无数据"
                  :image="require('@/assets/image/zwxx.png')"
                ></el-empty>
              </el-collapse-item>
              <el-collapse-item title="外包安全管理协议" name="3">
                <!-- 外包安全管理协议表格 -->
                <ele-table
                  v-if="
                    mineProductionServeInfo?.outsourcingSecurity?.length > 0
                  "
                  :tableData="mineProductionServeInfo.outsourcingSecurity"
                  :renderTable="outsourcingSecurityRenderTable"
                  :isPreview="true"
                ></ele-table>
                <el-empty
                  v-else
                  description="暂无数据"
                  :image="require('@/assets/image/zwxx.png')"
                ></el-empty>
              </el-collapse-item>
              <el-collapse-item title="安全责任险" name="4">
                <!-- 安全责任险表格 -->
                <ele-table
                  v-if="mineProductionServeInfo?.securityInsurance?.length > 0"
                  :tableData="mineProductionServeInfo.securityInsurance"
                  :renderTable="securityInsuranceRenderTable"
                  :isPreview="true"
                ></ele-table>
                <el-empty
                  v-else
                  description="暂无数据"
                  :image="require('@/assets/image/zwxx.png')"
                ></el-empty>
              </el-collapse-item>
              <el-collapse-item title="年度技术服务" name="5">
                <!-- 年度技术服务表格 -->
                <ele-table
                  v-if="mineProductionServeInfo?.rescueAgreement?.length > 0"
                  :tableData="mineProductionServeInfo.rescueAgreement"
                  :renderTable="rescueAgreementRenderTable"
                  :isPreview="true"
                ></ele-table>
                <el-empty
                  v-else
                  description="暂无数据"
                  :image="require('@/assets/image/zwxx.png')"
                ></el-empty>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 矿山生产信息 -->
          <div class="mb-20">
            <LittleContainer class="mb-20" title="矿山生产信息" />
            <div class="mb-20">
              <el-collapse v-model="mineProductionActiveName">
                <el-collapse-item title="施工单位信息" name="1">
                  <!-- 施工单位表格 -->
                  <ele-table
                    v-if="mineProductionInfo?.constructionUnitList?.length > 0"
                    :tableData="mineProductionInfo.constructionUnitList"
                    :renderTable="constructionUnitListRenderTable"
                    :isPreview="true"
                  ></ele-table>
                  <el-empty
                    v-else
                    description="暂无数据"
                    :image="require('@/assets/image/zwxx.png')"
                  ></el-empty>
                </el-collapse-item>
              </el-collapse>
            </div>
            <div>
              <div v-if="mineProductionInfo">
                <DescriptionsList
                  class="p-20"
                  :options="
                    companyInfo?.type === 1
                      ? mineProductionInfoOption
                      : mineOpenAirProductionInfoOption
                  "
                  :data="mineProductionInfo"
                />
              </div>
              <el-empty
                v-else
                description="暂无数据"
                :image="require('@/assets/image/zwxx.png')"
              ></el-empty>
            </div>
          </div>

          <!-- 企业全景图 -->
          <div class="mb-20">
            <LittleContainer class="mb-20" title="企业全景图" />
            <div v-if="panoramaInfo">
              <DescriptionsList
                class="p-20"
                :options="panoramaInfoOption"
                :data="panoramaInfo"
              />
            </div>
            <el-empty
              v-else
              description="暂无数据"
              :image="require('@/assets/image/zwxx.png')"
            ></el-empty>
          </div>

          <!-- 矿山排土场信息 -->
          <div class="mb-20">
            <LittleContainer class="mb-20" title="矿山排土场信息" />
            <DescriptionsList
              class="p-20 mb-20"
              :options="mineDumpInfoOption"
              :data="mineDumpInfo"
            />
            <div>
              <!-- 施工单位表格 -->
              <ele-table
                v-if="mineDumpInfo?.length > 0"
                :tableData="mineDumpInfo"
                :renderTable="mineDumpInfoRenderTable"
                :isPreview="true"
              ></ele-table>
              <el-empty
                v-else
                description="暂无数据"
                :image="require('@/assets/image/zwxx.png')"
              ></el-empty>
            </div>
          </div>
        </template>
      </big-container>

      <!-- 安全人员信息 -->
      <big-container class="mb-20" title="安全人员信息">
        <template #body>
          <!-- 安全人员信息 -->
          <div class="mb-20">
            <DescriptionsList
              class="p-20"
              :options="securityPersonnelInfoOption"
              :data="securityPersonnelInfo"
            />
            <div>
              <el-collapse v-model="securityPersonnelActiveName" accordion>
                <el-collapse-item title="人员明细" name="1">
                  <!-- 人员明细表格 -->
                  <ele-table
                    v-if="securityPersonnelInfo?.staffInfoList?.length > 0"
                    :tableData="securityPersonnelInfo.staffInfoList"
                    :renderTable="staffInfoListRenderTable"
                    :isPreview="true"
                  ></ele-table>
                  <el-empty
                    v-else
                    description="暂无数据"
                    :image="require('@/assets/image/zwxx.png')"
                  ></el-empty>
                </el-collapse-item>
                <el-collapse-item title="人员培训" name="2">
                  <!-- 人员培训表格 -->
                  <ele-table
                    v-if="securityPersonnelInfo?.staffTrainingList?.length > 0"
                    :tableData="securityPersonnelInfo.staffTrainingList"
                    :renderTable="staffTrainingListRenderTable"
                    :isPreview="true"
                  ></ele-table>
                  <el-empty
                    v-else
                    description="暂无数据"
                    :image="require('@/assets/image/zwxx.png')"
                  ></el-empty>
                </el-collapse-item>
              </el-collapse>
            </div>
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
              v-if="parameterInfo?.length > 0"
              :tableData="parameterInfo"
              :renderTable="parameterInfoRenderTable"
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
import {
  findById,
  getByKey,
  IMG_File,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from "@/api/common/common";
import { companyDetails, getLabel } from "@/api/company";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BigContainer from "./component/bigContainer.vue";
import LittleContainer from "./component/littleContainer.vue";
import DescriptionsList from "./component/descriptionsList.vue";
import EleTable from "@/components/eleTable/index.vue";
import CloudLabel from "@/components/cloudLabel/index.vue";
import { getCity, getCounty, getProvince, getTown } from "@/api/region";
import { filterTime } from "@/utils/filtration";
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
    const ROUTER: any = useRouter();
    const STORE = useStore();
    let { user } = useState(["user"]);
    let DATA: any = reactive({
      labelList: [],
      loading: false,
      // 采矿许可证信息
      miningInfo: {},
      // 安全生产信息
      safetyProductionInfo: {},
      // 三同时信息
      threeMeanwhileInfo: [],
      // 矿山生产基本信息
      mineProductionBaseInfo: {},
      // 爆破公司信息
      blastCompanyInfo: {},
      // 企业营业执照基础信息
      companyInfo: {},
      // 矿山生产相关服务信息
      mineProductionServeInfo: {},
      // 作业场所职业病危害申报回执
      receiptInfo: {},
      // 职业卫生信息
      occupationalInfo: {},
      // 矿山生产信息
      mineProductionInfo: {},
      // 企业全景图
      panoramaInfo: {},
      // 矿山排土场信息
      mineDumpInfo: {},
      // 安全人员信息
      securityPersonnelInfo: {},
      // 企业其他台账信息
      parameterInfo: [],
      // 应急演练
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
            <span class="el-tag el-tag--info el-tag--light" style="font-size:14px">经度${row.longitude}°</span>
            <span class="el-tag el-tag--info el-tag--light" style="font-size:14px">纬度${row.latitude}°</span> 
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
      companyType: [],
      registerAddress: "",
      /** 采矿许可证信息 */
      miningInfoOption: [
        {
          label: "采矿权人",
          prop: "rightHolder",
          width: "50%",
        },
        {
          label: "矿山名称",
          prop: "name",
          width: "50%",
        },
        {
          label: "地址",
          prop: "townCode",
          width: "100%",
          formatter: (row: any) => {
            return DATA.miningAddress;
          },
        },
        {
          label: "生产规模",
          width: "50%",
          formatter: (row: any) => {
            return row.productionScale
              ? `${row.productionScale}万吨/年`
              : false;
          },
        },
        {
          label: "矿区面积",
          prop: "acreage",
          width: "50%",
          formatter: (row: any) => {
            return row.acreage ? `${row.acreage}km²` : false;
          },
        },
        {
          label: "开采矿种",
          prop: "mineType",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let type = "";
            DATA.mineType.forEach((item: any) => {
              if (item.value === row.mineType) {
                type = item.name;
              }
            });
            return type
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${type}</span>`
              : false;
          },
        },
        {
          label: "开采深度",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            row.startDepth && (info += `${row.startDepth}米`);
            row.endDepth && (info += `至${row.endDepth}米`);
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span> `
              : false;
          },
        },
      ],
      miningInfoRenderTable: [
        {
          label: "采矿许可证号码",
          type: "text",
          prop: "code",
        },
        {
          label: "采矿许可证有效期",
          type: "moreText",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "核发单位",
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
      // 采矿许可证地址
      miningAddress: "",
      mineType: [],
      /** 安全生产许可证信息 */
      safetyProductionInfoOption: [
        {
          label: "单位名称",
          prop: "name",
          width: "50%",
        },
        {
          label: "主要负责人",
          prop: "principal",
          width: "50%",
        },
        {
          label: "单位地址",
          width: "50%",
          formatter: (row: any) => {
            return DATA.safetyProductionAddress;
          },
        },
        {
          label: "经济类型",
          prop: "economicType",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let type = "";
            DATA.economicType.forEach((item: any) => {
              if (item.value === row.economicType) {
                type = item.name;
              }
            });
            return type
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${type}</span>`
              : false;
          },
        },
        {
          label: "服务年限",
          prop: "serviceLength",
          width: "50%",
          formatter: (row: any) => {
            return row.serviceLength ? `${row.serviceLength}年` : false;
          },
        },
        {
          label: "是否注销",
          prop: "isLogout",
          width: "50%",
          formatter: (row: any) => {
            return row.isLogout ? "是" : "否";
          },
        },
        {
          label: "许可范围",
          prop: "licenseScope",
          width: "100%",
        },
      ],
      safetyProductionInfoRenderTable: [
        {
          label: "安全许可证号码",
          prop: "code",
          type: "text",
        },
        {
          label: "安全卫生许可证有效期",
          type: "moreText",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "发证机关",
          prop: "unit",
          type: "text",
        },
        {
          label: "扫描件",
          prop: "filePath",
          type: "file",
          href: "filePath",
          name: "fileName",
        },
      ],
      // 安全生产许可证地址
      safetyProductionAddress: "",
      economicType: [],
      /** 三同时及安全评价信息 */
      threeMeanwhileInfoRenderTable: [
        {
          label: "单位类型",
          prop: "unitType",
          type: "text",
          formatter: (row: any) => {
            let text = "";
            DATA.threeUnitType.forEach((item: any) => {
              if (item.value === row.unitType) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: "单位名称",
          prop: "unitName",
          type: "text",
        },
        {
          label: "单位资质",
          prop: "unitLevel",
          type: "text",
          formatter: (row: any) => {
            let text = "";
            DATA.threeUnitLevel.forEach((item: any) => {
              if (item.value === row.unitLevel) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: "评价时间",
          prop: "evaluationTime",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.evaluationTime, "-", false);
          },
        },
        {
          label: "扫描件",
          prop: "filePath",
          type: "file",
          href: "filePath",
          name: "fileName",
        },
      ],
      threeUnitType: [], //单位类型
      threeUnitLevel: [], //单位资质
      /** 矿山生产基本信息 */
      mineProductionBaseInfoOption: [
        {
          label: "是否为在建矿山",
          prop: "isConstruction",
          width: "50%",
          formatter: (row: any) => {
            return row.isConstruction ? "是" : "否";
          },
        },
        {
          label: "建设期限",
          prop: "constructTime",
          width: "50%",
          formatter: (row: any) => {
            return row.constructTime ? row.constructTime : false;
          },
        },
        {
          label: "运行情况",
          prop: "operationStatus",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let operationStatus = "";
            DATA.operationStatus.forEach((item: any) => {
              if (item.value === row.operationStatus) {
                operationStatus = item.name;
              }
            });
            return operationStatus
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${operationStatus}</span>`
              : false;
          },
        },
        {
          label: "标准化等级",
          prop: "standardizedLevel",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let standardizedLevel = "";
            DATA.standardizedLevel.forEach((item: any) => {
              if (item.value === row.standardizedLevel) {
                standardizedLevel = item.name;
              }
            });
            return standardizedLevel
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${standardizedLevel}</span>`
              : false;
          },
        },
        {
          label: "是否已关闭",
          prop: "isClose",
          width: "50%",
          formatter: (row: any) => {
            return row.isClose ? "是" : "否";
          },
        },
        {
          label: "投产时间",
          prop: "productionTime",
          width: "50%",
        },
      ],
      operationStatus: [], //运行情况
      standardizedLevel: [], //标准化等级
      /** 爆破公司信息 */
      blastCompanyInfoOption: [
        {
          label: "作业单位名称",
          prop: "name",
          width: "50%",
        },
        {
          label: "单位资质",
          prop: "qualification",
          slot: true,
          width: "50%",
          formatter: (row: any) => {
            let qualification = "";
            DATA.qualification.forEach((item: any) => {
              if (item.value === row.qualification) {
                qualification = item.name;
              }
            });
            return qualification
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${qualification}</span>`
              : false;
          },
        },
      ],
      blastCompanyInfoRenderTable: [
        {
          label: "爆破员姓名",
          prop: "name",
          type: "text",
        },
        {
          label: "岗位",
          prop: "job",
          type: "text",
          formatter: (row: any) => {
            let job = "";
            DATA.blastGob?.forEach((item: any) => {
              if (row.job === item.value) {
                job = item.name;
              }
            });
            return job;
          },
        },
        {
          label: "电话",
          prop: "phone",
          type: "text",
        },
        {
          label: "身份证号码(护照号)",
          prop: "idCard",
          type: "text",
        },
        {
          label: "资格证书",
          prop: "certificate",
          type: "text",
        },
        {
          label: "证书编号",
          prop: "certificateCode",
          type: "text",
        },
        {
          label: "评价时间",
          prop: "expirationTime",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.expirationTime, "-", false);
          },
        },
        {
          label: "扫描件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ],
      qualification: [], //单位资质
      blastGob: [], //爆破岗位
      /** 矿山生产相关服务信息 */
      activeName: ["1", "2", "3", "4", "5"],
      annualTechnicalServiceRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "服务单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ], //年度技术服务
      emergencyPlanRenderTable: [
        {
          label: "备案有效期",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "备案单位",
          type: "text",
          prop: "unit",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ], //应急预案备案
      outsourcingSecurityRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "签订单位",
          type: "text",
          prop: "unit",
        },
      ], //外包安全协议
      securityInsuranceRenderTable: [
        {
          label: "起始时间",
          type: "text",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "-", false)} - ${filterTime(
              row.endTime,
              "-",
              false
            )}`;
          },
        },
        {
          label: "保险公司",
          type: "text",
          prop: "unit",
        },
      ], //安全责任险
      rescueAgreementRenderTable: [
        {
          label: "时间",
          type: "text",
          prop: "startTime",
          formatter: (row: any) => {
            return filterTime(row.startTime, "-", false);
          },
        },
        {
          label: "签订金额",
          type: "text",
          prop: "amount",
        },
        {
          label: "附件",
          type: "file",
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
      ], //救护协议
      /** 矿山生产信息 */
      mineProductionActiveName: ["1"],
      constructionUnitListRenderTable: [
        {
          label: "名称",
          prop: "name",
          type: "text",
        },
        {
          label: "单位资质",
          prop: "qualification",
          type: "text",
          formatter: (row: any) => {
            let text = "";
            DATA.mineProductionQualification.forEach((item: any) => {
              if (item.value === row.qualification) {
                text = item.name;
              }
            });
            return text;
          },
        },
        {
          label: "有效期",
          prop: "time",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.time, "-", false);
          },
        },
      ], //施工单位
      mineProductionQualification: [], //施工单位单位资质
      mineProductionInfoOption: [
        {
          label: "采矿方法",
          prop: "miningMethod",
          width: "100%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.miningMethod && (infoList = row.miningMethod.split(","));
            DATA.undergroundMiningMethod.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "开拓方式",
          prop: "openWay",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.openWay && (infoList = row.openWay.split(","));
            DATA.undergroundOpenWay.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "水泵硐室数量",
          prop: "pumpChambersSum",
          width: "50%",
          formatter: (row: any) => {
            return row.pumpChambersSum ? `${row.pumpChambersSum}个` : false;
          },
        },
        {
          label: "中央变电硐室长度",
          prop: "centralSubstationChamberLength",
          width: "50%",
          formatter: (row: any) => {
            return row.centralSubstationChamberLength
              ? `${row.centralSubstationChamberLength}m`
              : false;
          },
        },
        {
          label: "直达地面是安全出口数量",
          prop: "exportQuantitySum",
          width: "50%",
          formatter: (row: any) => {
            return row.exportQuantitySum ? `${row.exportQuantitySum}个` : false;
          },
        },
        {
          label: "井下单班最多作业人数",
          prop: "maxPeople",
          width: "50%",
          formatter: (row: any) => {
            return row.maxPeople ? `${row.maxPeople}人` : false;
          },
        },
        {
          label: "运输方式",
          prop: "transportMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.transportMethod && (infoList = row.transportMethod.split(","));
            DATA.undergroundTransportMethod.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "通风方式",
          prop: "ventilationMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.undergroundVentilationMethod.forEach((item: any) => {
              if (item.value == row.ventilationMethod) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "主要通风机工作方式",
          prop: "ventilatorWorkingMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.ventilatorWorkingMethod.forEach((item: any) => {
              if (item.value == row.ventilatorWorkingMethod) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "主要通风机数量",
          prop: "ventilatorSum",
          width: "50%",
          formatter: (row: any) => {
            return row.ventilatorSum ? `${row.ventilatorSum}台` : false;
          },
        },
        {
          label: "辅助通风机数量",
          prop: "auxiliaryVentilatorSum",
          width: "50%",
          formatter: (row: any) => {
            return row.auxiliaryVentilatorSum
              ? `${row.auxiliaryVentilatorSum}台`
              : false;
          },
        },
        {
          label: "局部通风机数量",
          prop: "partialVentilatorSum",
          width: "50%",
          formatter: (row: any) => {
            return row.partialVentilatorSum
              ? `${row.partialVentilatorSum}台`
              : false;
          },
        },
        {
          label: "水文地质条件",
          prop: "hydrogeological",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.hydrogeological.forEach((item: any) => {
              if (item.value == row.hydrogeological) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "凿岩设备",
          prop: "rockDrilling",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.rockDrilling && (infoList = row.rockDrilling.split(","));
            DATA.rockDrilling.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "凿岩设备数量",
          prop: "rockDrillingSum",
          width: "50%",
          formatter: (row: any) => {
            return row.rockDrillingSum ? `${row.rockDrillingSum}台` : false;
          },
        },
        {
          label: "炮孔",
          prop: "blasthole",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.blasthole && (infoList = row.blasthole.split(","));
            DATA.blasthole.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "采空区处理方式",
          prop: "goafTreatmentMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.goafTreatmentMethod &&
              (infoList = row.goafTreatmentMethod.split(","));
            DATA.goafTreatmentMethod.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "采空区总量",
          prop: "goafTreatmentArea",
          width: "50%",
          formatter: (row: any) => {
            return row.goafTreatmentArea ? `${row.goafTreatmentArea}m³` : false;
          },
        },
        {
          label: "三下开采",
          prop: "threeMining",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.threeMining.forEach((item: any) => {
              if (item.value == row.threeMining) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: '安全避险"六大系统"',
          prop: "safeHaven",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.safeHaven && (infoList = row.safeHaven.split(","));
            DATA.safeHaven.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
      ], //地下
      undergroundMiningMethod: [], //采矿方法
      undergroundOpenWay: [], //开拓方式
      undergroundTransportMethod: [], //运输方式
      undergroundVentilationMethod: [], //通风方式
      ventilatorWorkingMethod: [], //通风机工作方法
      hydrogeological: [],
      rockDrilling: [],
      blasthole: [],
      goafTreatmentMethod: [],
      threeMining: [],
      safeHaven: [],
      mineOpenAirProductionInfoOption: [
        {
          label: "开采工艺布置形式",
          prop: "miningProcessLayout",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.miningProcessLayout.forEach((item: any) => {
              if (item.value == row.miningProcessLayout) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "开采方式",
          prop: "miningMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.miningMethod.forEach((item: any) => {
              if (item.value == row.miningMethod) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "采场结构参数",
          prop: "stopeStructure",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.stopeStructure.forEach((item: any) => {
              if (item.value == row.stopeStructure) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "开拓运输",
          prop: "development",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.development.forEach((item: any) => {
              if (item.value == row.development) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "穿孔设备类型",
          prop: "perforationEquipment",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.perforationEquipment.forEach((item: any) => {
              if (item.value == row.perforationEquipment) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "爆破方法",
          prop: "blastingMethod",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.blastingMethod.forEach((item: any) => {
              if (item.value == row.blastingMethod) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "铲装",
          prop: "shovelLoading",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info: Array<string> = [];
            let infoList: Array<string> = [];
            row.shovelLoading && (infoList = row.shovelLoading.split(","));
            DATA.shovelLoading.forEach((item: any) => {
              infoList.forEach((val) => {
                if (item.value == val) {
                  info.push(item.name);
                }
              });
            });
            return info.length > 0
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info.join(
                  ","
                )}</span>`
              : false;
          },
        },
        {
          label: "二次破碎",
          prop: "secondaryCrushing",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.secondaryCrushing.forEach((item: any) => {
              if (item.value == row.secondaryCrushing) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "水文地质条件",
          prop: "hyConditions",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.hyConditions.forEach((item: any) => {
              if (item.value == row.hyConditions) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
        {
          label: "排水方式",
          prop: "drainageMode",
          width: "50%",
          slot: true,
          formatter: (row: any) => {
            let info = "";
            DATA.drainageMode.forEach((item: any) => {
              if (item.value == row.drainageMode) {
                info = item.name;
              }
            });
            return info
              ? `<span class="el-tag el-tag--info el-tag--light" style="font-size:14px">${info}</span>`
              : false;
          },
        },
      ], //露天
      miningProcessLayout: [],
      miningMethod: [],
      stopeStructure: [],
      development: [],
      perforationEquipment: [],
      blastingMethod: [],
      shovelLoading: [],
      secondaryCrushing: [],
      hyConditions: [],
      drainageMode: [],
      /** 企业全景图 */
      panoramaInfoOption: [
        {
          label: "企业全景图",
          width: "100%",
          prop: "imgFileId",
          slot: true,
          formatter: (row: any) => {
            return row.imgFileId
              ? `  <a
          href="${IMG_File + row.imgPath}"
          target="_blank"
          style="color:#33a6dc"
          title="${row.imgName}"
        >
          ${row.imgName}
        </a>`
              : false;
          },
        },
        {
          label: "全景图视频",
          width: "100%",
          prop: "videoFileId",
          slot: true,
          formatter: (row: any) => {
            return row.videoFileId
              ? `  <a
          href="${IMG_File + row.videoPath}"
          target="_blank"
          style="color:#33a6dc"
          title="${row.videoName}"
        >
          ${row.videoName}
        </a>`
              : false;
          },
        },
        {
          label: "备注信息",
          prop: "remark",
          width: "100%",
        },
      ],
      /** 矿山排土场信息 */
      mineDumpInfoOption: [
        {
          label: "是否存在排土场",
          width: "100%",
          formatter: () => {
            return DATA.mineDumpInfo.length > 0 ? "是" : "否";
          },
        },
      ],
      mineDumpInfoRenderTable: [
        {
          label: "排土场名称",
          prop: "name",
          type: "text",
        },
        {
          label: "设计服务年限",
          prop: "serviceYear",
          type: "text",
        },
        {
          label: "排土场是否关闭",
          prop: "isClose",
          type: "text",
          formatter: (row: any) => {
            return row.isClose ? "是" : "否";
          },
        },
        {
          label: "关闭时间",
          prop: "closeTime",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.closeTime, "-", false);
          },
        },
        {
          label: "排土场分类",
          prop: "mineDumpingType",
          type: "text",
          formatter: (row: any) => {
            let mineDumpingType = "";
            DATA.mineDumpingType &&
              DATA.mineDumpingType.forEach((item: any) => {
                if (item.value === row.mineDumpingType) {
                  mineDumpingType = item.name;
                }
              });
            return mineDumpingType;
          },
        },
        {
          label: "排土场工艺",
          prop: "dumpingProcess",
          type: "text",
          formatter: (row: any) => {
            let dumpingProcess = "";
            DATA.dumpingProcess &&
              DATA.dumpingProcess.forEach((item: any) => {
                if (item.value === row.dumpingProcess) {
                  dumpingProcess = item.name;
                }
              });
            return dumpingProcess;
          },
        },
        {
          label: "总容量",
          prop: "sum",
          type: "text",
        },
        {
          label: "现状排土总容量",
          prop: "currentSum",
          type: "text",
        },
      ],
      dumpingProcess: [],
      mineDumpingType: [],
      /** 安全人员信息 */
      securityPersonnelActiveName: ["1", "2"],
      securityPersonnelInfoOption: [
        {
          label: "安全机构设置(图)",
          slot: true,
          prop: "safeOrgSetFile",
          width: "50%",
          formatter: (row: any) => {
            return row?.safeOrgSetFile
              ? `<a
                href="${IMG_File + DATA.safeOrgSetFile.path}"
                target="_blank"
                style="color:#33a6dc"
                title="${DATA.safeOrgSetFile.name}"
              >
                ${DATA.safeOrgSetFile.name}
              </a>`
              : false;
          },
        },
        {
          label: "从业人数",
          prop: "employeeSum",
          width: "50%",
          formatter: (row: any) => {
            return row?.employeeSum ? `${row.employeeSum}人` : false;
          },
        },
        {
          label: "专职安全管理人数",
          prop: "safeManagerSum",
          width: "50%",
          formatter: (row: any) => {
            return row?.safeManagerSum ? `${row.safeManagerSum}人` : false;
          },
        },
        {
          label: "注册安全工程师人数",
          prop: "safeEngineerSum",
          width: "50%",
          formatter: (row: any) => {
            return row?.safeEngineerSum ? `${row.safeEngineerSum}人` : false;
          },
        },
        {
          label: "特种作业人数",
          prop: "specialOperationSum",
          width: "50%",
          formatter: (row: any) => {
            return row?.specialOperationSum
              ? `${row.specialOperationSum}人`
              : false;
          },
        },
        {
          label: "外包队伍人数",
          prop: "outsourceSum",
          width: "50%",
          formatter: (row: any) => {
            return row?.outsourceSum ? `${row.outsourceSum}人` : false;
          },
        },
      ],
      staffInfoListRenderTable: [
        {
          label: "姓名",
          type: "text",
          prop: "name",
        },
        {
          label: "岗位",
          type: "text",
          prop: "job",
          formatter: (row: any) => {
            let job = "";
            DATA.job?.forEach((item: any) => {
              if (row.job === item.value) {
                job = item.name;
              }
            });
            return job;
          },
        },
        {
          label: "电话",
          type: "text",
          prop: "phone",
        },
        {
          label: "身份证号(护照号)",
          type: "text",
          prop: "idCard",
        },
        {
          label: "资格证书",
          type: "text",
          prop: "certificate",
        },
        {
          label: "证书编号",
          type: "text",
          prop: "certificateCode",
        },
        {
          label: "证书有效期",
          type: "text",
          prop: "expirationTime",
          formatter: (row: any) => {
            return filterTime(row.expirationTime, "-", false);
          },
        },
        {
          label: "扫描件",
          prop: "filePath",
          type: "file",
          href: "filePath",
          name: "fileName",
        },
        {
          label: "年审信息",
          type: "text",
          prop: "annualReviewInfo",
        },
      ],
      staffTrainingListRenderTable: [
        {
          label: "人员名称",
          type: "text",
          prop: "name",
        },
        {
          label: "培训时间",
          type: "text",
          prop: "trainingTime",
          formatter: (row: any) => {
            return filterTime(row.trainingTime, "-", false);
          },
        },
        {
          label: "培训内容",
          type: "text",
          prop: "content",
        },
        {
          label: "考核结果",
          type: "text",
          prop: "result",
        },
      ],
      safeOrgSetFile: {},
      job: [],
      /** 企业台账信息 */
      parameterInfoRenderTable: [
        {
          label: "添加时间",
          prop: "addTime",
          type: "text",
          formatter: (row: any) => {
            return filterTime(row.addTime, "-", false);
          },
        },
        {
          label: "台账类型",
          prop: "type",
          type: "text",
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
          prop: "filePath",
          href: "filePath",
          name: "fileName",
        },
        {
          label: "备注",
          prop: "remark",
          type: "text",
        },
      ],
      type: [], //台账类型
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
        let { data } = await companyDetails({
          companyId:
            STORE.state.user.personnel.unitType === 2 &&
            ROUTE.path === "/ent/noncoalmine"
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
          //地理坐标
          DATA.coordinates = {
            latitude: data.data.companyInfo.latitude,
            longitude: data.data.companyInfo.longitude,
          };
          // 采矿许可证
          DATA.miningInfo = data.data.miningInfo;
          if (data.data.miningInfo) {
            DATA.miningAddress = await METHODS.handleregisterAddress(
              data.data.miningInfo.provinceCode,
              data.data.miningInfo.cityCode,
              data.data.miningInfo.countyCode,
              data.data.miningInfo.townCode,
              data.data.miningInfo.address
            );
          }

          // 安全生产许可证信息
          DATA.safetyProductionInfo = data.data.safetyProductionInfo;
          if (data.data.safetyProductionInfo) {
            DATA.safetyProductionAddress = await METHODS.handleregisterAddress(
              data.data.safetyProductionInfo.provinceCode,
              data.data.safetyProductionInfo.cityCode,
              data.data.safetyProductionInfo.countyCode,
              data.data.safetyProductionInfo.townCode,
              data.data.safetyProductionInfo.address
            );
          }
          // 三同时信息
          DATA.threeMeanwhileInfo = data.data.threesimultaneous;
          // 矿山生产基本信息
          DATA.mineProductionBaseInfo = data.data.mineProductionBaseInfo;
          // 爆破公司信息
          DATA.blastCompanyInfo = data.data.blastCompany;
          // 矿山生产相关服务信息
          DATA.mineProductionServeInfo = {
            emergencyPlan: data.data.emergencyPlan,
            outsourcingSecurity: data.data.outsourcingSecurity,
            rescueAgreement: data.data.rescueAgreement,
            securityInsurance: data.data.securityInsurance,
            annualTechnicalService: data.data.annualTechnicalService,
          };
          // 作业场所职业病危害申报回执
          DATA.receiptInfo = {
            occupationalDiseaseReceipt:
              data.data.occupationalDiseaseReceipt || [],
          };
          // 职业卫生信息
          DATA.occupationalInfo = {
            unitHealthTest: data.data.unitHealthTest || [],
            occupationalHealthTest: data.data.occupationalHealthTest || [],
          };
          // 矿山生产信息
          DATA.mineProductionInfo =
            data.data.companyInfo.type === 1
              ? data.data.mineProductionInfo
              : data.data.mineOpenAirProductionInfo;
          // 企业全景图
          DATA.panoramaInfo = data.data.companyPanorama;
          // 矿山排土场信息
          DATA.mineDumpInfo = data.data.mineDumpingInfo;
          // 安全人员信息
          DATA.securityPersonnelInfo = data.data.safeStaffInfo;
          if (data.data.safeStaffInfo?.safeOrgSetFile) {
            let res = await findById({
              id: data.data.safeStaffInfo.safeOrgSetFile,
            });
            if (res.data.code === RES_SUCCESS) {
              DATA.safeOrgSetFile = {
                path: res.data.data?.path,
                name: res.data.data?.name,
              };
            }
          }
          // 企业其他台账信息
          DATA.parameterInfo = data.data.ledgerInfoList;
          // 应急演练
          DATA.emergencyInfo = data.data.emergencyDrillList;
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
          name: "createCompany",
        });
      },
      // 获取标签云
      handlegetLabel: async () => {
        let { data } = await getLabel({
          companyId:
            STORE.state.user.personnel.unitType === 2 &&
            ROUTE.path === "/ent/noncoalmine"
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
      STORE.commit("setTwoTitle", ROUTE.params.twoTitle || "非煤矿山企业管理");
      DATA.loading = true;
      METHODS.handlegetLabel();
      await METHODS.handleGetCompanyDetails();
      DATA.companyType = await METHODS.handleGetDist("t_mine_company_type"); //企业类型
      DATA.mineType = await METHODS.handleGetDist("t_mine_type"); //获取开采矿种
      DATA.economicType = STORE.state.globalData.economicTypeList; // 经济类型
      DATA.threeUnitType = await METHODS.handleGetDist("t_three_unit_type"); //单位类型
      DATA.threeUnitLevel = await METHODS.handleGetDist("t_three_unit_level"); //单位资质

      DATA.operationStatus = await METHODS.handleGetDist(
        "t_mine_operation_status"
      ); //运行情况
      DATA.standardizedLevel = await METHODS.handleGetDist(
        "t_standardized_level"
      ); //标准化等级
      DATA.qualification = await METHODS.handleGetDist(
        "t_blast_qualification_type"
      ); //单位资质
      DATA.blastGob = await METHODS.handleGetDist("t_blast_staff_job"); //爆破岗位
      DATA.mineProductionQualification = await METHODS.handleGetDist(
        "t_qualification_type"
      ); //单位资质
      DATA.undergroundMiningMethod = await METHODS.handleGetDist(
        "t_mine_mining_method"
      ); //地下采矿方法
      DATA.undergroundOpenWay = await METHODS.handleGetDist("t_mine_open_way"); //地下开拓方式
      DATA.undergroundTransportMethod = await METHODS.handleGetDist(
        "t_mine_transport_method"
      ); //地下运输方式
      DATA.undergroundVentilationMethod = await METHODS.handleGetDist(
        "t_mine_ventilation_method"
      ); //地下通风方式
      DATA.ventilatorWorkingMethod = await METHODS.handleGetDist(
        "t_mine_ventilator_working_method"
      ); //通风机工作方法
      DATA.hydrogeological = await METHODS.handleGetDist(
        "t_mine_hydrogeological_type"
      );
      DATA.rockDrilling = await METHODS.handleGetDist(
        "t_mine_rock_drilling_type"
      );
      DATA.blasthole = await METHODS.handleGetDist("t_mine_blasthole_type");
      DATA.goafTreatmentMethod = await METHODS.handleGetDist(
        "t_mine_goaf_treatment_method"
      );
      DATA.threeMining = await METHODS.handleGetDist("t_mine_three_mining");
      DATA.safeHaven = await METHODS.handleGetDist("t_mine_safe_haven");
      DATA.miningProcessLayout = await METHODS.handleGetDist(
        "t_open_air_workmanship"
      );
      DATA.miningMethod = await METHODS.handleGetDist("t_open_air_mining_mode");
      DATA.stopeStructure = await METHODS.handleGetDist(
        "t_open_air_structure_parameters"
      );
      DATA.development = await METHODS.handleGetDist(
        "t_open_air_transportation"
      );
      DATA.perforationEquipment = await METHODS.handleGetDist(
        "t_open_air_perforation_type"
      );
      DATA.blastingMethod = await METHODS.handleGetDist(
        "t_open_air_blasting_method"
      );
      DATA.shovelLoading = await METHODS.handleGetDist(
        "t_open_air_shovel_loading"
      );
      DATA.secondaryCrushing = await METHODS.handleGetDist(
        "t_open_air_secondary_crushing"
      );
      DATA.hyConditions = await METHODS.handleGetDist(
        "t_open_air_hydrogeological"
      );
      DATA.drainageMode = await METHODS.handleGetDist(
        "t_open_air_drainage_mode"
      );
      DATA.dumpingProcess = await METHODS.handleGetDist(
        "t_mine_dumping_process"
      );
      DATA.mineDumpingType = await METHODS.handleGetDist("t_mine_dumping_type");

      DATA.job = await METHODS.handleGetDist("t_staff_job");
      DATA.type = await METHODS.handleGetDist("t_company_ledger_type");
      DATA.loading = false;
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
  padding-top: 0;
}
.container {
  padding: 20px;
  .label {
    font-weight: bold;
    font-size: 16px;
  }
  .text {
    font-size: 16px;
    color: #333333;
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
}
</style>