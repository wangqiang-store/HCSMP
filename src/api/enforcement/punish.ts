// 安监执法/事故查处接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}




//分页获取事故查处列表
export let getIdentifiedPage = (params: pagingParams) => {
    return request({
        url: "/Identified/findByPage",
        method: "get",
        params,
    });
};



//新增事故查处
export let createIdentifiedInfo = (params: object) => {
    return request({
        url: "/Identified/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};



//删除事故查处
export let deleteIdentifiedInfo = (params: { id: number }) => {
    return request({
        url: "/Identified/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑事故查处
export let updateIdentifiedInfo = (params: object) => {
    return request({
        url: "/Identified/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
