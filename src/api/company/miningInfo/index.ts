import request from "@/utils/request";
import qs from "qs";

// 新增采矿许可证信息
export let createMiningInfo = (params: object) => {
  return request({
    url: "/miningInfo/createInfo",
    method: "post",
    data: params,
  });
};

// 新增采矿许可证
export let createLicense = (params: object) => {
  return request({
    url: "/miningInfo/createLicense",
    method: "post",
    data: params,
  });
};

// 删除采矿许可证
export let deleteLicense = (params: { id: number; miningInfoId: number }) => {
  return request({
    url: "/miningInfo/deleteLicense",
    method: "delete",
    params,
  });
};

// 编辑采矿许可证
export let updateLicense = (params: object) => {
  return request({
    url: "/miningInfo/updateLicense",
    method: "put",
    data: params,
  });
};

// 编辑采矿许可证信息
export let updateMiningInfo = (params: object) => {
  return request({
    url: "/miningInfo/updateInfo",
    method: "put",
    data: params,
  });
};
