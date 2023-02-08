// 整改上报管理

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    townCode: number;
    content?: string;
    treatmentMeasures?: number;

}



//分页获取隐患排查记录列表
export let getDangerCheckPage = (params: pagingParams) => {
    return request({
        url: "/DangerCheck/findByPage",
        method: "get",
        params,
    });
};


//新增隐患排查记录
export let createDangerCheckInfo = (params: object) => {
    return request({
        url: "/DangerCheck/createInfo",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除隐患排查记录
export let deleteDangerCheckInfo = (params: { id: number }) => {
    return request({
        url: "/DangerCheck/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑隐患排查记录
export let updateDangerCheckInfo = (params: object) => {
    return request({
        url: "/DangerCheck/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};


//修改隐患排查整改状态
export let updateDangerCheckStatus = (params: object) => {
    return request({
        url: "/DangerCheck/rectificationStatus",
        method: "put",
        params,
    });
};







//隐患统计接口----------------------------------------------------

//获取单位列表
export let getDangerCensusDepartment = (params: object) => {
    return request({
        url: "/DangerCensus/findByDepartment",
        method: "get",
        params,
    });
};

//获取区域列表
export let getDangerCensusRegion = (params: object) => {
    return request({
        url: "/DangerCensus/findByRegion",
        method: "get",
        params,
    });
};