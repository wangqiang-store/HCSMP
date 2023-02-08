import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
    limit: number;
    page: number;
    content?: string;
  }

//  获取人员证照过期列表
export let getStaffExpireByPage = (params: pagingParams) => {
  return request({
    url: "/staffExpire/findByPage",
    method: "get",
    params,
  });
};

//设置人员标注状态
export let setstaffMark = (params: { id: number; value: number }) => {
  return request({
    url: "/staffExpire/setMark",
    method: "put",
    data: qs.stringify(params),
  });
};





//----------------------------------------------------------------------
//获取企业证照到期列表
export let getCompanyExpireByPage = (params: pagingParams) => {
  return request({
    url: "/companyExpire/findByPage",
    method: "get",
    params,
  });
};


//设置企业标注状态
export let setCompanyMark = (params: { id: number; value: number }) => {
  return request({
    url: "/companyExpire/setMark",
    method: "put",
    data: qs.stringify(params),
  });
};



//-------------------------------

//获取英德市的所有镇数据
export let getTown = () => {
  return request({
    url: "/town/getNeedList",
    method: "get"
  });
};