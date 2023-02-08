import request from "@/utils/request";
import qs from "qs";

// 新增安全生产许可证信息;
export let createSafetyProductionInfo = (params: object) => {
  return request({
    url: "/safetyProductionInfo/createInfo",
    method: "post",
    data: params,
  });
};

// 新增安全生产许可证
export let createSafetyLicense = (params: object) => {
  return request({
    url: "/safetyProductionInfo/createLicense",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除安全生产许可证
export let deleteSafetyLicense = (params: {
  id: number;
  safetyProductionInfoId: number;
}) => {
  return request({
    url: "/safetyProductionInfo/deleteLicense",
    method: "delete",
    params,
  });
};

// 编辑安全生产许可证信息
export let updateSafetyProductionInfo = (params: object) => {
  return request({
    url: "/safetyProductionInfo/updateInfo",
    method: "put",
    data: params,
  });
};

// 编辑安全生产许可证
export let updateSafetyLicense = (params: object) => {
  return request({
    url: "/safetyProductionInfo/updateLicense",
    method: "put",
    data: qs.stringify(params),
  });
};
