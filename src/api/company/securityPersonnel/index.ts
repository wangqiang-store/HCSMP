import request from "@/utils/request";
import qs from "qs";

// 新增安全人员信息
export let createSafeStaff = (params: object) => {
  return request({
    url: "/staffInfo/createSafeStaff",
    method: "post",
    data: params,
  });
};

// 新增人员明细
export let createStaffInfo = (params: object) => {
  return request({
    url: "/staffInfo/createStaffInfo",
    method: "post",
    data: qs.stringify(params),
  });
};

// 新增人员培训
export let createTraining = (params: object) => {
  return request({
    url: "/staffInfo/createTraining",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除人员明细
export let deleteStaffInfo = (params: {
  id: number;
  safeStaffInfoId: number;
}) => {
  return request({
    url: "/staffInfo/deleteStaffInfo",
    method: "delete",
    params,
  });
};

// 删除人员培训
export let deleteTraining = (params: {
  id: number;
  safeStaffInfoId: number;
}) => {
  return request({
    url: "/staffInfo/deleteTraining",
    method: "delete",
    params,
  });
};

// 编辑安全人员信息
export let updateSafeStaff = (params: object) => {
  return request({
    url: "/staffInfo/updateSafeStaff",
    method: "put",
    data: params,
  });
};

// 编辑人员明细
export let updateStaffInfo = (params: object) => {
  return request({
    url: "/staffInfo/updateStaffInfo",
    method: "put",
    data: qs.stringify(params),
  });
};

// 编辑人员培训
export let updateTraining = (params: object) => {
  return request({
    url: "/staffInfo/updateTraining",
    method: "put",
    data: qs.stringify(params),
  });
};
