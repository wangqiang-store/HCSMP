import request from "@/utils/request";

// 根据传感器获取当前最新的实时数据
export let findByDevice = (params: { deviceId: number }) => {
  return request({
    url: "/simulation/findByDevice",
    method: "get",
    params,
    timeout: 0,
  });
};

// 获取企业液位传感器列表
export let findByPosition = (params: { companyInfoId: number }) => {
  return request({
    url: "/sensorDevice/findByPosition",
    method: "get",
    params,
  });
};

// 获取企业液压传感器列表
export let findByPressure = (params: { companyInfoId: number }) => {
  return request({
    url: "/sensorDevice/findByPressure",
    method: "get",
    params,
  });
};
