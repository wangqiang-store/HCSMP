<template>
  <el-row>
    <el-col
      :span="24"
      v-loading="loading"
    >
      <div class="w-100 d_flex d_flex_sb">
        <h3>企业/工厂中心地理坐标</h3>
        <div>
          <el-button
            type="primary"
            class="mr-10"
            size="small"
            :disabled="!isDisable"
            v-show="disable"
            @click="disable=!disable"
          >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            v-show="!disable"
            @click="handleSave"
          >保存</el-button>
        </div>
      </div>
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :styles="styles"
        :isDisable="disable"
        :rules="formRules"
        ref="formRef"
      >
        <template #latitude>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="northDeg"
            :disabled="disable"
          >
            <template #append>°</template>
          </el-input>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="northMinute"
            :disabled="disable"
          >
            <template #append>′</template>
          </el-input>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="northSecond"
            :disabled="disable"
          >
            <template #append>″</template>
          </el-input>
        </template>
        <template #longitude>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="eastDeg"
            :disabled="disable"
          >
            <template #append>°</template>
          </el-input>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="eastMinute"
            :disabled="disable"
          >
            <template #append>′</template>
          </el-input>
          <el-input
            style="width:33.3%;padding:0 5px 0 5px"
            v-model="eastSecond"
            :disabled="disable"
          >
            <template #append>″</template>
          </el-input>
        </template>
      </ele-form>
    </el-col>
    <el-col
      :span="24"
      style="margin-left:100px"
    >
      <el-button
        class="mr-10"
        type="primary"
        @click="CollectionCoordinates"
        :disabled="disable"
        size="small"
      >采集坐标</el-button>
      <!-- <el-button
        class="mr-10"
        type="primary"
        @click="handleTurn"
      >度转度分秒</el-button>
      <el-button type="primary">度分秒转度</el-button> -->
    </el-col>
    <el-col :span="24">
      <!-- 查看模态框 -->
      <el-dialog
        v-model="dialogVisible"
        width="80%"
        top="2vh"
      >
        <Amap
          class="amap"
          @getlnglat="getlnglat"
          module="companyInfo"
          :isShowSearch="true"
          :latitude="+formData.latitude"
          :longitude="+formData.longitude"
          AmapId="coordinate"
          placeholder="可搜索具体位置"
        />
        <el-descriptions
          class="margin-top mt-10"
          :column="1"
          size="small"
          border
        >
          <el-descriptions-item
            label-align="center"
            align="center"
          >
            <template #label>
              <i class="el-icon-map-location"></i>
              经度
            </template>
            <el-tag type="warning">
              {{formData.longitude}}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item
            label-align="center"
            align="center"
          >
            <template #label>
              <i class="el-icon-map-location"></i>
              纬度
            </template>
            <el-tag type="warning">
              {{formData.latitude}}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <span class="dialog-footer">
            <el-button
              @click="dialogVisible = false"
              size="small"
            >取 消</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import Amap from '@/components/amap/index.vue';
import { transformDMS } from '@/utils/filtration';
import { ElMessage } from 'element-plus';
import { updateCompany } from '@/api/company';
import { RES_SUCCESS } from '@/api/common/common';
import { useStore } from 'vuex';
import { verifylatitude, verifylongitude } from '@/api/common/verify';
export default defineComponent({
  components: { EleForm, Amap },
  props: {
    formData: {
      type: Object,
      default: {
        latitude: null,
        longitude: null,
      },
    },
    isDisable: {
      type: Boolean,
    },
  },
  setup(props) {
    const STORE = useStore();
    const formRef: any = ref(null);
    let DATA: any = reactive({
      disable: true,
      loading: false,
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      formData: {
        latitude: null,
        longitude: null,
      },
      renderFormArr: [
        {
          label: '经度',
          type: 'input',
          prop: 'longitude',
          style: {
            width: '50%',
          },
        },
        {
          label: '纬度',
          type: 'input',
          prop: 'latitude',
          style: {
            width: '50%',
          },
        },
        {
          label: '经度',
          type: 'slot',
          slotName: 'longitude',
          style: {
            width: '50%',
          },
        },
        {
          label: '纬度',
          type: 'slot',
          slotName: 'latitude',
          style: {
            width: '50%',
          },
        },
      ],
      formRules: {
        latitude: [
          {
            pattern: verifylatitude,
            message: '纬度数据为-90～90且小数位为10位小数',
          },
        ],
        longitude: [
          {
            pattern: verifylongitude,
            message: '经度数据为-180～180且小数位为10位小数',
          },
        ],
      },
      // 北纬
      northDeg: '',
      northMinute: '',
      northSecond: '',
      // 东经
      eastDeg: '',
      eastMinute: '',
      eastSecond: '',
      dialogVisible: false,
    });
    let METHODS = reactive({
      CollectionCoordinates: () => {
        DATA.dialogVisible = true;
      },
      handleConfirm: () => {
        DATA.dialogVisible = false;
        METHODS.handleTurn(DATA.formData);
      },
      getlnglat: ({ lng, lat }: any) => {
        DATA.formData.latitude = lat;
        DATA.formData.longitude = lng;
      },
      handleTurn: (formData: { latitude: number; longitude: number }) => {
        let lat = transformDMS(formData.latitude, 'lat');
        DATA.northDeg = lat.split('°')[0];
        DATA.northMinute = lat.split('′')[0].split('°')[1];
        DATA.northSecond = lat.split('′')[1].split('″')[0];

        let lon = transformDMS(formData.longitude, 'lon');
        DATA.eastDeg = lon.split('°')[0];
        DATA.eastMinute = lon.split('′')[0].split('°')[1];
        DATA.eastSecond = lon.split('′')[1].split('″')[0];
      },
      handleSave: () => {
        if (!DATA.formData.id) {
          ElMessage({
            message: '请先添加营业执照信息',
            type: 'warning',
          });
          return;
        }
        if (!DATA.formData.latitude && !DATA.formData.longitude) {
          ElMessage({
            message: '请选择地理坐标',
            type: 'warning',
          });
          return;
        }
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            DATA.loading = true;
            let { data } = await updateCompany(DATA.formData);
            if (data.code === RES_SUCCESS) {
              DATA.loading = false;
              DATA.disable = !DATA.disable;
              ElMessage({
                message: '保存地理坐标成功',
                type: 'success',
              });
            }
          }
        });
      },
    });
    watch(
      () => props.formData,
      (newValue: any) => {
        if (
          verifylatitude.test(props.formData.latitude) &&
          verifylongitude.test(props.formData.longitude)
        ) {
          METHODS.handleTurn(newValue);
        }
        DATA.formData = props.formData;
      },
      {
        deep: true,
      }
    );
    watch(
      () => props.isDisable,
      () => {
        DATA.disable =
          STORE.state.user.personnel.unitType === 1
            ? props.isDisable
            : props.isDisable
            ? props.isDisable
            : !props.isDisable;
      },
      {
        immediate: true,
      }
    );
    onMounted(() => {
      DATA.formData.latitude && METHODS.handleTurn(DATA.formData);
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
.amap {
  width: 100%;
  height: 650px;
}
</style>