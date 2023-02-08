import request from "@/utils/request";
import qs from "qs";

// 新增应急演练信息
export let createEmergencyDrill = (params: object) => {
  return request({
    url: "/emergencyDrill/createInfo",
    method: "post",
    data: qs.stringify(params),
  });
};

//  删除应急演练信息
export let deleteEmergencyDrill = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/emergencyDrill/deleteInfo",
    method: "delete",
    params,
  });
};

// 编辑应急演练信息
export let updateEmergencyDrill = (params: object) => {
  return request({
    url: "/emergencyDrill/updateInfo",
    method: "put",
    data: qs.stringify(params),
  });
};
