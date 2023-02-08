<template>
  <!-- 添加/编辑的日常监督检查页面 -->
  <el-row class="container">
    <!-- 第一部分的内容 -->
    <el-col
      :span="24"
      style="padding: 0 100px 20px 60px"
      @mousemove="isMouseenter = true"
    >
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :options="options"
        :rules="rules"
        :styles="styles"
        :radios="radios"
        @handleChangeRadio="handleChangeRadio"
        ref="formRef"
      >
        <!-- 选择企业 -->
        <template #company>
          <el-select
            v-model="formData.companyId"
            style="width: 100%"
            filterable
            placeholder="请选择"
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
        <!-- 地址 -->
        <template #region>
          <Region
            :province="formData.provinceCode"
            :city="formData.cityCode"
            :county="formData.countyCode"
            :town="formData.townCode"
            :isDisable="true"
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
        <!-- 附件上传 -->
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
            <el-button size="small" type="primary">添加附件</el-button>
            <template #tip>
              <div class="el-upload__tip">注意 : 可上传多个附件</div>
            </template>
          </el-upload>
        </template>
      </ele-form>
      <span class="w-100 tac">
        <el-button class="mr-10" @click="handleBack">返 回</el-button>
        <el-button
          :type="disable == true ? 'primary' : 'danger'"
          @click="handleSave"
          >保 存</el-button
        >
      </span>
    </el-col>

    <!-- 第二部分的内容 -->
    <el-col
      :span="24"
      v-if="part2"
      style="padding: 20px 100px 20px 60px"
      class="part2"
    >
      <div class="d_flex d_flex_sb" style="font: 700 16px '黑体'">
        <div style="">执法文书</div>
        <el-button type="primary" @click="handleCreate"
          ><i class="el-icon-plus mr-5"></i>添加执法文书</el-button
        >
      </div>
      <div
        v-for="(item1, index) in enforcementDocumentList"
        :key="index"
        class="box"
        @click="handleMouseEnter(index)"
      >
        <div class="title flex d_flex_sb" disabled>
          <div>序号{{ index + 1 }}</div>
          <div>
            <el-button
              v-if="item1.dailyId"
              :type="item1.isBool ? 'primary' : 'danger'"
              size="mini"
              @click="handleLawSave('edit', index)"
              >提交编辑</el-button
            >
            <el-button
              v-else
              type="danger"
              size="mini"
              @click="handleLawSave('add', index)"
              >提交新增</el-button
            >
            <span @click="handleDelete(item1, index)">
              <el-tooltip
                class="item"
                effect="light"
                content="删除"
                placement="top"
              >
                <i class="el-icon-circle-close ml-10 delete"></i>
              </el-tooltip>
            </span>
          </div>
        </div>
        <div class="content">
          <ele-form
            :formData="item1"
            :renderFormArr="
              item1.documentType == 3 ? renderLawFormArr2 : renderLawFormArr
            "
            :styles="styles"
            :options="lawOptions"
            :rules="lawRules"
            :ref="'lawFormRef' + index"
          >
            <template #documentType>
              <el-select
                v-model="item1.documentType"
                placeholder="请选择"
                @change="handleLawChange(item1)"
                @click="lawOptionsClick(item1.documentType, index)"
              >
                <el-option
                  v-for="(item, i) in lawOptions.documentType"
                  :key="i"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
            <template #upload>
              <el-upload
                class="upload-demo"
                style="display：inline-block;vertical-align:middle"
                action="/file/upload"
                :headers="getItemtoken"
                :on-change="handleLawOnChange"
                :on-remove="handleLawRemove"
                :on-success="handleLawUploadSuccess"
                :file-list="fileList2[index]"
                multiple
                @abort="abort"
                @mousedown="handleMouseEnter(index)"
              >
                <el-button size="small" type="primary" @click="aa(index)"
                  >添加附件</el-button
                >
                <template #tip>
                  <div class="el-upload__tip">注意 : 可上传多个文件</div>
                </template>
              </el-upload>
            </template>
          </ele-form>
        </div>
      </div>
    </el-col>

    <!-- 离开这个页面 模态框-->
    <el-col :span="24">
      <el-dialog title="提示" v-model="updateVisible" width="20%">
        <div>数据还未保存,请确认是否退出</div>
        <div class="editfooter">
          <el-button @click="exit">取消</el-button>
          <el-button type="primary" @click="confirm">确认退出</el-button>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
  <el-row style="background: #eaeaea; height: 30px"></el-row>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
  getCurrentInstance,
  nextTick,
  inject,
} from "vue";
import { debounce } from "lodash";
import EleForm from "@/components/eleForm/index.vue";
import EleUpload from "@/components/eleUpload/index.vue";
import Region from "@/components/region/index.vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  getByKey,
  IMG_File,
  IMG_URL,
  RES_SUCCESS,
  sessionWrite,
} from "@/api/common/common";
import { ElMessage } from "element-plus";
import { filterTime } from "@/utils/filtration";
import {
  createDailySupervision,
  updateDailySupervision,
  createEnforcementDocument,
  updateEnforcementDocument,
  deleteEnforcementDocument,
  getDailySupervisionDetail,
  deleteAllEnforcementDocument,
} from "@/api/security/daily";
export default defineComponent({
  components: { EleForm, EleUpload, Region },
  setup(props) {
    const STORE = useStore();
    const ROUTER = useRouter();
    const ROUTE = useRoute();
    const { proxy }: any = getCurrentInstance();
    let formRef: any = ref(null);
    let reload: any = inject("reload");
    let lawFormRef: any = ref(null);
    let validateExist = (rule: any, value: string, callback: any) => {
      if (value) {
        if (/^[0-9]\d*$/.test(value)) {
          callback();
        } else {
          callback(new Error("数据格式为0或正整数")); //自定义规则的错误提示
        }
      } else {
        callback();
      }
    };

    // 第二部分规则
    let validateLawType = (rule: any, value: string, callback: any) => {
      if (!value && DATA.isChange) {
        callback("此类型执法文书已存在");
      }

      METHODS.getListType();
      let arr = Array.from(new Set(DATA.hasListType));
      // 有重复的
      if (DATA.hasListType.length !== arr.length) {
        DATA.enforcementDocumentList[DATA.currentIndex].documentType = null;
        // console.log(55555,DATA.fileList2[DATA.currentIndex],DATA.files2[DATA.currentIndex]);
        DATA.fileList2[DATA.currentIndex] = JSON.parse(
          JSON.stringify(DATA.files2[DATA.currentIndex])
        );

        value = "";
        callback("此类型执法文书已存在");
      } else {
        callback();
      }
    };

    let DATA: any = reactive({
      updateVisible: false,
      targetName: "",
      oldTargetName: "",
      disable: true,
      styles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        flexFlow: "wrap",
      },
      lawStyles: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexFlow: "wrap",
      },
      isMouseenter: false, //用来做第一部分是否有修改的值
      isRadio: false,
      isMajorRadio: false, //用来做重大隐患字段改变的标识
      formDataCopy: {},
      formData: {
        companyId: null,
        checkType: null,
        personnel: "",
        otherPersonnel: "",
        expert: "",
        hiddenDanger: null,
        checkTime: null,
        remark: null,
        basicDescribe: "",
        fileIds: "",
        files: [],
        isMajorHiddenDanger: false,
        isLawEnforcement: true,
      },
      renderFormArr: [
        {
          label: "企业名称",
          type: "slot",
          slotName: "company",
          prop: "companyId",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
        },
        {
          label: "监督检查类型",
          type: "select",
          prop: "checkType",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
          value: "value",
          title: "name",
        },
        {
          label: "企业注册地址",
          type: "slot",
          slotName: "region",
          prop: "townCode",
          style: {
            width: "50%",
          },
          labelWidth: "160px",
        },
        {
          label: "", //详细地址
          type: "slot",
          prop: "address",
          slotName: "address",
          labelWidth: "0",
          style: {
            width: "49%",
          },
        },
        {
          label: "执法人员",
          type: "select",
          prop: "personnel",
          labelWidth: "160px",
          multiple: true,
          filterable: true,
          style: {
            width: "45%",
          },
          value: "id",
          title: "name",
        },
        {
          label: "其他执法人员",
          type: "input",
          prop: "otherPersonnel",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
        },
        {
          label: "专家",
          type: "input",
          prop: "expert",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
        },

        {
          label: "隐患数量",
          type: "input",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
          prop: "hiddenDanger",
        },
        {
          label: "巡检时间",
          prop: "checkTime",
          type: "date",
          dateType: "date",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
        },
        {
          label: "备注",
          type: "input",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
          prop: "remark",
        },
        {
          label: "检查基本情况描述",
          type: "input",
          inputType: "textarea",
          labelWidth: "160px",
          style: {
            width: "100%",
          },
          prop: "basicDescribe",
        },
        {
          label: "现场检查相关材料附件",
          type: "slot",
          slotName: "upload",
          labelWidth: "160px",
          style: {
            width: "95%",
          },
        },
        {
          label: "是否存在重大隐患",
          type: "radio",
          prop: "isMajorHiddenDanger",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
          value: "value",
          title: "title",
        },
        {
          label: "是否出具执法文书",
          type: "radio",
          prop: "isLawEnforcement",
          labelWidth: "160px",
          style: {
            width: "45%",
          },
          value: "value",
          title: "title",
        },
      ],
      options: {
        companyId: [],
        checkType: [],
        personnel: STORE.state.globalData.enablePersonnelList,
      },
      radios: {
        isMajorHiddenDanger: [
          {
            value: true,
            title: "是",
          },
          {
            value: false,
            title: "否",
          },
        ],
        isLawEnforcement: [
          {
            value: true,
            title: "是",
          },
          {
            value: false,
            title: "否",
          },
        ],
      },
      rules: {
        companyId: [{ required: true, message: "此为必填项", trigger: "blur" }],
        checkType: [{ required: true, message: "此为必填项", trigger: "blur" }],
        personnel: [{ required: true, message: "此为必填项", trigger: "blur" }],

        hiddenDanger: [{ validator: validateExist, trigger: "blur" }],
        checkTime: [{ required: true, message: "此为必填项", trigger: "blur" }],
        // townCode: [{ required: true, message: "此为必填项", trigger: "blur" }],
      },
      fileList: [],
      files: [],

      // 第二部分数据
      part2: false, //第二部分的显示隐藏
      part2Upload: false, //用来判断currentIndex是否要赋值
      currentIndex: undefined, //当前点击到第几个执法文书index
      currentType: undefined,
      isChange: false,
      enforcementDocumentList: [],
      renderLawFormArr: [
        {
          label: "文书类型",
          type: "slot",
          prop: "documentType",
          slotName: "documentType",
          labelWidth: "120px",
          style: {
            width: "50%",
          },
        },
        {
          label: "文字号",
          type: "input",
          prop: "documentNumber",
          labelWidth: "120px",
          style: {
            width: "50%",
          },
        },
        {
          label: "附件",
          type: "slot",
          slotName: "upload",
          labelWidth: "120px",
          style: {
            width: "50%",
          },
        },
      ],
      renderLawFormArr2: [
        {
          label: "文书类型",
          type: "slot",
          prop: "documentType",
          slotName: "documentType",
          labelWidth: "120px",
          style: {
            width: "30%",
          },
        },
        {
          label: "文字号",
          type: "input",
          prop: "documentNumber",
          labelWidth: "120px",
          style: {
            width: "30%",
          },
        },

        {
          label: "最后整改时间",
          prop: "finalTime",
          type: "date",
          dateType: "date",
          labelWidth: "120px",
          style: {
            width: "30%",
          },
        },
        {
          label: "其他备注",
          type: "input",
          prop: "remark",
          labelWidth: "120px",
          style: {
            width: "30%",
          },
        },
        {
          label: "",
          type: "slot",
          prop: "",
          labelWidth: "120px",
          style: {
            width: "70%",
          },
        },
        {
          label: "附件",
          type: "slot",
          slotName: "upload",
          labelWidth: "120px",
          style: {
            width: "30%",
          },
        },
      ],
      lawOptions: {
        documentType: [],
      },
      lawRules: {
        documentType: [
          { required: true, message: "此为必填项", trigger: "blur" },
          { validator: validateLawType, trigger: "change" },
        ],
      },
      hasListType: [], //用来存放当前拥有的文书类型

      fileList2: [],
      files2: [[], [], [], [], [], []],
      isControl: true, //用来做第二部分的控制
    });
    let METHODS = reactive({
      aa(index: any) {
        DATA.part2Upload = true;
        DATA.currentIndex = index;
      },
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

      //单选按钮的改变
      handleChangeRadio: ({ data, item }: any) => {
        DATA.isRadio = true;
        if (DATA.disable) {
          DATA.disable = false;
        }
        if (item.prop == "isMajorHiddenDanger") {
          DATA.isMajorRadio = true;
        }
      },

      // 保存提交
      handleSave: debounce(() => {
        // 检验第一部分
        formRef.value.submitForm().then(async (valid: boolean) => {
          if (valid) {
            //判断执行文书是否有修改
            let isTrue = true;
            if (DATA.enforcementDocumentList) {
              isTrue = DATA.enforcementDocumentList?.every(
                (item: any) => item.isBool
              );
            }
            if (!isTrue) {
              ElMessage({
                message: "请先提交下面的执行文书",
                type: "warning",
              });
              return;
            }

            if (DATA.formData.checkTime) {
              DATA.formData.checkTime = filterTime(
                DATA.formData.checkTime,
                "/"
              );
            }

            DATA.formData.personnel = String(DATA.formData.personnel);

            if (Array.isArray(DATA.formData.fileIds)) {
              if (DATA.formData.fileIds.length > 0) {
                DATA.formData.fileIds = DATA.formData.fileIds.join(",");
              } else {
                DATA.formData.fileIds = "";
              }
            }

            // 发起请求
            if (DATA.formData.id) {
              let { data } = await updateDailySupervision(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "日常监督检查保存成功",
                  type: "success",
                });
                DATA.disable = true;
                DATA.isMajorRadio = false;
                DATA.isMouseenter = false;

                data.data.personnel = data.data.personnel
                  .split(",")
                  .map((item: any) => Number(item));

                DATA.formData = data.data;
                DATA.formDataCopy = Object.assign({}, data.data);
                await STORE.commit("setDailyInfo", data.data);
                setTimeout(() => {
                  history.go(-1);
                }, 1000);

                // if (!DATA.formData.isLawEnforcement) {
                //   setTimeout(() => {
                //     history.go(-1);
                //   }, 1000);
                // }
              } else {
                DATA.disable = true;
              }
            } else {
              let { data } = await createDailySupervision(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "日常监督检查保存成功",
                  type: "success",
                });

                DATA.disable = true;
                DATA.isMajorRadio = false;
                DATA.isMouseenter = false;
                await STORE.commit("setDailyInfo", data.data);
                DATA.formData = data.data;
                DATA.formDataCopy = JSON.parse(JSON.stringify(data.data));
                DATA.formData.personnel = DATA.formData.personnel
                  .split(",")
                  .map((item: any) => Number(item));

                if (!DATA.formData.isLawEnforcement) {
                  setTimeout(() => {
                    history.go(-1);
                  }, 1000);
                }
              } else {
                DATA.disable = true;
              }
            }
          }
        });
      }, 200),

      // 第一部分上传
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

      // 添加执法文书
      handleCreate: () => {
        if (DATA.formData.id) {
          if (!DATA.disable) {
            proxy.$message.warning("请先保存日常监督检查信息");
          } else {
            if (DATA.enforcementDocumentList?.length == 6) {
              proxy.$message.warning("执法文书最多只能添加6个");
              return;
            }

            // 判断是否有其他执行文书在编辑
            // let part2DisableHasFalse = DATA.partDisable2.some(
            //   (item: any) => item
            // );
            // if (part2DisableHasFalse) {
            //   proxy.$message.warning("请先保存当前的执法文书");
            //   return;
            // }

            if (!Array.isArray(DATA.enforcementDocumentList)) {
              DATA.enforcementDocumentList = [];
            }
            DATA.fileList2.push([]);
            DATA.enforcementDocumentList.push({
              documentType: "",
              documentNumber: "",
              fileIds: "",
              files: [],
              isBool: false,
              id: "",
            });

            // console.log("添加后的", DATA.enforcementDocumentList);
            DATA.isControl = false;
            setTimeout(() => {
              DATA.isControl = true;
            }, 1000);

            //滑动到最新的执法文书
            METHODS.smoothDown();
          }
        } else {
          proxy.$message.warning("请先添加日常监督检查信息");
        }
      },

      // 删除执法文书
      handleDelete: (item: any, index: any) => {
        if (item.id) {
          proxy
            .$confirm("是否确定删除该数据", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
            .then(async () => {
              if (item.id) {
                let { data } = await deleteEnforcementDocument({
                  dailySupervisionId: item.dailyId,
                  id: item.id,
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "执法文书删除成功",
                    type: "success",
                  });
                  // DATA.enforcementDocumentList = data.data;
                  DATA.enforcementDocumentList.splice(index, 1);
                  DATA.fileList2.splice(index, 1);
                }
              } else {
                DATA.enforcementDocumentList.splice(index, 1);
                DATA.fileList2.splice(index, 1);
              }

              DATA.isControl = false;
              setTimeout(() => {
                DATA.isControl = true;
              }, 1000);
            })
            .catch(() => {});
        } else {
          DATA.enforcementDocumentList.splice(index, 1);
          DATA.fileList2.splice(index, 1);
          DATA.isControl = false;
          setTimeout(() => {
            DATA.isControl = true;
          }, 1000);
        }
      },

      //获取当前进入第几个执法文书index
      handleMouseEnter: (index: Number) => {
        // console.log("当前的", index);
        if (DATA.part2Upload) {
          return;
        }
        DATA.currentIndex = index;
      },
      // 获取当前的文书类型的数据
      lawOptionsClick: (value: any, index: Number) => {
        DATA.currentIndex = index;
      },

      // 文书类型切换
      handleLawChange: (item: any) => {
        DATA.isChange = true;

        if (item.documentType != 3) {
          delete item.finalTime;
          delete item.remark;
        }
      },

      // 检验第二部分
      handleLawSave: debounce((val: any, index: any) => {
        proxy.$refs["lawFormRef" + DATA.currentIndex]
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              DATA.enforcementDocumentList[index].dailyId = DATA.formData.id;
              if (
                Array.isArray(
                  DATA.enforcementDocumentList[DATA.currentIndex].fileIds
                )
              ) {
                DATA.enforcementDocumentList[DATA.currentIndex].fileIds =
                  DATA.enforcementDocumentList[DATA.currentIndex].fileIds.join(
                    ","
                  );
              }

              if (DATA.enforcementDocumentList[index].finalTime) {
                DATA.enforcementDocumentList[index].finalTime = filterTime(
                  DATA.enforcementDocumentList[index].finalTime,
                  "/"
                );
              }
              delete DATA.enforcementDocumentList[index].updateTime;
              delete DATA.enforcementDocumentList[index].createTime;
              delete DATA.enforcementDocumentList[index].isBool;

              // 添加
              if (val == "add") {
                let { data } = await createEnforcementDocument(
                  DATA.enforcementDocumentList[index]
                );
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "执法文书添加成功",
                    type: "success",
                  });
                  // DATA.enforcementDocumentList = data.data;
                  // DATA.enforcementDocumentList[index].id = data.data
                  let type = DATA.enforcementDocumentList[index].documentType;
                  data.data.forEach((item: any) => {
                    if (type == item.documentType) {
                      DATA.enforcementDocumentList[index].id = item.id;
                      DATA.enforcementDocumentList[index]["isBool"] = true;

                      item.files?.forEach((itme2: any) => {
                        DATA.fileList2[index].push({
                          id: itme2.id,
                          name: itme2.name,
                          url: itme2.path,
                        });
                      });
                    }
                  });
                  // DATA.enforcementDocumentList[index].isBool = true;
                  DATA.currentIndex = index;
                  DATA.isControl = false;
                  setTimeout(() => {
                    DATA.isControl = true;
                  }, 100);
                }
              } else {
                let { data } = await updateEnforcementDocument(
                  DATA.enforcementDocumentList[index]
                );

                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "执法文书编辑成功",
                    type: "success",
                  });
                  // DATA.enforcementDocumentList = data.data;
                  DATA.enforcementDocumentList[index].isBool = true;
                  DATA.currentIndex = index;

                  DATA.isControl = false;
                  setTimeout(() => {
                    DATA.isControl = true;
                  }, 100);
                }
              }
            }
          })
          .catch(() => {});
      }, 200),

      // 返回上一级
      handleBack: () => {
        history.go(-1);
      },

      // 第二部分上传
      handleLawOnChange: () => {
        // DATA.part2Upload = true;
      },
      abort: () => {
        DATA.part2Upload = false;
      },
      handleLawUploadSuccess: (res: any) => {
        DATA.part2Upload = false;
        if (
          Array.isArray(DATA.enforcementDocumentList[DATA.currentIndex].fileIds)
        ) {
          DATA.enforcementDocumentList[DATA.currentIndex].fileIds.push(
            res.data.id
          );
        } else {
          DATA.enforcementDocumentList[DATA.currentIndex].fileIds =
            DATA.enforcementDocumentList[DATA.currentIndex].fileIds === ""
              ? []
              : DATA.enforcementDocumentList[DATA.currentIndex].fileIds.split(
                  ","
                );
          DATA.enforcementDocumentList[DATA.currentIndex].fileIds.push(
            res.data.id
          ); //添加上传成功的文件
        }
        DATA.files2[DATA.currentIndex].push(res.data);
        // DATA.part2Upload = false;
        // console.log(9999, DATA.files2[DATA.currentIndex]);
      },
      handleLawRemove: (res: any, fileList: any) => {
        let deleteUrl = "";
        if (res.response) {
          deleteUrl = res.response.data.path;
        } else {
          deleteUrl = res.url; //获取要删除的文件路径
        }
        let fileIds = [];
        // 获取删除文件在文件列表对应的索引值
        let i = DATA.files2[DATA.currentIndex].findIndex(
          (item: any) => item.path == deleteUrl
        );
        DATA.files2[DATA.currentIndex].splice(i, 1);
        for (let item of DATA.files2[DATA.currentIndex]) {
          fileIds.push(item.id);
        }
        DATA.enforcementDocumentList[DATA.currentIndex].fileIds =
          fileIds.join(",");

        DATA.part2Upload = false;
        // console.log(
        //   "删除",
        //   DATA.enforcementDocumentList[DATA.currentIndex].fileIds
        // );
      },

      // 获取 监督检查类型
      handleCheckType: async () => {
        let { data } = await getByKey({
          key: "t_supervision_and_inspection_type",
        });
        if (data.code === RES_SUCCESS) {
          DATA.options.checkType = data.data;
        }
      },

      // 获取 文书类型
      handleDocumentType: async () => {
        let { data } = await getByKey({
          key: "t_enforcement_documents_type",
        });
        if (data.code === RES_SUCCESS) {
          DATA.lawOptions.documentType = data.data;
        }
      },

      // 获取执法文书list的类型type
      getListType: () => {
        DATA.hasListType = [];
        if (Array.isArray(DATA.enforcementDocumentList)) {
          DATA.enforcementDocumentList.forEach((item: any, index: number) => {
            DATA.hasListType.push(item.documentType);
          });
        }
      },

      //滑动到最新的执法文书
      smoothDown: () => {
        // const bodyHeight = document.body.scrollHeight;
        let container: any = document.querySelector(".container");
        const bodyHeight = container.scrollHeight;
        let scrollTop = container.scrollTop;
        // document.documentElement.scrollTop || document.body.scrollTop;

        let timer = setInterval(() => {
          if (scrollTop >= bodyHeight) {
            container.scrollTo(0, bodyHeight);
            clearTimeout(timer);
          }
          container.scrollTo(0, (scrollTop += 50));
        }, 20);
      },

      // 退出页面
      //取消退出
      exit: () => {
        DATA.updateVisible = false;
        // reload();
      },
      //确认退出
      confirm: () => {
        DATA.updateVisible = false;
        DATA.disable = true;
        if (DATA.enforcementDocumentList) {
          DATA.enforcementDocumentList = DATA.enforcementDocumentList?.map(
            (item: any) => {
              item.isBool = true;
              return item;
            }
          );
        }

        DATA.isControl = false;
        setTimeout(() => {
          DATA.isControl = true;
        }, 1000);

        ROUTER.push({
          path: DATA.targetName,
          // params: {
          //   title: ROUTE.meta.title,
          //   twoTitle: ROUTE.meta.twoTitle,
          // },
        });
      },
    });

    // 监听第二个部分的显示隐藏
    watch(
      () => DATA.formData.isLawEnforcement,
      (newType, oldType) => {
        if (newType == oldType) {
          //添加或编辑时, 会重新赋值,
          return;
        }
        if (newType) {
          DATA.part2 = newType;

          setTimeout(() => {
            if (DATA.isRadio) {
              window.scrollTo(0, document.body.scrollHeight);
              DATA.isRadio = false;
            }
          }, 100);
        } else {
          // 选择否
          let list = DATA.enforcementDocumentList;
          if (Array.isArray(list) && list.length > 0) {
            proxy
              .$confirm("此操作将会删除全部执法文书, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
              .then(() => {
                //需要做全部清除的操作
                deleteAllEnforcementDocument({
                  dailySupervisionId: DATA.formData.id,
                })
                  .then(() => {
                    proxy.$message.success("成功删除全部执法文书");
                    DATA.enforcementDocumentList = "";
                    DATA.part2 = newType;
                    DATA.fileList2 = [];
                    DATA.files2 = [[], [], [], [], [], []];
                    DATA.isControl = false;
                    setTimeout(() => {
                      DATA.isControl = true;
                    }, 1000);
                  })
                  .catch(() => {});
              })
              .catch(() => {
                DATA.part2 = oldType;
                DATA.formData.isLawEnforcement = oldType;
                if (DATA.isMajorRadio) {
                  DATA.disable = false;
                } else {
                  DATA.disable = true;
                }
                DATA.isRadio = false;
              });
          } else {
            DATA.part2 = newType;
          }
        }
      },
      { deep: true, immediate: true }
    );

    // 监听第一个部分的是否有修改
    watch(
      () => DATA.formData,
      (newType, oldType) => {
        if (DATA.isMouseenter) {
          for (const key in newType) {
            // console.log(
            //   666666666,
            //   JSON.stringify(newType[key]) !=
            //     JSON.stringify(DATA.formDataCopy[key])
            // );

            if (
              JSON.stringify(newType[key]) !=
              JSON.stringify(DATA.formDataCopy[key])
            ) {
              DATA.disable = false;
              break;
            }
          }
        }
      },
      { deep: true }
    );

    // 监听第二个部分的是否有修改
    watch(
      () => DATA.enforcementDocumentList,
      (newType, oldType) => {
        if (Number.isInteger(DATA.currentIndex)) {
          // console.log(
          //   "改变了",
          //   DATA.currentIndex,
          //   DATA.enforcementDocumentList
          // );
          if (DATA.isControl) {
            DATA.enforcementDocumentList[DATA.currentIndex].isBool = false;
          }
        }
      },
      { deep: true }
    );

    // 离开这个页面
    onBeforeRouteLeave((to, from, next) => {
      DATA.targetName = to.path;
      DATA.oldTargetName = from.path;
      let isTrue = true;
      if (DATA.enforcementDocumentList) {
        isTrue = DATA.enforcementDocumentList?.every(
          (item: any) => item.isBool
        );
      }

      if (!DATA.disable || !isTrue) {
        // 是否对页面进行了编辑
        DATA.updateVisible = true; // 打开离开页面的提示框
        next(false);
      } else {
        next();
      }
    });

    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token"),
      };
    });
    onMounted(async () => {
      ROUTE.params.title && STORE.commit("setTitle", ROUTE.params.title);
      ROUTE.params.twoTitle &&
        STORE.commit("setTwoTitle", ROUTE.params.twoTitle);

      // 获取数据
      let formData = Object.assign({}, STORE.state.globalData.dailyInfo);
      if (formData.id) {
        let { data } = await getDailySupervisionDetail({
          id: formData.id,
        });
        if (data.code === RES_SUCCESS) {
          formData = data.data;
          if (formData.personnel) {
            formData.personnel = formData.personnel
              .split(",")
              .map((item: any) => {
                return Number(item);
              });
          } else {
            formData.personnel = [];
          }

          await STORE.commit("setDailyInfo", data.data);
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
        formData.companyId = STORE.state.user.personnel.companyId;
      } else {
        DATA.options.companyId = STORE.state.globalData.companyList;
      }

      //回显企业地址
      if (formData.companyId) {
        STORE.state.globalData.companyList.forEach((item: any) => {
          if (item.id == formData.companyId) {
            formData.provinceCode = item.provinceCode;
            formData.cityCode = item.cityCode;
            formData.countyCode = item.countyCode;
            formData.townCode = item.townCode;
            formData.address = item.address;
            return;
          }
        });
      }

      DATA.fileList = [];
      DATA.files = [];
      formData.fileIds = [];
      if (formData.files != null) {
        for (let item of formData.files) {
          DATA.files = formData.files;
          formData.fileIds.push(item.id);
          DATA.fileList.push({
            name: item.name,
            url: IMG_File + item.path,
          });
        }
      } else {
        formData.files = [];
      }

      //处理第二部分
      console.log(1111, formData.enforcementDocumentList);

      if (Array.isArray(formData.enforcementDocumentList)) {
        DATA.enforcementDocumentList = formData.enforcementDocumentList.map(
          (item: any) => {
            item.isBool = true;
            return item;
          }
        );
      } else {
        DATA.enforcementDocumentList = formData.enforcementDocumentList;
      }

      if (DATA.enforcementDocumentList) {
        DATA.enforcementDocumentList.forEach((item: any, index: any) => {
          DATA.fileList2[index] = [];
          DATA.files2[index] = [];
          if (item.files) {
            item.files.forEach((value: any) => {
              DATA.fileList2[index].push({
                id: value.id,
                name: value.name,
                url: value.path,
              });
            });

            DATA.files2[index] = JSON.parse(
              JSON.stringify(DATA.fileList2[index])
            );
          }
        });
      }
      DATA.formData = Object.assign({}, formData);
      DATA.formDataCopy = Object.assign({}, formData);

      // console.log(22222, DATA.enforcementDocumentList);
      // if (!DATA.enforcementDocumentList) {
      //   DATA.enforcementDocumentList = [
      //     {
      //       documentType: "",
      //       documentNumber: "",
      //       fileIds: "",
      //       files: [],
      //       isBool: false,
      //       id: "",
      //     },
      //   ];
      // }

      // 获取当前拥有的执法文书类型type
      METHODS.getListType();

      // 获取 监督检查类型
      METHODS.handleCheckType();

      // 获取 文书类型
      METHODS.handleDocumentType();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      formRef,
      lawFormRef,
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
.delete {
  display: inline-block;
  font-size: 24px;
  font-weight: 700;
  color: red;
  vertical-align: middle;
}

// 地址
.region {
  display: flex;
  .el-input {
    margin-right: 10px;
    flex: 1;
  }
  /deep/.el-input.is-disabled .el-input__inner {
    // background-color: #fff !important;
    color: #333;
  }
}

.part2 {
  border-top: 40px solid #eaeaea;
  .box {
    margin-top: 40px;
    .title {
      height: 50px;
      padding: 0 20px;
      border: 1px solid #ddd;
      border-bottom: none;
      font: 550 16px/50px "黑体";
      span {
        color: #409eff;
        cursor: pointer;
      }
    }
    .content {
      border: 1px solid #ddd;
      padding-right: 40px;
    }
  }
}

.tac {
  display: inline-block;
  text-align: center;
}

.editfooter {
  text-align: right;
  margin-top: 20px;
}
</style>