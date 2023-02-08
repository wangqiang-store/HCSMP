import request from "@/utils/request";
import qs from "qs";

// 查询所有省列表;
export let getAllProvince = () => {
  return request({
    url: "/province/getAll",
    method: "get",
  });
};

//  根据代码查询省
export let getProvince = (params: { code: number }) => {
  return request({
    url: "/province/get",
    method: "get",
    params,
  });
};

//  根据省代码查询市
export let getByCity = (params: { code: number }) => {
  return request({
    url: "/city/getByProvinceCode",
    method: "get",
    params,
  });
};

//  根据代码获取市
export let getCity = (params: { code: number }) => {
  return request({
    url: "/city/get",
    method: "get",
    params,
  });
};

//  根据市代码查询区
export let getByCounty = (params: { code: number }) => {
  return request({
    url: "/county/getByCityCode",
    method: "get",
    params,
  });
};

//  根据代码获取区
export let getCounty = (params: { code: number }) => {
  return request({
    url: "/county/get",
    method: "get",
    params,
  });
};

// 根据区代码查询乡镇街道;
export let getByTown = (params: { code: number }) => {
  return request({
    url: "/town/getByCityCode",
    method: "get",
    params,
  });
};

// 根据代码获取乡镇街道;
export let getTown = (params: { code: number }) => {
  return request({
    url: "/town/get",
    method: "get",
    params,
  });
};
