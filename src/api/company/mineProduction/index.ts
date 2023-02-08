import request from "@/utils/request";
import qs from "qs";

// 新增矿山生产基础信息
export let createMineProductionBaseInfo = (params: object) => {
  return request({
    url: "/mineProduction/createBaseInfo",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑矿山生产基础信息
export let updateMineProductionBaseInfo = (params: object) => {
  return request({
    url: "/mineProduction/updateBaseInfo",
    method: "put",
    data: qs.stringify(params),
  });
};
