// 年度文件 和 年度监督检查计划

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    yearly?: number;
}

//获取年度文件列表
export let getYearFilePage = (params: pagingParams) => {
    return request({
        url: "/YearFile/findByPage",
        method: "get",
        params,
    });
};

//新增年度文件
export let createYearFile = (params: object) => {
    return request({
        url: "/YearFile/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};

//删除年度文件
export let deleteYearFile = (params: {id:number }) => {
    return request({
        url: "/YearFile/deleteInfo",
        method: "delete",
        params,
    });
};

//编辑年度文件
export let updateYearFile= (params: object) => {
    return request({
        url: "/YearFile/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};






//年度监督检查计划接口-------------------------------------

//获取年度监督检查记录列表
export let getYearSupervisePage = (params: pagingParams) => {
    return request({
        url: "/YearSupervise/findByPage",
        method: "get",
        params,
    });
};

//获取月份监督检查记录列表
export let getYearSuperviseMonth = (params: object) => {
    return request({
        url: "/YearSupervise/findByYearly",
        method: "get",
        params,
    });
};

//新增年度监督检查记录
export let createYearSupervise = (params: object) => {
    return request({
        url: "/YearSupervise/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};

//编辑年度监督检查记录
export let updateYearSupervise= (params: object) => {
    return request({
        url: "/YearSupervise/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};


//删除年度监督检查记录
export let deleteYearSupervise = (params: {id:number }) => {
    return request({
        url: "/YearSupervise/deleteInfo",
        method: "delete",
        params,
    });
};