import { getByKey, RES_SUCCESS } from "@/api/common/common";
import { findAllCompany } from "@/api/company/index";
import { getAllTown } from "@/api/ent/noncoalmine";
import { findAndTree, findByCompanySensorDevice } from "@/api/monitor/device";
import { getAllProvince } from "@/api/region";
import {
  getEnablePersonnel,
  getNotEnablePersonnel,
} from "@/api/system/personnel";
import { findEnableRole } from "@/api/system/sysRole";
let globalData: any = {
  state: {
    // 企业列表
    companyList: [],
    // 企业信息
    companyInfo: {},
    // 所有启用角色
    enableRoleList: [],
    // 所有启用人员
    enablePersonnelList: [],
    //未关联人员
    notEnablePersonnelList: [],
    // 英德所有镇列表
    townList: [],
    // 营业执照路由路径 一级
    title: "",
    // 营业执照路由路径 二级
    twoTitle: "",
    // 所有省列表
    provinceList: [],
    // 经济类型
    economicTypeList: [],
    // 镇级 树形数据
    threeTownList: [],
    //当前用户 - 地图传感器企业
    userCompanyInfo: {},
    // 部门行政监管信息
    supervisionInfo: {},
    //日常监督检查信息
    dailyInfo: {},
    //整改上报信息
    updateReportInfo: {},
    //隐患排查信息
    checkInfo: {},
    //宣传宣教信息
    propagandaInfo: {},
    //培训管理信息
    trainInfo: {},
    // 摄像头code列表
    codeDeviceList: [],
    // 控制 非煤 详情编辑按钮
    nonCoalEditBtn: false,
    // 控制 工贸 详情编辑按钮
    industryEditBtn: false,
    // 显示菜单是否收合
    collection:false,
  },
  mutations: {
    // 修改企业列表
    setCollection: (state: any, data: any) => {
      state.collection = data;
    },
    // 修改企业列表
    setCompanyList: (state: any, data: any) => {
      state.companyList = data;
    },
    // 修改所有启用角色
    setEnableRoleList: (state: any, data: any) => {
      state.enableRoleList = data;
    },
    // 修改所有启用人员
    setEnablePersonnelList: (state: any, data: any) => {
      state.enablePersonnelList = data;
    },
    // 修改未关联人员
    setNotEnablePersonnelList: (state: any, data: any) => {
      state.notEnablePersonnelList = data;
    },
    // 修改英德所有镇列表
    setTownList: (state: any, data: any) => {
      state.townList = data;
    },
    // 营业执照路由路径 一级
    setTitle: (state: any, title: string) => {
      state.title = title;
    },
    // 营业执照路由路径 二级
    setTwoTitle: (state: any, title: string) => {
      state.twoTitle = title;
    },
    // 修改省
    setProvinceList: (state: any, data: Array<any>) => {
      state.provinceList = data;
    },
    // 修改经济类型列表
    setEconomicTypeList: (state: any, data: Array<any>) => {
      state.economicTypeList = data;
    },
    // 修改企业信息
    setCompanyInfo: (state: any, data: any) => {
      state.companyInfo = data;
    },
    // 修改用户企业
    setUserCompanyInfo: (state: any, data: any) => {
      state.userCompanyInfo = data;
    },
    // 镇级 树形数据
    setThreeTownList: (state: any, data: Array<any>) => {
      state.threeTownList = data;
    },
    // 修改部门行政监管信息
    setSupervisionInfo: (state: any, data: object) => {
      state.supervisionInfo = data;
    },
    // 修改日常监督检查信息
    setDailyInfo: (state: any, data: object) => {
      state.dailyInfo = data;
    },
    // 修改整改上报信息
    setUpdateReportInfo: (state: any, data: object) => {
      state.updateReportInfo = data;
    },
    //修改隐患排查信息
    setCheckInfo: (state: any, data: object) => {
      state.checkInfo = data;
    },
    //修改宣传宣教信息
    setPropagandaInfo: (state: any, data: object) => {
      state.propagandaInfo = data;
    },
    //修改培训管理信息
    setTrainInfo: (state: any, data: object) => {
      state.trainInfo = data;
    },
    // 修改摄像头列表
    setCodeDeviceList: (
      state: any,
      data: { data: Array<any>; isReset: Boolean }
    ) => {
      if (data.isReset) {
        state.codeDeviceList = [];
      } else {
        state.codeDeviceList = state.codeDeviceList.concat(data.data);
      }
    },
    // 修改 显示企业详情编辑按钮权限
    setShowEditBtn: (
      state: any,
      data: { isShowNonEditBtn: boolean; isIndustryEditBtn: boolean }
    ) => {
      state.nonCoalEditBtn = data.isShowNonEditBtn;
      state.industryEditBtn = data.isIndustryEditBtn;
    },
  },
  actions: {
    // 企业列表
    handleGetAllCompany: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await findAllCompany();
        if (data.code === RES_SUCCESS) {
          let companyList: Array<any> = [];
          if (data.data != null && data.data.length > 0) {
            data.data.forEach((item: any) => {
              companyList.push({
                id: item.id,
                type: item.type,
                name: item.name,
                address: item.address,
                provinceCode: item.provinceCode,
                cityCode: item.cityCode,
                countyCode: item.countyCode,
                townCode: item.townCode,
                // indexCode: item.indexCode,
              });
            });
          }
          commit("setCompanyList", companyList);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 所有启用角色
    handleGetEnableRole: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await findEnableRole();
        if (data.code === RES_SUCCESS) {
          commit("setEnableRoleList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 所有启用人员
    handleGetEnablePersonnel: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await getEnablePersonnel();
        if (data.code === RES_SUCCESS) {
          commit("setEnablePersonnelList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 未关联人员
    handleGetNotEnablePersonnel: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await getNotEnablePersonnel();
        if (data.code === RES_SUCCESS) {
          commit("setNotEnablePersonnelList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 英德所有镇列表
    handleGetTownList: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await getAllTown();
        if (data.code === RES_SUCCESS) {
          commit("setTownList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 获取所有的省
    handleGetAllProvince: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await getAllProvince();
        if (data.code === RES_SUCCESS) {
          commit("setProvinceList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 获取经济类型列表
    handleEconomicType: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await getByKey({ key: "t_economic_type" });
        if (data.code === RES_SUCCESS) {
          commit("setEconomicTypeList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 获取树形控件数据
    handleGetThree: ({ commit }: any) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await findAndTree();
        if (data.code === RES_SUCCESS) {
          commit("setThreeTownList", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
    // 获取企业传感器数据
    handleCompanySensor: ({ commit }: any, companyInfoId: number) => {
      return new Promise(async (resolve, reject) => {
        let { data } = await findByCompanySensorDevice({ companyInfoId });
        if (data.code === RES_SUCCESS) {
          commit("setUserCompanyInfo", data.data);
          resolve(data.data);
        } else {
          reject();
        }
      });
    },
  },
  getters: {},
};

export default globalData;
