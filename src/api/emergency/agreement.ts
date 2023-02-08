// 应急管理 / 救护协议接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}



//分页获取救护协议列表
export let getRescuePage = (params: pagingParams) => {
    return request({
        url: "/Rescue/findByPage",
        method: "get",
        params,
    });
};


//新增救护协议
export let createRescueInfo = (params: object) => {
    return request({
        url: "/Rescue/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};



//删除救护协议
export let deleteRescueInfo = (params: { id: number }) => {
    return request({
        url: "/Rescue/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑救护协议
export let updateRescueInfo = (params: object) => {
    return request({
        url: "/Rescue/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
