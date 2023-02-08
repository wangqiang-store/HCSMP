import request from "@/utils/request";
import qs from "qs";

// 新增矿山生产施工单位
export let createMineProductionUnit = (params: object) => {
  return request({
    url: "/mineProduction/createUnit",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除矿山生产施工单位
export let daleteMineProductionUnit = (params: {
  id: number;
  mineProductionInfoId?: number;
  mineOpenAirProductionInfoId?: number;
}) => {
  return request({
    url: "/mineProduction/deleteUnit",
    method: "delete",
    params,
  });
};

// 编辑矿山生产施工单位
export let updateMineProductionUnit = (params: object) => {
  return request({
    url: "/mineProduction/updateUnit",
    method: "put",
    data: qs.stringify(params),
  });
};

// 新增矿山生产信息(地下矿山生产信息)
export let createMineProductionInfo = (params: object) => {
  return request({
    url: "/mineProduction/createInfo",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑矿山生产信息(地下矿山生产信息)
export let updateMineProductionInfo = (params: object) => {
  return request({
    url: "/mineProduction/updateInfo",
    method: "put",
    data: qs.stringify(params),
  });
};

// 新增矿山生产信息(露天矿山生产信息)
export let createMineOpenAirProductionInfo = (params: object) => {
  return request({
    url: "/mineOpenAirProductionInfo/createInfo",
    method: "post",
    data: params,
  });
};

// 编辑矿山生产信息(露天矿山生产信息)
export let updateMineOpenAirProductionInfo = (params: object) => {
  return request({
    url: "/mineOpenAirProductionInfo/updateInfo",
    method: "put",
    data: params,
  });
};
