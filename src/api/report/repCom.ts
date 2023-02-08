import request from "@/utils/request";

// 获取企业综合分析数据- 安全人员组成情况
export let securityPersonnelConstitute = (params: { companyId: number }) => {
  return request({
    url: "/PersonnelComposition/comprehensive",
    method: "get",
    params,
  });
};

//  获取企业综合分析数据- 系统录入 岗位组成情况
export let systemEntryConstitute = (params: { companyId: number }) => {
  return request({
    url: "/PersonnelComposition/systemEntry",
    method: "get",
    params,
  });
};
