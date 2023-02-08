// 应急管理 / 应急领导机构接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}

//分页获取应急领导机构列表
export let getLeaderPage = (params: pagingParams) => {
    return request({
        url: "/Leader/findByPage",
        method: "get",
        params,
    });
};


//新增应急领导机构
export let createLeaderInfo = (params: object) => {
    return request({
        url: "/Leader/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除应急领导机构
export let deleteLeaderInfo = (params: { id: number }) => {
    return request({
        url: "/Leader/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑应急领导机构
export let updateLeaderInfo = (params: object) => {
    return request({
        url: "/Leader/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
