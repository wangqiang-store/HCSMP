import request from "@/utils/request";
import qs from "qs";

// 新增矿山排土场信息
export let createMineDumpingInfo = (params: object) => {
  return request({
    url: "/mineDumpingInfo/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑矿山排土场信息
export let updateMineDumpingInfo = (params: object) => {
  return request({
    url: "/mineDumpingInfo/update",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除矿山排土场信息
export let deleteMineDumpingInfo = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/mineDumpingInfo/delete",
    method: "delete",
    params,
  });
};

//  批量删除矿山排土场信息
export let batchDeleteMineDumpingInfo = (params: { companyInfoId: number }) => {
  return request({
    url: "/mineDumpingInfo/batchDelete",
    method: "delete",
    params,
  });
};
