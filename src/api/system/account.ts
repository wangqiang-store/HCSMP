import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
  limit: number;
  page: number;
  keyword?: string;
}
// 分页查找所有用户
export let getPageAccount = (params: pagingParams) => {
  return request({
    url: "/sysUser/search",
    method: "get",
    params,
  });
};

// 添加用户
export let createAccount = (params: object) => {
  return request({
    url: "/sysUser/addUser",
    method: "post",
    data: qs.stringify(params),
  });
};

//  编辑用户
export let updateAccount = (params: object) => {
  return request({
    url: "/sysUser/updateUser",
    method: "put",
    data: qs.stringify(params),
  });
};

//  用户名查重
export let checkRepeat = (params: { username: string }) => {
  return request({
    url: "/sysUser/checkRepeat",
    method: "get",
    params,
  });
};
