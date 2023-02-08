import request from "@/utils/request";
import qs from "qs";

// 镇级企业监控设备树
export let findAndTree = () => {
  return request({
    url: "/monitorDevice/findAndTree",
    method: "get",
  });
};

// 添加企业监控设备
export let createMonitorDevice = (params: any) => {
  return request({
    url: "/monitorDevice/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 更新监控设备
export let updateMonitorDevice = (params: any) => {
  return request({
    url: "/monitorDevice/update",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除监控设备
export let deleteMonitorDevice = (params: { id: number }) => {
  return request({
    url: "/monitorDevice/delete",
    method: "delete",
    params,
  });
};

// 获取企业监控设备详情
export let findOneMonitorDevice = (params: { id: number }) => {
  return request({
    url: "/monitorDevice/findOne",
    method: "get",
    params,
  });
};

//  获取企业下监控传感器列表
export let findByCompanyMonitorDevice = (params: { companyInfoId: number }) => {
  return request({
    url: "/monitorDevice/findByCompany",
    method: "get",
    params,
  });
};

// 级联查询子级这一级的数据, 不包括孙集
export let cascadeRegion = (params: { indexCode: string }) => {
  return request({
    url: "/monitorDevice/cascadeRegion",
    method: "get",
    params,
  });
};

// 同步企业与海康上的公司区域code(同步 修改同步 取消同步)
export let synchronization = (params: {
  indexCode?: string | null;
  companyId: string;
}) => {
  return request({
    url: "/monitorDevice/synchronization",
    method: "post",
    data: qs.stringify(params),
  });
};

// 查询所有的已同步的企业的indexCode列表;
export let findAllAlreadySync = () => {
  return request({
    url: "/monitorDevice/findAllAlreadySync",
    method: "get",
  });
};

// 根据编号获取区域详细信息
export let findRegionInfo = (params: { regionIndexCode: string }) => {
  return request({
    url: "/monitorDevice/findRegionInfo",
    method: "post",
    params,
  });
};
