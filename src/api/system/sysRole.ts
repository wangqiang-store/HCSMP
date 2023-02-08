import request from "@/utils/request";
import qs from "qs";

interface pagingParmas {
  keyword?: string;
  limit: number;
  page: number;
}
//  关键字(名称，描述，创建者)查找
export let searchRole = (params: pagingParmas) => {
  return request({
    url: "/sysRole/search",
    method: "get",
    params,
  });
};
// 添加角色
export let createRole = (params: object) => {
  return request({
    url: "/sysRole/addRole",
    method: "post",
    data: qs.stringify(params),
  });
};

// 修改角色信息
export let updateRole = (params: object) => {
  return request({
    url: "/sysRole/updateRole",
    method: "put",
    data: qs.stringify(params),
  });
};

//  根据角色ID获取模块
export let getRoleModule = (params: { roleId: number }) => {
  return request({
    url: "/roleModule/getRoleModule",
    method: "get",
    params,
  });
};

// 添加/删除角色模块(全选时父子节点冲突，则只传子节点ID)
export let updateRoleModule = (params: object) => {
  return request({
    url: "/roleModule/adddel",
    method: "post",
    data: qs.stringify(params),
  });
};

// 查找所有可用的角色
export let findEnableRole = () => {
  return request({
    url: "/sysRole/findEnableRole",
    method: "get",
  });
};

// 删除角色
export let deleteRole = (params: { roleId: number }) => {
  return request({
    url: "/sysRole/delete",
    method: "delete",
    params,
  });
};
