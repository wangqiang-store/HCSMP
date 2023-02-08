import request from "@/utils/request";
import qs from "qs";

// 新增企业全景图信息
export let createCompanyPanorama = (params: object) => {
  return request({
    url: "/companyPanorama/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑企业全景图信息
export let updateCompanyPanorama = (params: object) => {
  return request({
    url: "/companyPanorama/update",
    method: "put",
    data: qs.stringify(params),
  });
};
