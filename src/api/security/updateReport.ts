// 整改上报管理

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    isRectification: boolean;
    townCode: number;
    content?: string;
}



//分页获取整改上报记录列表
export let getRectificationReportPage = (params: pagingParams) => {
    return request({
        url: "/RectificationReport/findByPage",
        method: "get",
        params,
    });
};


//获取整改上报详情或编辑
export let getRectificationReportDetail = (params: { id: number }) => {
    return request({
        url: "/RectificationReport/findByDetail",
        method: "get",
        params,
    });
};



//新增整改上报记录
export let createRectificationReport = (params: object) => {
    return request({
        url: "/RectificationReport/createInfo",
        method: "post",
        data: params,
    });
};



//编辑整改上报记录
export let updateRectificationReport = (params: object) => {
    return request({
        url: "/RectificationReport/updateInfo",
        method: "put",
        data: params,
    });
};


//修改整改上报整改状态
export let updateRectificationReportStatus= (params: object) => {
    return request({
        url: "/RectificationReport/rectificationStatus",
        method: "put",
        params,
    });
};


//删除整改上报记录
export let deleteRectificationReport = (params: { id: number }) => {
    return request({
        url: "/RectificationReport/deleteInfo",
        method: "delete",
        params,
    });
};
