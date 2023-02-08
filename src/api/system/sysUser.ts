import request from "@/utils/request";
import qs from "qs";

// 获取token
export let signIn = (params: { username: string; password: string }) => {
  return request({
    url: "/sysUser/token",
    method: "get",
    params,
  });
};

// 刷新token
export let refreshToken = (params: { refreshToken: string | null }) => {
  return request({
    url: "/sysUser/refreshToken",
    method: "get",
    params,
  });
};

//  获取用户信息
export let getInfo = () => {
  return request({
    url: "/sysUser/info",
    method: "get",
  });
};

//  修改密码
export let updatePwd = (params: { newPwd: string; oldPwd: string }) => {
  return request({
    url: "/sysUser/updatePwd",
    method: "put",
    data: qs.stringify(params),
  });
};

//  重置用户密码
export let resetPassword = (params: { userId: number }) => {
  return request({
    url: "/sysUser/resetPassword",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除用户
export let deleteUser = (params: { id: number }) => {
  return request({
    url: "/sysUser/delete",
    method: "delete",
    params,
  });
};

//二次验证----------------------------------------------
//  二次认证的认证绑定
export let bindingSecret = (params: { code: string; secret: string }) => {
  return request({
    url: "/sysUser/bindingSecret",
    method: "post",
    data: qs.stringify(params),
  });
};

//  二次验证获取token
export let twoLogin = (params: {
  code: string;
  password: string;
  username: string;
}) => {
  return request({
    url: "/sysUser/totp",
    method: "post",
    data: qs.stringify(params),
  });
};

// 二次验证的URI接口
export let createSecretUri = () => {
  return request({
    url: "/sysUser/createSecretUri",
    method: "get",
  });
};

//  二次验证的解绑
export let removeSecret = (params: { code: string }) => {
  return request({
    url: "/sysUser/removeSecret",
    method: "post",
    params,
  });
};

//  用户密码是否六个月未修改(返回boolean结果,true为超过六个月没修改)
export let isUpdatePwd = (params: { userId: number }) => {
  return request({
    url: "/sysUser/isUpdatePwd",
    method: "get",
    params,
  });
};
