import request from "@/utils/request";

//  汇总统计-工贸企业风险等级占比图
export let automobileEnterpriseRisk = () => {
  return request({
    url: "/Summary/automobileEnterpriseRisk",
    method: "get",
  });
};

// 汇总统计-非煤矿山企业风险等级占比图
export let nonMediaEnterpriseRisk = () => {
  return request({
    url: "/Summary/nonMediaEnterpriseRisk",
    method: "get",
  });
};

//  汇总统计-非煤矿山企业矿产类型组成情况 And 非煤企业矿产类型占比图
export let nonMediaOfMineralType = () => {
  return request({
    url: "/Summary/nonMediaOfMineralType",
    method: "get",
  });
};

//  汇总统计-地区企业数量统计图
export let statisticsOfRegional = () => {
  return request({
    url: "/Summary/statisticsOfRegional",
    method: "get",
  });
};
