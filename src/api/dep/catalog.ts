// 全市矿山目录 接口



import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
}


//获取证照齐全企业列表
export let getPageComplete = (params: pagingParams) => {
    return request({
        url: "/mineCatalog/findComplete",
        method: "get",
        params,
    });
};

//获取在建矿山企业列表
export let getPageBuild = (params: pagingParams) => {
    return request({
        url: "/mineCatalog/findBuild",
        method: "get",
        params,
    });
};


//获取证照过期企业列表
export let getPageExpired = (params: pagingParams) => {
    return request({
        url: "/mineCatalog/findExpired",
        method: "get",
        params,
    });
};


//获取已注销企业列表
export let getPageLogout = (params: pagingParams) => {
    return request({
        url: "/mineCatalog/findLogout",
        method: "get",
        params,
    });
};


//获取已关闭企业列表
export let getPageClose = (params: pagingParams) => {
    return request({
        url: "/mineCatalog/findClose",
        method: "get",
        params,
    });
};


//获取X家证今年有效期满(证照齐全企业)
export let getTermOfValidity = (params: object) => {
    return request({
        url: "/mineCatalog/findTermOfValidity",
        method: "get",
        params
    });
};


//获取x家未建(在建矿山企业)
export let getNoBuilt = (params: object) => {
    return request({
        url: "/mineCatalog/findHowManyNoBuilt",
        method: "get",
        params
    });
};