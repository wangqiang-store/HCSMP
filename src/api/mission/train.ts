// 宣教管理 ／ 培训管理接口

import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
    startTime?:string;
    endTime?:string;
}


//分页获取培训管理列表
export let getTrainRecordsPage = (params: pagingParams) => {
    return request({
        url: "/TrainRecords/findByPage",
        method: "get",
        params,
    });
};


//新增培训管理
export let createTrainRecordsInfo = (params: object) => {
    return request({
        url: "/TrainRecords/createInto",
        method: "post",
        data:  qs.stringify(params),
    });
};


//删除培训管理
export let deleteTrainRecordsInfo = (params: { id: number }) => {
    return request({
        url: "/TrainRecords/deleteInfo",
        method: "delete",
        params,
    });
};


//编辑培训管理
export let updateTrainRecordsInfo = (params: object) => {
    return request({
        url: "/TrainRecords/updateInfo",
        method: "put",
        data: qs.stringify(params)
    });
};
