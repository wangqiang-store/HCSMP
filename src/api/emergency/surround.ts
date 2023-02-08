// 应急管理 / 周边基础数据接口

import request from "@/utils/request";
import qs from "qs";


// 企业周边查询接口

//周边信息管理接口 ---------------------------------------------------------
interface pagingParams2 {
    limit: number;
    page: number;
    content?: string;
    typeId?: number;
}

//分页获取周边信息列表
export let getAroundInformationPage = (params: pagingParams2) => {
    return request({
        url: "/AroundInformation/findByPage",
        method: "get",
        params,
    });
};

//获取该企业周边信息列表
export let getAroundInformationByCompany = (params: object) => {
    return request({
        url: "/AroundInformation/findAllAroundInfo",
        method: "get",
        params,
    });
};

//新增周边信息
export let createAroundInformationInfo = (params: object) => {
    return request({
        url: "/AroundInformation/createInto",
        method: "post",
        data: qs.stringify(params),
    });
};

//删除周边信息
export let deleteAroundInformationInfo = (params: { id: number }) => {
    return request({
        url: "/AroundInformation/deleteInfo",
        method: "delete",
        params,
    });
};

//编辑周边信息
export let updateAroundInformationInfo = (params: object) => {
    return request({
        url: "/AroundInformation/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};




//周边类型接口 ---------------------------------------------------------------
interface pagingParams3 {
    limit: number;
    page: number;
    content?: string;
}

//获取所有的周边类型列表
export let getAllPeripheralType = () => {
    return request({
        url: "/PeripheralType/findAllType",
        method: "get",
    });
};


//分页获取周边类型列表
export let getPeripheralTypePage = (params: pagingParams3) => {
    return request({
        url: "/PeripheralType/findByPage",
        method: "get",
        params,
    });
};


//新增周边类型
export let createPeripheralTypeInfo = (params: object) => {
    return request({
        url: "/PeripheralType/createInto",
        method: "post",
        data: qs.stringify(params),
    });
};


//删除周边类型
export let deletePeripheralTypeInfo = (params: { id: number }) => {
    return request({
        url: "/PeripheralType/deleteInfo",
        method: "delete",
        params,
    });
};

//编辑周边类型
export let updatePeripheralTypeInfo = (params: object) => {
    return request({
        url: "/PeripheralType/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
