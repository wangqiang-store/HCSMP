// 政策法规档案

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    type: number;
    yearly?: number;
}



//分页获取政策法规档案列表
export let getPagePolicies = (params: pagingParams) => {
    return request({
        url: "/policies/findByPage",
        method: "get",
        params,
    });
};


//新增政策法规档案
export let createPolicies = (params: object) => {
    return request({
        url: "/policies/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};



//编辑政策法规档案
export let updatePolicies= (params: object) => {
    return request({
        url: "/policies/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};

//删除政策法规档案
export let deletePolicies = (params: {id:number }) => {
    return request({
        url: "/policies/deleteInfo",
        method: "delete",
        params,
    });
};