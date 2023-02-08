import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
  startTime?: string;
  endTime?: string;
  limit: number;
  page: number;
  sensorDeviceId?: number;
  companyInfoId: number | null;
}
//  获取企业下的传感器列表
export let alarmFindByPage = (params: pagingParams) => {
  return request({
    url: "/warning/findByPage",
    method: "get",
    params,
  });
};
