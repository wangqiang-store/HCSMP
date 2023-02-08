// 日常安全监管／日常监督检查

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    townCode?: number;
    checkType?: number;
    
}



//分页获取日常监督检查记录列表
export let getDailySupervisionPage = (params: pagingParams) => {
    return request({
        url: "/DailySupervision/findByPage",
        method: "get",
        params,
    });
};


//获取日常监督检查详情或编辑
export let getDailySupervisionDetail = (params: { id: number }) => {
    return request({
        url: "/DailySupervision/findByDetail",
        method: "get",
        params,
    });
};


//新增日常监督检查记录
export let createDailySupervision = (params: object) => {
    return request({
        url: "/DailySupervision/createInfo",
        method: "post",
        data: params,
    });
};
//编辑日常监督检查记录
export let updateDailySupervision = (params: object) => {
    return request({
        url: "/DailySupervision/updateInfo",
        method: "put",
        data: params,
    });
};


//删除日常监督检查记录
export let deleteDailySupervision = (params: { id: number }) => {
    return request({
        url: "/DailySupervision/deleteInfo",
        method: "delete",
        params,
    });
};











//执行文书接口-----------------------------------

//新增执法文书
export let createEnforcementDocument = (params: object) => {
    return request({
        url: "/EnforcementDocument/createInfo",
        method: "post",
        data: params,
    });
};


//编辑执法文书
export let updateEnforcementDocument = (params: object) => {
    return request({
        url: "/EnforcementDocument/updateInfo",
        method: "put",
        data: params,
    });
};


//删除执法文书
export let deleteEnforcementDocument = (params: object) => {
    return request({
        url: "/EnforcementDocument/deleteInfo",
        method: "delete",
        params,
    });
};



//删除全部执法文书
export let deleteAllEnforcementDocument = (params: object) => {
    return request({
        url: "/EnforcementDocument/batchDelete",
        method: "delete",
        params,
    });
};


