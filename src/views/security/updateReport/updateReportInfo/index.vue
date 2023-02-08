<template>
  <!-- 添加/编辑的隐患排查信息 -->
  <el-row class="container">
    <el-col
      :span="24"
      style="padding: 20px 100px 20px 20px"
    >
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :options="options"
        :rules="rules"
        :styles="styles"
        :radios="radios"
        ref="formRef"
      >
        <template #company>
          <el-select
            v-model="formData.companyId"
            style="width: 100%"
            filterable
            placeholder="请输入进行搜索"
            :disabled="STORE.state.user.personnel.companyId ? true : false"
            @change="handleChangeCompany"
          >
            <el-option
              v-for="(item, index) in options.companyId"
              :key="index"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </template>
        <template #region>
          <Region
            :province="formData.provinceCode"
            :city="formData.cityCode"
            :county="formData.countyCode"
            :town="formData.townCode"
            :isDisable="true"
            :isWatch="false"
          />
        </template>
        <template #address>
          <div class="region">
            <el-input
              v-model="formData.address"
              disabled
              placeholder="详细地址"
            ></el-input>
          </div>
        </template>
        <template #upload>
          <el-upload
            class="upload-demo"
            :action="IMG_URL"
            :headers="getItemtoken"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
            multiple
          >
            <el-button
              size="small"
              type="primary"
            >添加附件</el-button>
            <template #tip>
              <div class="el-upload__tip">注意 : 可上传多个附件</div>
            </template>
          </el-upload>
        </template>
      </ele-form>
    </el-col>
    <el-col
      :span="24"
      class="mb-20"
    >
      <div class="w-100 tac">
        <el-button
          class="mr-10"
          @click="handleBack"
        >返回</el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >保存</el-button>
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
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import Region from '@/components/region/index.vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus';
import { filterTime } from '@/utils/filtration';
import {
  createRectificationReport,
  updateRectificationReport,
  getRectificationReportDetail,
} from '@/api//security/updateReport';
export default defineComponent({
  components: { EleForm, EleUpload, Region },
  setup(props) {
    const STORE = useStore();
    const ROUTE = useRoute();
    let formRef: any = ref(null);
    let validateExists = (rule: any, value: string, callback: any) => {
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          callback();
        } else {
          callback(new Error('数据格式为0或正整数')); //自定义规则的错误提示
        }
      } else {
        callback();
      }
    };
    let validateElimination = (rule: any, value: string, callback: any) => {
      let hiddenDangerExists = Number(DATA.formData.hiddenDangerExists);
      let isRectification = DATA.formData.isRectification;
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          let val = Number(value);
          if (isRectification == true) {
            if (hiddenDangerExists == val) {
              callback();
            } else {
              callback(
                new Error('已完成整改情况下，已消除隐患数需等于存在隐患数')
              );
            }
          } else if (isRectification == false) {
            if (hiddenDangerExists > val) {
              callback();
            } else {
              callback(
                new Error('未完成整改情况下，已消除隐患数需小于存在隐患数')
              );
            }
          }
          callback();
        } else {
          callback(new Error('数据格式为0或正整数')); //自定义规则的错误提示
        }
      } else {
        callback();
      }
    };

    let DATA: any = reactive({
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        flexFlow: 'wrap',
      },
      formData: {
        companyId: null,
        personnel: '',
        hiddenDangerExists: null,
        hiddenDangerElimination: null,
        checkTime: null,
        expireTime: undefined,
        isMajorHiddenDanger: false,
        isRectification: false,
        basicDescribe: '',
        fileIds: '',
        files: [],
      },
      renderFormArr: [
        {
          label: '企业名称',
          type: 'slot',
          slotName: 'company',
          prop: 'companyId',
          labelWidth: '160px',
          style: {
            width: '45%',
          },
        },
        {
          label: '执法人员',
          type: 'select',
          prop: 'personnel',
          labelWidth: '160px',
          filterable:true,
          style: {
            width: '45%',
          },
          multiple: true,
          value: 'id',
          title: 'name',
        },
        {
          label: '企业注册地址',
          type: 'slot',
          slotName: 'region',
          prop: 'townCode',
          style: {
            width: '50%',
          },
          labelWidth: '160px',
        },
        {
          label: '', //详细地址
          type: 'slot',
          prop: 'address',
          slotName: 'address',
          labelWidth: '0',
          style: {
            width: '49%',
          },
        },
        {
          label: '存在隐患数',
          type: 'input',
          labelWidth: '160px',
          style: {
            width: '45%',
          },
          prop: 'hiddenDangerExists',
        },
        {
          label: '已消除隐患数',
          type: 'input',
          labelWidth: '160px',
          style: {
            width: '45%',
          },
          prop: 'hiddenDangerElimination',
        },
        {
          label: '巡检时间',
          prop: 'checkTime',
          type: 'date',
          dateType: 'date',
          labelWidth: '160px',
          style: {
            width: '45%',
          },
        },
        {
          label: '整改到期时间',
          prop: 'expireTime',
          type: 'date',
          dateType: 'date',
          labelWidth: '160px',
          style: {
            width: '45%',
          },
        },
        {
          label: '是否存在重大隐患',
          type: 'radio',
          prop: 'isMajorHiddenDanger',
          labelWidth: '160px',
          style: {
            width: '95%',
          },
          value: 'value',
          title: 'title',
        },
        {
          label: '是否整改',
          type: 'radio',
          prop: 'isRectification',
          labelWidth: '160px',
          style: {
            width: '95%',
          },
          value: 'value',
          title: 'title',
        },
        {
          label: '整改基本情况描述',
          type: 'input',
          inputType: 'textarea',
          labelWidth: '160px',
          style: {
            width: '100%',
          },
          prop: 'basicDescribe',
        },
        {
          label: '现场检查相关材料附件',
          type: 'slot',
          slotName: 'upload',
          labelWidth: '160px',
          style: {
            width: '95%',
          },
        },
      ],
      options: {
        companyId: [],
        personnel: STORE.state.globalData.enablePersonnelList,
      },
      radios: {
        isMajorHiddenDanger: [
          {
            value: true,
            title: '是',
          },
          {
            value: false,
            title: '否',
          },
        ],
        isRectification: [
          {
            value: true,
            title: '是',
          },
          {
            value: false,
            title: '否',
          },
        ],
      },
      rules: {
        companyId: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        townCode: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        personnel: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        hiddenDangerExists: [
          { required: true, message: '此为必填项', trigger: 'blur' },
          { validator: validateExists, trigger: 'blur' },
        ],
        hiddenDangerElimination: [
          { required: true, message: '此为必填项', trigger: 'blur' },
          { validator: validateElimination },
        ],
        checkTime: [{ required: true, message: '此为必填项', trigger: 'blur' }],
        isMajorHiddenDanger: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        isRectification: [
          { required: true, message: '此为必填项', trigger: 'blur' },
        ],
        region: [{ required: true, message: '此为必填项', trigger: 'blur' }],
      },
      fileList: [],
      files: [],
    });
    let METHODS = reactive({
      // 选择企业
      handleChangeCompany: (val: any) => {
        STORE.state.globalData.companyList.forEach((item: any) => {
          if (item.id == val) {
            DATA.formData.provinceCode = item.provinceCode;
            DATA.formData.cityCode = item.cityCode;
            DATA.formData.countyCode = item.countyCode;
            DATA.formData.townCode = item.townCode;
            DATA.formData.address = item.address;
            return;
          }
        });
      },

      handleSave: () => {
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (Array.isArray(DATA.formData.fileIds)) {
              DATA.formData.fileIds = DATA.formData.fileIds.join(',');
            }
            if (DATA.formData.checkTime) {
              DATA.formData.checkTime = filterTime(
                DATA.formData.checkTime,
                '/'
              );
            }
            if (DATA.formData.expireTime) {
              DATA.formData.expireTime = filterTime(
                DATA.formData.expireTime,
                '/'
              );
            } else {
              DATA.formData.expireTime = undefined;
            }
            DATA.formData.personnel = String(DATA.formData.personnel);

            if (DATA.formData.id) {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              delete DATA.formData.files;
              let { data } = await updateRectificationReport(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '编辑成功',
                  type: 'success',
                });
                setTimeout(() => {
                  history.go(-1);
                }, 1500);
              }
            } else {
              let { data } = await createRectificationReport(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '添加成功',
                  type: 'success',
                });

                setTimeout(() => {
                  history.go(-1);
                }, 1500);
              }
            }
          }
        });
      },
      handleBack: () => {
        history.go(-1);
      },

      handleUploadSuccess: (res: any) => {
        if (Array.isArray(DATA.formData.fileIds)) {
          DATA.formData.fileIds.push(res.data.id);
        } else {
          DATA.formData.fileIds =
            DATA.formData.fileIds === ""
              ? []
              : DATA.formData.fileIds.split(",");
          DATA.formData.fileIds.push(res.data.id);
        }

        DATA.files.push(res.data);
      },

      handleRemove: (res: any, fileList: any) => {
        let deleteUrl = "";
        if (res.response) {
          deleteUrl = res.response.data.path;
        } else {
          deleteUrl = res.url; //获取要删除的文件路径
        }
        let fileIds = [];
        // 获取删除文件在文件列表对应的索引值
        let i = DATA.files.findIndex((item: any) => item.path == deleteUrl);
        DATA.files.splice(i, 1);
        for (let item of DATA.files) {
          fileIds.push(item.id);
        }
        DATA.formData.fileIds = fileIds.join(",");
      },
    });
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem('Admin-Token'),
      };
    });
    onMounted(async () => {
      ROUTE.params.title && STORE.commit('setTitle', ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit('setTwoTitle', ROUTE.params.twoTitle);

      // 获取数据
      DATA.formData = Object.assign(
        {},
        STORE.state.globalData.updateReportInfo
      );

      if (DATA.formData.id) {
        let { data } = await getRectificationReportDetail({
          id: DATA.formData.id,
        });
        if (data.code === RES_SUCCESS) {
          DATA.formData = data.data;
          DATA.formData.personnel = DATA.formData.personnel
            .split(',')
            .map((item: any) => {
              return Number(item);
            });
          await STORE.commit('setDailyInfo', data.data);
        }
      }

      //企业下拉数据
      if (STORE.state.user.personnel.companyId) {
        DATA.options.companyId = [
          {
            id: STORE.state.user.personnel.companyId,
            name: STORE.state.user.personnel.companyName,
          },
        ];
        DATA.formData.companyId = STORE.state.user.personnel.companyId;
      } else {
        DATA.options.companyId = STORE.state.globalData.companyList;
      }

      //回显企业地址
      if (DATA.formData.companyId) {
        STORE.state.globalData.companyList.forEach((item: any) => {
          if (item.id == DATA.formData.companyId) {
            DATA.formData.provinceCode = item.provinceCode;
            DATA.formData.cityCode = item.cityCode;
            DATA.formData.countyCode = item.countyCode;
            DATA.formData.townCode = item.townCode;
            DATA.formData.address = item.address;
            return;
          }
        });
      }

      DATA.fileList = [];
      DATA.files = []
      DATA.formData.fileIds = [];
      if (DATA.formData.files != null) {
        DATA.files = DATA.formData.files;
        for (let item of DATA.formData.files) {
          DATA.formData.fileIds.push(item.id);
          DATA.fileList.push({
            name: item.name,
            url: IMG_File + item.path,
          });
        }
      } else {
        DATA.formData.files = [];
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      formRef,
      getItemtoken,
      STORE,
    };
  },
});
</script>
<style scoped lang="scss">
.container {
  height: calc(100% - 40px) !important;
  overflow-y: auto;
  margin-top: 0;
}
/deep/ textarea {
  height: 200px !important;
  resize: none;
  border: 1px solid #dcdfe6;
  &:focus {
    border: 1px solid #409eff;
  }
  overflow-y: scroll;
}

// 地址
.region {
  display: flex;
  .el-input {
    margin-right: 10px;
    flex: 1;
  }
  /deep/.el-input.is-disabled .el-input__inner {
    background-color: #fff !important;
    color: #333;
  }
}
</style>