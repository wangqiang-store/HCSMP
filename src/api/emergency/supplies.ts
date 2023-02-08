// 应急管理 / 应急物资配备接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}



//分页获取应急物资配备列表
export let getMaterialPage = (params: pagingParams) => {
    return request({
        url: "/Material/findByPage",
        method: "get",
        params,
    });
};


//新增应急物资配备
export let createMaterialInfo = (params: object) => {
    return request({
        url: "/Material/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除应急物资配备
export let deleteMaterialInfo = (params: { id: number }) => {
    return request({
        url: "/Material/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑应急物资配备
export let updateMaterialInfo = (params: object) => {
    return request({
        url: "/Material/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
