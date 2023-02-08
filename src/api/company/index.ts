import request from "@/utils/request";
import qs from "qs";

//  获取全部企业档案企业列表
export let findAllCompany = () => {
  return request({
    url: "/company/findAll",
    method: "get",
  });
};

// 新增企业基础信息
export let createCompany = (params: object) => {
  return request({
    url: "/company/create",
    method: "post",
    data: params,
  });
};


//根据企业ID获取自己企业的企业数据
export let getCompanyByMyself = (params: object) => {
  return request({
    url: "/company/getByMyself",
    method: "get",
    params
  });
};

// 删除企业信息（假删除）
export let deleteCompany = (params: { id: number }) => {
  return request({
    url: "/company/delete",
    method: "delete",
    params,
  });
};

// 编辑企业基础信息
export let updateCompany = (params: object) => {
  return request({
    url: "/company/update",
    method: "put",
    data: params,
  });
};

// 获取非媒企业档案企业详情（新增或更新页面）
export let companyDetails = (params: { companyId: number }) => {
  return request({
    url: "/company/mineDetails",
    method: "get",
    params,
  });
};

// 新增营业执照
export let createBusinessLicense = (params: object) => {
  return request({
    url: "/businessLicense/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑营业执照
export let updateBusinessLicense = (params: object) => {
  return request({
    url: "/businessLicense/update",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除营业执照
export let deleteBusinessLicense = (params: {
  companyInfoId: number;
  id: number;
}) => {
  return request({
    url: "/businessLicense/delete",
    method: "delete",
    params,
  });
};

// 根据镇获取下面的企业
export let getListByTown = (params: {
  companyId?: number;
  townCode?: number;
}) => {
  return request({
    url: "/company/getListByTown",
    method: "get",
    params,
  });
};

//  获取该企业标签云
export let getLabel = (params: { companyId: number }) => {
  return request({
    url: "/Label/getLabelById",
    method: "get",
    params,
  });
};

//  资料完整度
export let getDataIntegrity = (params: { companyId: number }) => {
  return request({
    url: "/company/getDataIntegrity",
    method: "get",
    params,
  });
};
