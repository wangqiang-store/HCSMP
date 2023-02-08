// 安监执法/结案处理接口

import request from "@/utils/request";
import qs from "qs";



//获取执法统计分析图表数据
export let getCaseSettlement = (params: object) => {
    return request({
        url: "/Statistics/findStatistics",
        method: "get",
        params,
    });
};