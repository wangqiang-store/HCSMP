// 安监执法/责任追究落实接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
}




//分页获取责任追究落实列表
export let getAccountabilityPage = (params: pagingParams) => {
    return request({
        url: "/accountability/findByPage",
        method: "get",
        params,
    });
};



//新增责任追究落实
export let createAccountabilityInfo = (params: object) => {
    return request({
        url: "/accountability/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};



//删除责任追究落实
export let deleteAccountabilityInfo = (params: { id: number }) => {
    return request({
        url: "/accountability/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑责任追究落实
export let updateAccountabilityInfo = (params: object) => {
    return request({
        url: "/accountability/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
