// 监督检查记录

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    yearly?: number;
}


//获取监督检查记录列表
export let getPageRecords = (params: pagingParams) => {
    return request({
        url: "/supervisionRecords/findByPage",
        method: "get",
        params,
    });
};



//新增监督检查记录
export let createSupervisionRecords = (params: object) => {
    return request({
        url: "/supervisionRecords/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};


//编辑监督检查记录
export let updateSupervisionRecords = (params: object) => {
    return request({
        url: "/supervisionRecords/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};


//删除监督检查记录
export let deleteSupervisionRecords = (params: {recordId:number }) => {
    return request({
        url: "/supervisionRecords/deleteInfo",
        method: "delete",
        params,
    });
};


//获取当前企业的监督检查记录全列表
export let getSupervisionAllRecords = (params: {companyId:number}) => {
    return request({
        url: "/supervisionRecords/findList",
        method: "get",
        params,
    });
};
