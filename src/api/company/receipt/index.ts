import request from "@/utils/request";
import qs from "qs";

// 新增作业场所职业病危害申报回执
export let createReceipt = (params: any) => {
  return request({
    url: "/occupational/createReceipt",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除作业场所职业病危害申报回执
export let deleteReceipt = (params: { id: number; companyInfoId: number }) => {
  return request({
    url: "/occupational/deleteReceipt",
    method: "delete",
    params,
  });
};

// 编辑作业场所职业病危害申报回执
export let updateReceipt = (params: any) => {
  return request({
    url: "/occupational/updateReceipt",
    method: "put",
    data: qs.stringify(params),
  });
};
