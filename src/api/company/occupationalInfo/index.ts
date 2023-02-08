import request from "@/utils/request";
import qs from "qs";

// 新增单位检测
export let createUnitTest = (params: object) => {
  return request({
    url: "/occupational/createUnitTest",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增职业健康体检
export let createOcTest = (params: object) => {
  return request({
    url: "/occupational/createOcTest",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除单位检测
export let deleteUnitTest = (params: { id: number; companyInfoId: number }) => {
  return request({
    url: "/occupational/deleteUnitTest",
    method: "delete",
    params,
  });
};

// 删除职业健康体检
export let deleteOcTest = (params: { id: number; companyInfoId: number }) => {
  return request({
    url: "/occupational/deleteOcTest",
    method: "delete",
    params,
  });
};

// 编辑单位检测
export let updateUnitTest = (params: object) => {
  return request({
    url: "/occupational/updateUnitTest",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑职业健康体检
export let updateOcTest = (params: object) => {
  return request({
    url: "/occupational/updateOcTest",
    method: "put",
    data: qs.stringify(params),
  });
};
