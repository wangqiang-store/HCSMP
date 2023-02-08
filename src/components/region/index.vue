<template>
  <el-row>
    <el-col
      :span="24"
      class="region"
    >
      <!-- 省 -->
      <el-select
        v-model="province"
        placeholder="请选择省"
        @change="handleChangeProvince"
        clearable
        :disabled="disable"
        class="mr-10"
      >
        <el-option
          v-for="item in provinceList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        >
        </el-option>
      </el-select>
      <!-- 市 -->
      <el-select
        v-model="city"
        placeholder="请选择市"
        @change="handleChangeCity"
        :disabled="disable"
        clearable
        class="mr-10"
      >
        <el-option
          v-for="item in cityList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        >
        </el-option>
      </el-select>
      <!-- 区、县 -->
      <el-select
        v-model="county"
        placeholder="请选择区、县 "
        @change="handleChangeCounty"
        :disabled="disable"
        clearable
        class="mr-10"
      >
        <el-option
          v-for="item in countyList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        >
        </el-option>
      </el-select>
      <!-- 乡、镇 -->
      <el-select
        v-model="town"
        placeholder="请选择乡、镇 "
        clearable
        :disabled="disable"
        @change="handleChangeTown"
      >
        <el-option
          v-for="item in townList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        >
        </el-option>
      </el-select>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { RES_SUCCESS } from '@/api/common/common';
import {
  getByCity,
  getByCounty,
  getByTown,
  getCity,
  getCounty,
  getTown,
} from '@/api/region';
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue';
import { useStore } from 'vuex';
export default defineComponent({
  emits: [
    'handleChangeProvince',
    'handleChangeCity',
    'handleChangeCounty',
    'handleChangeTown',
  ],
  props: {
    province: {
      type: Number,
    },
    city: {
      type: Number,
    },
    county: {
      type: Number,
    },
    town: {
      type: Number,
    },
    isDisable: {
      type: Boolean,
    },
    // 是否 停止监听省市区
    isWatch: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const STORE = useStore();
    let DATA: any = reactive({
      province: null,
      provinceList: [],
      city: null,
      cityList: [],
      county: null,
      countyList: [],
      town: null,
      townList: [],
      disable: true,
    });
    let METHODS = reactive({
      handleChangeProvince: async () => {
        if (DATA.province === '') {
          DATA.province = null;
        }
        DATA.city = null;
        DATA.cityList = [];
        DATA.county = null;
        DATA.countyList = [];
        DATA.town = null;
        DATA.townList = [];
        let { data } = await getByCity({ code: DATA.province });
        if (data.code === RES_SUCCESS) {
          DATA.cityList = data.data;
        }
        emit('handleChangeProvince', DATA.province);
      },
      handleChangeCity: async () => {
        if (DATA.city === '') {
          DATA.city = null;
        }
        DATA.county = null;
        DATA.countyList = [];
        DATA.town = null;
        DATA.townList = [];
        let { data } = await getByCounty({ code: DATA.city });
        if (data.code === RES_SUCCESS) {
          DATA.countyList = data.data;
        }
        emit('handleChangeCity', DATA.city);
      },
      handleChangeCounty: async () => {
        if (DATA.county === '') {
          DATA.county = null;
        }
        DATA.town = null;
        DATA.townList = [];
        let { data } = await getByTown({ code: DATA.county });
        if (data.code === RES_SUCCESS) {
          DATA.townList = data.data;
        }
        emit('handleChangeCounty', DATA.county);
      },
      handleChangeTown: () => {
        if (DATA.town === '') {
          DATA.town = null;
        }
        emit('handleChangeTown', DATA.town);
      },
      // 根据市code回显数据
      handleCityCode: async () => {
        let { data } = await getCity({ code: props.city as number });
        if (data.code === RES_SUCCESS) {
          DATA.cityList = [data.data];
        }
      },
      // 根据区、县code回显数据
      handleCountyCode: async () => {
        let { data } = await getCounty({ code: props.county as number });
        if (data.code === RES_SUCCESS) {
          DATA.countyList = [data.data];
        }
      },
      // 根据乡、镇code回显数据
      handleTownCode: async () => {
        let { data } = await getTown({ code: props.town as number });
        if (data.code === RES_SUCCESS) {
          DATA.townList = [data.data];
        }
      },
    });
    let stop = watch(
      [
        () => props.province,
        () => props.city,
        () => props.county,
        () => props.town,
      ],
      () => {
        if (props.province) {
          DATA.province = props.province;
        }
        if (props.city) {
          DATA.city = props.city;
          METHODS.handleCityCode();
        }
        if (props.county) {
          DATA.county = props.county;
          METHODS.handleCountyCode();
        }
        if (props.town) {
          DATA.town = props.town;
          METHODS.handleTownCode();
        }
        props.isWatch && stop();
      }
    );
    watch(
      () => props.isDisable,
      () => {
        DATA.disable = props.isDisable;
      },
      {
        immediate: true,
      }
    );
    onMounted(() => {
      DATA.provinceList = STORE.state.globalData.provinceList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.region {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  /deep/ .el-select {
    flex: 1;
  }
}
</style>