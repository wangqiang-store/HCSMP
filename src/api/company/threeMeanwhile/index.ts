import request from "@/utils/request";
import qs from "qs";

// 新增三同时及安全评价信息
export let createThreesimultaneous = (params: object) => {
  return request({
    url: "/threesimultaneous/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除三同时及安全评价信息
export let deleteThreesimultaneous = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/threesimultaneous/delete",
    method: "delete",
    params,
  });
};

//  编辑三同时及安全评价信息
export let updateThreesimultaneous = (params: object) => {
  return request({
    url: "/threesimultaneous/update",
    method: "put",
    data: qs.stringify(params),
  });
};
