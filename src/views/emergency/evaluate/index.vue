<template>
  <el-row class="container"  style="height:100%">
    <el-col
      :span="24"
      class="mb-10"
    >
      <EleCascader
        @handleChange="handleChange"
        class="mr-10 mb-10"
        ids="evaluate"
      />
      <!-- 液位 传感器 -->
      <el-select
        v-model="liquidLevel"
        placeholder="液位传感器"
        class="mr-10"
        clearable
        :disabled="liquidLevelDisabled"
        @change="changeliquidLevel"
      >
        <el-option
          v-for="item of liquidLevelList"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        ></el-option>
      </el-select>
      <!-- 液压 传感器 -->
      <el-select
        v-model="hydraumatic"
        placeholder="液压传感器"
        class="mr-10"
        clearable
        @change="changehydraumatic"
      >
        <el-option
          v-for="item of hydraumaticList"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        ></el-option>
      </el-select>
      <!-- 泄漏量 -->
      <el-input
        v-model="leakPercent"
        placeholder="泄漏量(T)"
        style="width:200px"
        class="mr-10"
      >
        <template #append>%</template>
      </el-input>
      <el-button
        type="primary"
        class="mr-10"
        @click="handleBlast"
        :loading="blastLoading"
      >模拟爆炸</el-button>
      <el-button
        type="primary"
        @click="handleToxicosis"
        :loading="toxicosisLoading"
      >模拟中毒</el-button>
    </el-col>
    <!-- 地图 -->
    <el-col
      :span="20"
      class="pr-20"
    >
      <Amap
        class="amap"
        AmapId="Emergency"
        module="emergency"
        :blastData="blastData"
        :toxicosisData="toxicosisData"
        :companyList="peripheralData"
        @getForecast="getForecast"
        :latitude="latitude"
        :longitude="longitude"
      />
      <div class="info mt-10">
        注：死亡区半径：<span class="death"></span> 重伤区半径：<span class="severe"></span> 轻伤区半径：<span class="slight"></span> 安全区半径：无
      </div>
    </el-col>
    <!-- 标签 -->
    <el-col
      :span="4"
      class="left_label"
    >
      <BigContainer
        title="周边建筑标识"
        class="mb-20"
      >
        <template #body>
          <div class="d_flex flex-wrap">
            <div
              v-for="item of peripheralType"
              :key="item.id"
              class="peripheralType d_flex mb-10 mr-10"
            >
              <img
                :src="item.filePath"
                class="mr-10"
              >
              <span style="font-size:12px;font-weight: bold">{{item.peripheral}}</span>
            </div>
          </div>
        </template>
      </BigContainer>
      <BigContainer
        title="传感器数据"
        class="mb-20"
      >
        <template #body>
          <div>
            <h5 class="mb-10 mr-10">液氨罐液位检测:{{liquidLevelValue % 1 === 0 ? liquidLevelValue : +liquidLevelValue.toFixed(2)}}</h5>
            <h5 class="mr-10">液氨罐液压检测:{{hydraumaticValue % 1 === 0 ? hydraumaticValue : +hydraumaticValue.toFixed(2)}}</h5>
          </div>
        </template>
      </BigContainer>
      <BigContainer
        title="中毒事故分析及模拟评价"
        class="mb-20"
        v-if="istoxicosis"
      >
        <template #body>
          <div>
            <h5 class="mb-10 mr-10">泄漏时所剩量: {{remainingTotal % 1 === 0 ? remainingTotal : +remainingTotal.toFixed(2)}}t</h5>
            <h5 class="mb-10 mr-10">泄漏量: {{leak % 1 === 0 ? leak : leak.toFixed(2)}}t</h5>
            <h5 class="mb-10 mr-10">当日气温: {{temperature}}°C</h5>
            <h5 class="mb-10 mr-10">
              液氨全部气化热量: {{ammoniaVaporizationHeat % 1 === 0 ? ammoniaVaporizationHeat : +ammoniaVaporizationHeat.toFixed(2)}}kJ
            </h5>
            <h5 class="mb-10 mr-10">
              液氨全部蒸发量: {{ammoniaEvaporationMass % 1 === 0 ? ammoniaEvaporationMass : +ammoniaEvaporationMass.toFixed(2)}}kg
            </h5>
            <h5 class="mb-10 mr-10">
              液氨蒸发体积: {{ammoniaEvaporationVolume % 1 === 0 ? ammoniaEvaporationVolume : +ammoniaEvaporationVolume.toFixed(2)}}m³
            </h5>
            <h5 class="mb-10 mr-10">轻伤区半径: {{Math.round(MinorInjuryZoneRadius)}}m</h5>
            <h5 class="mb-10 mr-10">有毒气体扩散半径: {{Math.round(toxicGasDiffusionRadius)}}m</h5>
          </div>
        </template>
      </BigContainer>
      <BigContainer
        title="爆炸事故分析及模拟评价"
        class="mb-20"
        v-if="isblast"
      >
        <template #body>
          <div>
            <h5 class="mb-10 mr-10">泄漏时所剩量: {{remainingTotal % 1 === 0 ? remainingTotal : +remainingTotal.toFixed(2)}}t</h5>
            <h5 class="mb-10 mr-10">泄漏量: {{leak % 1 === 0 ? leak : leak.toFixed(2)}}t</h5>
            <h5 class="mb-10 mr-10">爆炸总能量: {{explosionEnergy % 1 === 0 ? explosionEnergy : +explosionEnergy.toFixed(2)}}kJ</h5>
            <h5 class="mb-10 mr-10">爆炸相当于TNT炸药量: {{explosiveEquivalent % 1 === 0 ? explosiveEquivalent : +explosiveEquivalent.toFixed(2)}}kg</h5>
            <h5 class="mb-10 mr-10">死亡区半径: {{Math.round(deadZoneRadius)}}m</h5>
            <h5 class="mb-10 mr-10">重伤区半径: {{Math.round(SevereInjuryZoneRadius)}}m</h5>
            <h5 class="mb-10 mr-10">轻伤区半径: {{Math.round(MinorInjuryZoneRadius)}}m</h5>
          </div>
        </template>
      </BigContainer>
      <BigContainer
        title="危化品泄漏影响分析说明"
        class="mb-20"
      >
        <template #body>
          <div class="explain">
            <p class="mb-10">
              液氨蒸汽云爆炸事故模拟评价中：
              “泄露时所剩量”，是指液氨罐在发生泄露爆炸时，最后读取的液氨罐中液氨的存量值。
            </p>
            <p class="mb-10">
              危化品泄露，液氨蒸汽云爆炸事故：
            </p>
            <p class="mb-10">
              死亡区：死亡区内的人员缺少防护，则被认为将无例外的蒙受重伤或死亡， 该区域的无防护人员因爆炸产生的冲击波作用导致肺出血而死亡的概率为50%。
            </p>
            <p class="mb-10">
              重伤区：重伤区的人员如缺少防护，则绝大多数将遭受严重伤害，极少数人可能死亡， 该区域的无防护人员因爆炸产生的冲击波作用导致耳膜破损的概率为50%。
            </p>
            <p class="mb-10">
              轻伤区：轻伤区的人员如缺少防护，则绝大多数将遭受轻微伤害，极少数人可能受重伤或平安无事， 该区域的无防护人员因爆炸产生的冲击波作用导致耳膜破损的概率为1%。
            </p>
            <p class="mb-10">
              安全区：安全区内的人员，即使无防护，绝大多数也不会受伤。
            </p>
            <p class="mb-10">
              液氨中毒事故模拟分析评价中：
              有毒气体扩散半径：液氨泄漏后，形成的有毒气体，会在空气中以半球形向地面扩散。 空气中氨气浓度到达0.5%时，人吸入5～10秒即可致死。
            </p>
          </div>
        </template>
      </BigContainer>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import Amap from '@/components/amap/index.vue';
import BigContainer from '@/views/ent/companyDetails/component/bigContainer.vue';
import EleCascader from '@/components/eleCascader2/index.vue';
import {
  findByDevice,
  findByPosition,
  findByPressure,
} from '@/api/emergency/evaluate';
import { useStore } from 'vuex';
import { RES_SUCCESS } from '@/api/common/common';
import {
  getAllPeripheralType,
  getAroundInformationByCompany,
} from '@/api/emergency/surround';
import { verifyDecimals } from '@/api/common/verify';
import { ElMessage } from 'element-plus';
import { companyDetails } from '@/api/company';

export default defineComponent({
  components: { Amap, BigContainer, EleCascader },
  setup() {
    const STORE = useStore();
    let DATA: any = reactive({
      blastLoading: false,
      toxicosisLoading: false,
      liquidLevelDisabled: false,
      companyId: null,
      options: [],
      props: { expandTrigger: 'hover' },
      // 液位传感器
      liquidLevel: null,
      liquidLevelValue: null,
      liquidLevelList: [],
      // 液压 传感器
      sensorTotal: null,
      hydraumatic: null,
      hydraumaticValue: null,
      hydraumaticList: [], //液压传感器列表
      peripheralData: [], //周边信息
      isblast: false, //是否模拟爆炸
      istoxicosis: false, //是否模拟中毒
      blastData: [], // 爆炸数据
      toxicosisData: [], //中毒数据
      peripheralType: [], //周边类型
      longitude: 113.401958, // 经度(C)
      latitude: 24.207083, // 纬度(C)
      temperature: 0.0, // 气温(°C)
      windPower: 0.0, // 风力
      windSpeed: 0.0, // 风速(m/s)
      remainingTotal: 0.0, // 泄漏时所剩量(t)
      leak: 0.0, // 泄漏量(t)
      leakPercent: '', // 泄漏量(%)
      explosionEnergy: 0.0, // 爆炸总能量(kJ)
      explosiveEquivalent: 0.0, // 爆炸相当于TNT炸药量(kg)
      deadZoneRadius: 0.0, // 死亡区半径(m)
      SevereInjuryZoneRadius: 0.0, // 重伤区半径(m)
      MinorInjuryZoneRadius: 0.0, // 轻伤区半径(m)
      ammoniaVaporizationHeat: 0.0, // 液氨全部气化热量(kJ)
      ammoniaEvaporationMass: 0.0, // 液氨全部蒸发量(kg)
      ammoniaEvaporationVolume: 0.0, // 液氨蒸发体积(m3)
      toxicGasDiffusionRadius: 0.0, // 有毒气体扩散半径(m)
      semiMajorAxes: [], // 风速扩散椭圆半长轴
      semiMinorAxes: [], // 风速扩散椭圆半短轴
      weatherList: [], //天气
    });
    let METHODS = reactive({
      handleGetCompanyDetails: async (companyId: number) => {
        let { data } = await companyDetails({ companyId });
        if (data.code === RES_SUCCESS) {
          DATA.longitude = data.data?.companyInfo.longitude;
          DATA.latitude = data.data?.companyInfo.latitude;
        }
      },
      handleChange: (value: any) => {
        DATA.liquidLevel = null;
        DATA.hydraumatic = null;
        if (value !== null) {
          
          DATA.companyId = value.id;
          METHODS.handleGetHydraulic(DATA.companyId);
          METHODS.handleGetLiquidLevel(DATA.companyId);
          METHODS.handleGetCompanyDetails(DATA.companyId);
        } else {
          DATA.companyId = null;
          DATA.sensorTotal = null;
          DATA.hydraumaticList = [];
          DATA.liquidLevelList = [];
          DATA.liquidLevel = null;
          DATA.hydraumatic = null;
          DATA.liquidLevelValue = null;
          DATA.hydraumaticValue = null;
        }
      },
      // 计算爆炸危害
      handleBlast: () => {
        if (!DATA.companyId) {
          ElMessage({
            message: '请选择企业',
            type: 'warning',
          });
          return;
        }
        if (!(DATA.liquidLevel && DATA.hydraumatic)) {
          ElMessage({
            message: '传感器不能为空',
            type: 'warning',
          });
          return;
        }
        if (DATA.leakPercent === '' || DATA.leakPercent === null) {
          ElMessage({
            message: '泄漏量不能为空',
            type: 'warning',
          });
          return;
        } else {
          if (
            !verifyDecimals.test(DATA.leakPercent) ||
            !(DATA.leakPercent >= 0 && DATA.leakPercent <= 100)
          ) {
            ElMessage({
              message: '泄漏量范围在0%至100%',
              type: 'warning',
            });
            return;
          }
        }
        if (DATA.sensorTotal === null) {
          ElMessage({
            message: '该液位传感器暂无数据',
            type: 'warning',
          });
          return;
        }
        // 爆炸危害
        DATA.leak = (DATA.sensorTotal * DATA.leakPercent) / 100;
        DATA.remainingTotal = DATA.sensorTotal * (1 - DATA.leakPercent / 100);
        DATA.explosionEnergy = 1338480 * DATA.sensorTotal * DATA.leakPercent;
        DATA.explosiveEquivalent =
          164.5132743 * DATA.sensorTotal * DATA.leakPercent;
        DATA.deadZoneRadius =
          13.6 * Math.pow(DATA.explosiveEquivalent / 1000, 0.37);
        DATA.SevereInjuryZoneRadius =
          0.996 * Math.pow((DATA.explosionEnergy * 1000) / 101325, 1 / 3);
        DATA.MinorInjuryZoneRadius =
          1.672 * Math.pow((DATA.explosionEnergy * 1000) / 101325, 1 / 3);
        // 安全区半径(米)>MinorInjuryZoneRadius
        DATA.isblast = true;
        DATA.istoxicosis = false;
        if (!DATA.longitude && !DATA.latitude) {
          ElMessage({
            message: '请设置该企业经纬度位置查看地理信息',
            type: 'warning',
          });
        } else {
          DATA.blastData = [
            {
              id: 'C',
              position: [DATA.longitude, DATA.latitude],
              circle: {
                radius: DATA.MinorInjuryZoneRadius,
                strokeColor: '#fdf4d9',
                strokeOpacity: 0.2,
                fillColor: '#fdf4d9',
                fillOpacity: 0.5,
              },
              desc: '数据_3',
            },
            {
              id: 'B',
              position: [DATA.longitude, DATA.latitude],
              circle: {
                radius: DATA.SevereInjuryZoneRadius,
                strokeColor: '#fdf4d9',
                strokeOpacity: 0.2,
                fillColor: '#edcb98',
                fillOpacity: 0.5,
              },
              desc: '数据_2',
            },
            {
              id: 'A',
              position: [DATA.longitude, DATA.latitude],
              circle: {
                radius: DATA.deadZoneRadius,
                strokeColor: '#fdf4d9',
                strokeOpacity: 0.2,
                fillColor: '#f2a788',
                fillOpacity: 0.5,
              },
              desc: '数据_1',
            },
          ];
        }
        METHODS.getAroundInformationByCompany(DATA.companyId);
      },
      // 计算中毒
      handleToxicosis: () => {
        if (!DATA.companyId) {
          ElMessage({
            message: '请选择企业',
            type: 'warning',
          });
          return;
        }
        if (!(DATA.liquidLevel && DATA.hydraumatic)) {
          ElMessage({
            message: '传感器不能为空',
            type: 'warning',
          });
          return;
        }
        if (DATA.leakPercent === '' || DATA.leakPercent === null) {
          ElMessage({
            message: '泄漏量不能为空',
            type: 'warning',
          });
          return;
        } else {
          if (
            !verifyDecimals.test(DATA.leakPercent) ||
            !(DATA.leakPercent >= 0 && DATA.leakPercent <= 100)
          ) {
            ElMessage({
              message: '泄漏量范围在0%至100%',
              type: 'warning',
            });
            return;
          }
        }
        if (DATA.sensorTotal === null) {
          ElMessage({
            message: '该液位传感器暂无数据',
            type: 'warning',
          });
          return;
        }
        // 系数
        let k = [3, 2, 1];
        // 风力等级列表
        let windPowerList = [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        ];
        // 风力等级
        let windPower: any;
        // 用于判断 获取第一个值
        let first = true;
        // 颜色
        let colors = ['#f1e3cf', '#ecc386', '#f77a61'];
        // 绘制椭圆数据
        let toxicosisData = [];
        // 中毒危害
        DATA.temperature = DATA.weatherList[0].dayTemp;
        DATA.leak = (DATA.sensorTotal * DATA.leakPercent) / 100;
        DATA.remainingTotal = DATA.sensorTotal * (1 - DATA.leakPercent / 100);
        DATA.explosionEnergy = 1338480 * DATA.sensorTotal * DATA.leakPercent;
        DATA.MinorInjuryZoneRadius =
          1.672 * Math.pow((DATA.explosionEnergy * 1000) / 101325, 1 / 3);
        DATA.ammoniaVaporizationHeat =
          DATA.sensorTotal * 1000 * 4.6 * (DATA.temperature + 33);
        DATA.ammoniaEvaporationMass =
          DATA.ammoniaVaporizationHeat / (1.37 * 1000);
        DATA.ammoniaEvaporationVolume =
          ((22.4 * DATA.ammoniaEvaporationMass) / 17) * ((273 - 33) / 273);
        DATA.toxicGasDiffusionRadius = Math.pow(
          DATA.ammoniaEvaporationVolume / 0.005 / 2.0944,
          1 / 3
        );
        // 风力 转 风速
        windPowerList.forEach((item) => {
          if (DATA.windPower <= item && first) {
            windPower = item;
            first = false;
          }
        });
        switch (windPower) {
          case 0:
            DATA.windSpeed = 0.2;
            break;
          case 1:
            DATA.windSpeed = 1.5;
            break;
          case 2:
            DATA.windSpeed = 3.3;
            break;
          case 3:
            DATA.windSpeed = 5.4;
            break;
          case 4:
            DATA.windSpeed = 7.9;
            break;
          case 5:
            DATA.windSpeed = 10.7;
            break;
          case 6:
            DATA.windSpeed = 13.8;
            break;
          case 7:
            DATA.windSpeed = 17.1;
            break;
          case 8:
            DATA.windSpeed = 20.7;
            break;
          case 9:
            DATA.windSpeed = 24.4;
            break;
          case 10:
            DATA.windSpeed = 28.4;
            break;
          case 11:
            DATA.windSpeed = 32.6;
            break;
          case 12:
            DATA.windSpeed = 36.9;
            break;
          case 13:
            DATA.windSpeed = 41.4;
            break;
          case 14:
            DATA.windSpeed = 46.1;
            break;
          case 15:
            DATA.windSpeed = 50.9;
            break;
          case 16:
            DATA.windSpeed = 56.0;
            break;
          default:
            break;
        }
        // 计算椭圆半径
        k.forEach((item) => {
          DATA.semiMajorAxes.push((DATA.windSpeed * item * 60) / 2); // 椭圆半长轴
        });
        DATA.semiMajorAxes.forEach((item: any) => {
          DATA.semiMinorAxes.push(item / 2); // 椭圆半短轴
        });
        DATA.istoxicosis = true;
        DATA.isblast = false;
        if (!DATA.longitude && !DATA.latitude) {
          ElMessage({
            message: '请设置该企业经纬度位置查看地理信息',
            type: 'warning',
          });
        } else {
          for (let index = 0; index < 3; index++) {
            toxicosisData.push({
              // center: [113.401958, 24.207083],
              center: [
                METHODS.getLonAndLat(
                  DATA.longitude,
                  DATA.latitude,
                  0,
                  DATA.semiMajorAxes[index]
                ).lng,
                METHODS.getLonAndLat(
                  DATA.longitude,
                  DATA.latitude,
                  0,
                  DATA.semiMajorAxes[index]
                ).lat,
              ],
              radius: [DATA.semiMinorAxes[index], DATA.semiMajorAxes[index]],
              color: colors[index],
            });
          }
          DATA.toxicosisData = toxicosisData;
          DATA.blastData = [
            {
              id: 'C',
              position: [DATA.longitude, DATA.latitude],
              circle: {
                radius: DATA.toxicGasDiffusionRadius,
                strokeColor: '#fdf4d9',
                strokeOpacity: 0.2,
                fillColor: '#f45b5c',
                fillOpacity: 0.8,
              },
              desc: '数据_3',
            },
          ];
        }

        METHODS.getAroundInformationByCompany(DATA.companyId);
      },
      //  获取液压
      handleGetHydraulic: async (companyInfoId: number) => {
        let { data } = await findByPressure({ companyInfoId });
        if (data.code === RES_SUCCESS) {
          DATA.hydraumaticList = data?.data;
          if (data?.data.length === 0) {
            ElMessage({
              message: '该企业暂无液压传感器',
              type: 'warning',
            });
          }
        }
      },
      //  获取液位
      handleGetLiquidLevel: async (companyInfoId: number) => {
        let { data } = await findByPosition({ companyInfoId });
        if (data.code === RES_SUCCESS) {
          DATA.liquidLevelList = data?.data;
          if (data?.data.length === 0) {
            ElMessage({
              message: '该企业暂无液位传感器',
              type: 'warning',
            });
          }
        }
      },
      // 切换液位
      changeliquidLevel: async () => {
        if (DATA.liquidLevel) {
          DATA.blastLoading = true;
          DATA.toxicosisLoading = true;
          DATA.liquidLevelDisabled = true;
          let { data } = await findByDevice({ deviceId: DATA.liquidLevel });
          if (data.code === RES_SUCCESS) {
            DATA.liquidLevelList?.forEach((item: any) => {
              if (item.id === DATA.liquidLevel) {
                if (data.data !== null) {
                  DATA.liquidLevelValue = data.data?.value + 't';
                  DATA.sensorTotal = data.data?.value;
                } else {
                  DATA.liquidLevelValue = '';
                  DATA.sensorTotal = null;
                  ElMessage({
                    message: '该液位传感器暂无数据',
                    type: 'warning',
                  });
                }
              }
            });
          }
          DATA.blastLoading = false;
          DATA.toxicosisLoading = false;
          DATA.liquidLevelDisabled = false;
        } else {
          DATA.liquidLevelValue = null;
        }
      },
      // 切换液压
      changehydraumatic: async () => {
        if (DATA.hydraumatic) {
          let { data } = await findByDevice({ deviceId: DATA.hydraumatic });
          if (data.code === RES_SUCCESS) {
            DATA.hydraumaticList?.forEach((item: any) => {
              if (item.id === DATA.hydraumatic) {
                DATA.hydraumaticValue =
                  data.data !== null ? data.data?.value + 't' : '';
              }
            });
          }
        } else {
          DATA.hydraumaticValue = null;
        }
      },
      // 获取企业周边信息
      getAroundInformationByCompany: async (companyId: number) => {
        let { data } = await getAroundInformationByCompany({ companyId });
        if (data.code === RES_SUCCESS) {
          DATA.peripheralData = data.data;
        }
      },
      //获取所有的周边类型列表
      getAllType: async () => {
        let { data } = await getAllPeripheralType();
        if (data.code === RES_SUCCESS) {
          DATA.peripheralType = data.data;
        }
      },
      // 获取天气
      getForecast: (data: any) => {
        if (data.info === 'OK') {
          DATA.weatherList = data.forecasts;
          if (data.forecasts[0].dayWindPower.indexOf('≤') === -1) {
            DATA.windPower = parseInt(data.forecasts[0].dayWindPower);
          } else {
            DATA.windPower = parseInt(data.forecasts[0].dayWindPower.slice(1));
          }
        }
      },
      getLonAndLat: (lng: any, lat: any, brng: any, dist: any) => {
        //大地坐标系资料WGS-84 长半径a=6378137 短半径b=6356752.3142 扁率f=1/298.2572236
        var a = 6378137;
        var b = 6356752.3142;
        var f = 1 / 298.257223563;

        var lon1 = lng * 1;
        var lat1 = lat * 1;
        var s = dist;
        var alpha1 = METHODS.rad(brng);
        var sinAlpha1 = Math.sin(alpha1);
        var cosAlpha1 = Math.cos(alpha1);

        var tanU1 = (1 - f) * Math.tan(METHODS.rad(lat1));
        var cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
          sinU1 = tanU1 * cosU1;
        var sigma1 = Math.atan2(tanU1, cosAlpha1);
        var sinAlpha = cosU1 * sinAlpha1;
        var cosSqAlpha = 1 - sinAlpha * sinAlpha;
        var uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
        var A =
          1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        var B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

        var sigma = s / (b * A),
          sigmaP = 2 * Math.PI;
        while (Math.abs(sigma - sigmaP) > 1e-12) {
          var cos2SigmaM: any = Math.cos(2 * sigma1 + sigma);
          var sinSigma: any = Math.sin(sigma);
          var cosSigma: any = Math.cos(sigma);
          var deltaSigma =
            B *
            sinSigma *
            (cos2SigmaM +
              (B / 4) *
                (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                  (B / 6) *
                    cos2SigmaM *
                    (-3 + 4 * sinSigma * sinSigma) *
                    (-3 + 4 * cos2SigmaM * cos2SigmaM)));
          sigmaP = sigma;
          sigma = s / (b * A) + deltaSigma;
        }

        var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
        var lat2 = Math.atan2(
          sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
          (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)
        );
        var lambda = Math.atan2(
          sinSigma * sinAlpha1,
          cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
        );
        var C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        var L =
          lambda -
          (1 - C) *
            f *
            sinAlpha *
            (sigma +
              C *
                sinSigma *
                (cos2SigmaM +
                  C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

        var revAz = Math.atan2(sinAlpha, -tmp); // final bearing

        var lngLatObj = { lng: lon1 + METHODS.deg(L), lat: METHODS.deg(lat2) };
        return lngLatObj;
      },
      /**
       * 度换成弧度
       * @param  {Float} d  度
       * @return {[Float}   弧度
       */
      rad: (d: any) => {
        return (d * Math.PI) / 180.0;
      },
      /**
       * 弧度换成度
       * @param  {Float} x 弧度
       * @return {Float}   度
       */
      deg: (x: any) => {
        return (x * 180) / Math.PI;
      },
    });
    onMounted(() => {
      METHODS.getAllType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>

<style lang="scss" scoped>
.container{
  height: calc(100% - 40px) !important;
}
@mixin infoBlock($color) {
  width: 20px;
  height: 10px;
  display: inline-block;
  background-color: $color;
}
.amap {
  width: 100%;
  height: calc(100vh - 250px);
}
.left_label {
  height: calc(100vh - 250px);
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;
  }
}
.explain {
  overflow: auto;
  font-size: 14px;
  /* 定义滚动条样式 */
  &::-webkit-scrollbar {
    // width: 6px;
    height: 6px;
    background-color: rgba(117, 108, 108, 0.5);
    border-radius: 10px;
  }
  /*定义滚动条轨道 内阴影+圆角*/
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0px rgba(240, 240, 240, 0.5);
    border-radius: 10px;
    background-color: rgba(240, 240, 240, 0.5);
  }
  /*定义滑块 内阴影+圆角*/
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 0px rgba(240, 240, 240, 0.5);
    background-color: rgba(40, 44, 52, 0.5);
  }
}
.info {
  font-size: 14px;
  .death {
    @include infoBlock(#ffa4a4);
  }
  .severe {
    @include infoBlock(#ecb96d);
  }
  .slight {
    @include infoBlock(#f8e3c5);
  }
}
</style>