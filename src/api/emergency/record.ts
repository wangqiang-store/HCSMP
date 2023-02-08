// 应急管理 / 应急备案接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}




//分页获取应急备案列表
export let getKeepOnRecordPage = (params: pagingParams) => {
    return request({
        url: "/KeepOnRecord/findByPage",
        method: "get",
        params,
    });
};



//新增应急备案
export let createKeepOnRecordInfo = (params: object) => {
    return request({
        url: "/KeepOnRecord/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除应急备案
export let deleteKeepOnRecordInfo = (params: { id: number }) => {
    return request({
        url: "/KeepOnRecord/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑应急备案
export let updateKeepOnRecordInfo = (params: object) => {
    return request({
        url: "/KeepOnRecord/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
