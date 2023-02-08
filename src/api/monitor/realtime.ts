import request from "@/utils/request";
import qs from "qs";

//  获取企业下的传感器列表
export let sensorDataByCompany = (params: { companyInfoId: number }) => {
  return request({
    url: "/sensorData/findByCompany",
    method: "get",
    params,
    timeout: 0,
  });
};

// 获取企业下的传感器的历史数据
export let sensorDataHistory = (params: {
  sensorDeviceId: number;
  endTime: string;
  startTime: string;
}) => {
  return request({
    url: "/sensorData/findHistory",
    method: "get",
    params,
  });
};
