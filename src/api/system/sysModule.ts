import request from "@/utils/request";
import qs from "qs";

//  根据角色获取模块
export let getSide = () => {
  return request({
    url: "/sysModule/getSide",
    method: "get",
    timeout: 0,
  });
};

//  获取所有模块
export let getModule = () => {
  return request({
    url: "/sysModule/getModule",
    method: "get",
  });
};
