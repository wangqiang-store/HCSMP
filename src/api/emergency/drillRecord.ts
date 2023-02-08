// 应急管理 / 应急演练接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}


//分页获取应急演练列表
export let getEmergencyDrillPage = (params: pagingParams) => {
    return request({
        url: "/emergencyDrill/findByPage",
        method: "get",
        params,
    });
};


//新增应急演练信息
export let createEmergencyDrillInfo = (params: object) => {
    return request({
        url: "/emergencyDrill/createInfo",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除应急演练信息
export let deleteEmergencyDrillInfo = (params: { id: number }) => {
    return request({
        url: "/emergencyDrill/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑应急演练信息
export let updateEmergencyDrillInfo = (params: object) => {
    return request({
        url: "/emergencyDrill/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
