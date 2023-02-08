import request from "@/utils/request";
import qs from "qs";

// 新增爆破公司信息
export let createBlastInfo = (params: any) => {
  return request({
    url: "/blastInfo/createCompany",
    method: "post",
    data: params,
  });
};

// 新增爆破人员信息
export let createStaff = (params: any) => {
  return request({
    url: "/blastInfo/createStaff",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除爆破人员信息
export let deleteStaff = (params: { id: number; blastCompanyId: number }) => {
  return request({
    url: "/blastInfo/deleteStaff",
    method: "delete",
    params,
  });
};

// 编辑爆破公司信息
export let updateBlastInfo = (params: any) => {
  return request({
    url: "/blastInfo/updateCompany",
    method: "put",
    data: params,
  });
};

// 编辑爆破人员信息;
export let updateStaff = (params: any) => {
  return request({
    url: "/blastInfo/updateStaff",
    method: "put",
    data: qs.stringify(params),
  });
};
