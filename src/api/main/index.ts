import request from "@/utils/request";

// 获取全部启用的企业档案企业列表
export let getHomePage = (params: {
  content?: string;
  level?: number;
  type?: number;
}) => {
  return request({
    url: "/homePage/getHomePage",
    method: "get",
    params,
  });
};

//  获取全部未完成整改企业列表
export let getIncomplete = () => {
  return request({
    url: "/homePage/getIncomplete",
    method: "get",
  });
};

//  获取全部证照到期企业列表
export let getLicenseExpiration = () => {
  return request({
    url: "/homePage/getLicenseExpiration",
    method: "get",
  });
};

//  获取全部证照到期企业列表(去重)
export let getRemovalLicenseExpiration = () => {
  return request({
    url: "/homePage/getRemovalLicenseExpiration",
    method: "get",
  });
};
