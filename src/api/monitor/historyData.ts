import request from "@/utils/request";

// 获取企业下的传感器的历史数据
export let findHistory = (params: {
  endTime: string;
  sensorDeviceId: number;
  startTime: string;
}) => {
  return request({
    url: "/sensorData/findHistory",
    method: "get",
    params,
    timeout: 0,
  });
};
