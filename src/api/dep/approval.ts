// 行政审批事项

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    yearly?: number;
}
//分页获取审批事项列表
export let getPageApprova = (params: pagingParams) => {
    return request({
        url: "/approvalItems/findByPage",
        method: "get",
        params,
    });
};


//新增行政审批事项
export let createApprovalItems = (params: object) => {
    return request({
        url: "/approvalItems/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};


//编辑行政审批事项
export let updateApprovalItems = (params: object) => {
    return request({
        url: "/approvalItems/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};

//删除行政审批事项
export let deleteApprovalItems = (params: { itemId: number }) => {
    return request({
        url: "/approvalItems/deleteInfo",
        method: "delete",
        params,
    });
};



