import request from "@/utils/request";
import qs from "qs";

interface getPage {
  content?: string;
  isEnable?: boolean;
  isOfficers?: boolean;
  limit: number;
  page: number;
  unitType?: number;
}

//  分页查找所有人员
export let getPagePersonnel = (params: getPage) => {
  return request({
    url: "/personnel/getPage",
    method: "get",
    params,
  });
};

//  添加人员信息
export let createPersonnel = (params: object) => {
  return request({
    url: "/personnel/addPersonnel",
    method: "post",
    data: qs.stringify(params),
  });
};

//  编辑人员
export let updatePersonnel = (params: object) => {
  return request({
    url: "/personnel/updatePersonnel",
    method: "put",
    data: qs.stringify(params),
  });
};

//  查询所有启用人员
export let getEnablePersonnel = () => {
  return request({
    url: "/personnel/getEnablePersonnel",
    method: "get",
  });
};

// 查询所有启用和未被关联的人员
export let getNotEnablePersonnel = () => {
  return request({
    url: "/personnel/getNotEnablePersonnel",
    method: "get",
  });
};

// 删除人员
export let deletePersonnel = (params: { id: number }) => {
  return request({
    url: "/personnel/delete",
    method: "delete",
    params,
  });
};

//查找启用的政府人员
export let getGovEnablePersonnel = () => {
  return request({
    url: "/personnel/findByGovernment",
    method: "get",
  });
};

// 查询该企业是否与其他人员已绑定
export let getEnableBound = (params: { companyId: number }) => {
  return request({
    url: "/personnel/getEnableBound",
    method: "get",
    params,
  });
};

//  查询该人员关联的关联信息列表
export let getAssociatedInformation = (params: { personnelId: number }) => {
  return request({
    url: "/personnel/getAssociatedInformation",
    method: "get",
    params,
  });
};
