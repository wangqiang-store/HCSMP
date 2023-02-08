import request from "@/utils/request";
import qs from "qs";

// 镇级企业传感器树
export let findAndTree = () => {
  return request({
    url: "/sensorDevice/findAndTree",
    method: "get",
    timeout: 0,
  });
};

//  添加企业传感器设备
export let createSensorDevice = (paeasm: object) => {
  return request({
    url: "/sensorDevice/create",
    method: "post",
    data: paeasm,
  });
};

// 获取企业传感器设备详情
export let findOne = (params: { id: number }) => {
  return request({
    url: "/sensorDevice/findOne",
    method: "get",
    params,
    timeout: 0,
  });
};

// 更新传感器设备
export let updateSensorDevice = (params: object) => {
  return request({
    url: "/sensorDevice/update",
    method: "put",
    data: params,
  });
};

// 删除传感器设备及其读取参数;
export let deleteSensorDevice = (params: { id: number }) => {
  return request({
    url: "/sensorDevice/delete",
    method: "delete",
    params,
  });
};

//  获取企业下传感器列表
export let findByCompanySensorDevice = (params: { companyInfoId: number }) => {
  return request({
    url: "/sensorDevice/findByCompany",
    method: "get",
    params,
  });
};

// 获取英德市下的所有企业列表
export let findGetAllSensorDevice = () => {
  return request({
    url: "/sensorDevice/findGeoAll",
    method: "get",
  });
};

// 新增网关信息
export let createGatway = (params: object) => {
  return request({
    url: "/gateway/create",
    method: "post",
    data: params,
  });
};

// 删除网关信息
export let deleteGatway = (params: { id: number }) => {
  return request({
    url: "/gateway/delete",
    method: "delete",
    params,
  });
};

// 编辑网关信息
export let updateGatway = (params: object) => {
  return request({
    url: "/gateway/update",
    method: "put",
    data: params,
  });
};

// 获取企业对应的网关SN列表
export let findByCompanyGateway = (params: { companyInfoId: number }) => {
  return request({
    url: "/gateway/findByCompany",
    method: "get",
    params,
  });
};

// 获取可用的网关列表
export let findEnableGateway = () => {
  return request({
    url: "/gateway/findEnable",
    method: "get",
  });
};

//  获取企业传感器UUID列表
export let findUUIDs = (params: { sn: string }) => {
  return request({
    url: "/sensorDevice/findUUIDs",
    method: "get",
    params,
    timeout: 0,
  });
};
