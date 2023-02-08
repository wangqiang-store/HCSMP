import request from "@/utils/request";
import qs from "qs";

// 获取启用的企业列表（救护协议和应急备案）
export let getAllCompanyList = () => {
  return request({
    url: "/mineServe/findAllUse",
    method: "get",
  });
};

//分页获取应急预案备案列表
export let getMineServePage = (params: object) => {
  return request({
    url: "/mineServe/findByPage",
    method: "get",
    params,
  });
};

//分页获取救护协议列表
export let getRescueAgreementPage = (params: object) => {
  return request({
    url: "/mineServe/findByPageRescueAgreement",
    method: "get",
    params,
  });
};

// 新增矿山年度救护协议
export let createAgreement = (params: object) => {
  return request({
    url: "/mineServe/createAgreement",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增安全责任险;
export let createInsurance = (params: object) => {
  return request({
    url: "/mineServe/createInsurance",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增应急预案备案
export let createPlan = (params: object) => {
  return request({
    url: "/mineServe/createPlan",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增外包安全管理协议
export let createSecurity = (params: object) => {
  return request({
    url: "/mineServe/createSecurity",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增年度技术服务信息
export let createTechnical = (params: object) => {
  return request({
    url: "/mineServe/createTechnical",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除矿山年度救护协议
export let deleteAgreement = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineServe/deleteAgreement",
    method: "delete",
    params,
  });
};

// 删除安全责任险
export let deleteInsurance = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineServe/deleteInsurance",
    method: "delete",
    params,
  });
};

// 删除应急预案备案
export let deletePlan = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineServe/deletePlan",
    method: "delete",
    params,
  });
};

//  删除外包安全管理协议
export let deleteSecurity = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineServe/deleteSecurity",
    method: "delete",
    params,
  });
};

// 删除年度技术服务信息
export let deleteTechnical = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineServe/deleteTechnical",
    method: "delete",
    params,
  });
};

// 编辑矿山年度救护协议
export let updateAgreement = (params: object) => {
  return request({
    url: "/mineServe/updateAgreement",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑安全责任险
export let updateInsurance = (params: object) => {
  return request({
    url: "/mineServe/updateInsurance",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑应急预案备案
export let updatePlan = (params: object) => {
  return request({
    url: "/mineServe/updatePlan",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑外包安全管理协议
export let updateSecurity = (params: object) => {
  return request({
    url: "/mineServe/updateSecurity",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑年度技术服务信息
export let updateTechnical = (params: object) => {
  return request({
    url: "/mineServe/updateTechnical",
    method: "put",
    data: qs.stringify(params),
  });
};
