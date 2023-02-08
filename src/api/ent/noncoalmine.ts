import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
  content?: string;
  limit: number;
  page: number;
  townCode?: number;
  type?: number;
}
//  获取企业档案企业列表（政府单位）
export let getByGovPage = (params: pagingParams) => {
  return request({
    url: "/company/getByGovPage",
    method: "get",
    params,
  });
};

// 获取企业档案企业列表（企业单位）
export let getByNewPage = (params: { companyId: number; type: number }) => {
  return request({
    url: "/company/getByNewPage",
    method: "get",
    params,
  });
};

// 根据企业ID获取企业档案信息备注
export let getNotes = (params: { id: number }) => {
  return request({
    url: "/company/notes",
    method: "get",
    params,
  });
};

// 设置风险等级
export let setRiskLevel = (params: { id: number; value: number }) => {
  return request({
    url: "/company/setRiskLevel",
    method: "put",
    data: qs.stringify(params),
  });
};

// 更新授权企业编辑
export let updateAuthorize = (params: { id: number }) => {
  return request({
    url: "/company/updateAuthorize",
    method: "put",
    data: qs.stringify(params),
  });
};

// 获取所有英德市的镇的列表
export let getAllTown = () => {
  return request({
    url: "/company/getAllTown",
    method: "get",
  });
};

//根据镇获取下面的企业
export let getCompanyByTown = (params: object) => {
  return request({
    url: "/company/getListByTown",
    method: "get",
    params,
  });
};

//  添加企业备注
export let createNotes = (parmas: object) => {
  return request({
    url: "/notes/addNotes",
    method: "post",
    data: qs.stringify(parmas),
  });
};

// 编辑企业备注
export let updateNotes = (parmas: object) => {
  return request({
    url: "/notes/updateNotes",
    method: "put",
    data: qs.stringify(parmas),
  });
};

// 删除企业备注
export let deleteNotes = (params: { notesId: number }) => {
  return request({
    url: "/notes/delete",
    method: "delete",
    params,
  });
};
