import request from "@/utils/request";
import qs from "qs";

// 新增台账信息
export let createLedgerInfo = (params: any) => {
  return request({
    url: "/ledgerInfo/createInfo",
    method: "post",
    data: qs.stringify(params),
  });
};

// 删除台账信息
export let deleteLedgerInfo = (params: {
  id: number;
  companyInfoId: number;
}) => {
  return request({
    url: "/ledgerInfo/deleteInfo",
    method: "delete",
    params,
  });
};

// 编辑台账信息
export let updateLedgerInfo = (params: any) => {
  return request({
    url: "/ledgerInfo/updateInfo",
    method: "put",
    data: qs.stringify(params),
  });
};
