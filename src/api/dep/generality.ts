import request from "@/utils/request";
import qs from "qs";



//获取某年全市矿山概况
export let getFindOneOverview = (params: {yearly:number}) => {
  return request({
    url: "/overview/findOne",
    method: "get",
    params,
  });
};


//新增矿山概况
export let createOverview = (params: object) => {
  return request({
      url: "/overview/createInfo",
      method: "post",
      data: qs.stringify(params),
  });
};



//编辑矿山概况
export let updateOverview = (params: object) => {
    return request({
      url: "/overview/updateInfo",
      method: "put",
      data: qs.stringify(params),
    });
  };
