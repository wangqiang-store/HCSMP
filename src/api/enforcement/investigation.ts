// 安监执法/事故调查接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    startTime?: string;
    endTime?: string;

}



//分页获取事故调查列表
export let getAccidentInvestigationPage = (params: pagingParams) => {
    return request({
        url: "/AccidentInvestigation/findByPage",
        method: "get",
        params,
    });
};


//新增事故调查
export let createAccidentInvestigationInfo = (params: object) => {
    return request({
        url: "/AccidentInvestigation/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除事故调查
export let deleteAccidentInvestigationInfo = (params: { id: number }) => {
    return request({
        url: "/AccidentInvestigation/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑事故调查
export let updateAccidentInvestigationInfo = (params: object) => {
    return request({
        url: "/AccidentInvestigation/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
