import request from "@/utils/request";
import qs from "qs";

// 根据区域编号获取下级监控点列表(公司那一级code)
export let encodeDevice = (params: { regionIndexCode: string }) => {
  return request({
    url: "/monitorDevice/findCamerasList",
    method: "post",
    data: qs.stringify(params),
  });
};

// 根据监控点编号进行云台操作
export let yunTaiOperation = (params: {
  action: number;
  cameraIndexCode: string;
  command: string;
  speed: number;
}) => {
  return request({
    url: "/RealTimeMonitor/yunTaiOperation",
    method: "post",
    data: qs.stringify(params),
  });
};
