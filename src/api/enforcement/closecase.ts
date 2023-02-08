// 安监执法/结案处理接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}


//分页获取结案处理列表
export let getCaseSettlementPage = (params: pagingParams) => {
    return request({
        url: "/CaseSettlement/findByPage",
        method: "get",
        params,
    });
};


//新增结案处理
export let createCaseSettlementInfo = (params: object) => {
    return request({
        url: "/CaseSettlement/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除结案处理
export let deleteCaseSettlementInfo = (params: { id: number }) => {
    return request({
        url: "/CaseSettlement/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑结案处理
export let updateAccountabilityInfo = (params: object) => {
    return request({
        url: "/CaseSettlement/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
