// 宣教管理 ／ 宣传宣教接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    startTime?:string;
    endTime?:string;
}

// 分页获取行政监管列表
export let getPropagandaPage = (params: pagingParams) => {
    return request({
        url: "/Propaganda/findByPage",
        method: "get",
        params,
    });
};


//新增宣教宣传
export let createPropagandaInfo = (params: object) => {
    return request({
        url: "/Propaganda/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};

//删除宣教宣传
export let deleteCaseSettlementInfo = (params: { id: number }) => {
    return request({
        url: "/Propaganda/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑宣教宣传
export let updatePropagandaInfo = (params: object) => {
    return request({
        url: "/Propaganda/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
