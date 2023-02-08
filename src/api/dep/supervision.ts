import request from "@/utils/request";
import qs from "qs";

interface findByPage {
  content?: string;
  limit: number;
  page: number;
  yearly?: number;
}
// 分页获取行政监管列表
export let findByPageDepartSupervision = (params: findByPage) => {
  return request({
    url: "/departSupervision/findByPage",
    method: "get",
    params,
  });
};

// 新增部门行政监管
export let createDepartSupervision = (params: object) => {
  return request({
    url: "/departSupervision/createInto",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除部门行政监管
export let deleteDepartSupervision = (params: { id: number }) => {
  return request({
    url: "/departSupervision/deleteInfo",
    method: "delete",
    params,
  });
};

// 编辑部门行政监管
export let updateDepartSupervision = (params: object) => {
  return request({
    url: "/departSupervision/updateInfo",
    method: "put",
    data: qs.stringify(params),
  });
};
