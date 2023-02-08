import request from "@/utils/request";
import qs from "qs";



//获取工贸企业档案企业详情（新增或更新页面）
export let getByTradeDetails = (params: { companyId: number }) => {
    return request({
        url: "/company/getByTradeDetails",
        method: "get",
        params,
    });
};


// 新增企业基础信息
export let createCompany = (params: object) => {
    return request({
        url: "/company/create",
        method: "post",
        data: params,
    });
};

// 编辑企业基础信息
export let updateCompany = (params: object) => {
    return request({
        url: "/company/update",
        method: "put",
        data: params,
    });
};


// 新增营业执照
export let createBusinessLicense = (params: object) => {
    return request({
        url: "/businessLicense/create",
        method: "post",
        data: qs.stringify(params),
    });
};


// 编辑营业执照
export let updateBusinessLicense = (params: object) => {
    return request({
        url: "/businessLicense/update",
        method: "put",
        data: qs.stringify(params),
    });
};

// 删除营业执照
export let deleteBusinessLicense = (params: {
    companyInfoId: number;
    id: number;
}) => {
    return request({
        url: "/businessLicense/delete",
        method: "delete",
        params,
    });
};






//经营许可证------------------------------------------------------

//添加经营许可证信息
export let createManagementInfo = (params: object) => {
    return request({
        url: "/managementInfo/addInfo",
        method: "post",
        data: qs.stringify(params),
    });
};


//修改经营许可证信息
export let updateManagementInfo = (params: object) => {
    return request({
        url: "/managementInfo/updateInfo",
        method: "put",
        data: params,
    });
};

//获取经营许可证信息
export let getManagementInfo = (params: { companyInfoId: number }) => {
    return request({
        url: "/managementInfo/getInfo",
        method: "get",
        params,
    });
};


//添加证书
export let createAddLicense = (params: object) => {
    return request({
        url: "/managementInfo/addLicense",
        method: "post",
        data: qs.stringify(params),
    });
};

//修改证书
export let updateLicense = (params: object) => {
    return request({
        url: "/managementInfo/updateLicense",
        method: "put",
        data: qs.stringify(params),
    });
};


//删除证书
export let deleteLicense = (params: {
    managementInfoId: number;
    managementLicenseId: number;
}) => {
    return request({
        url: "/managementInfo/delLicense",
        method: "delete",
        params,
    });
};



//------------------------------------------------------------------------

//新增台账信息
export let createLedgerInfo = (params: object) => {
    return request({
        url: "/ledgerInfo/createInfo",
        method: "post",
        data: qs.stringify(params),
    });
};


//修改台账信息
export let updateLedgerInfo = (params: object) => {
    return request({
        url: "/ledgerInfo/updateInfo",
        method: "put",
        data: qs.stringify(params),
    });
};


//删除台账信息
export let deleteLedgerInfo = (params: {
    companyInfoId: number;
    id: number;
}) => {
    return request({
        url: "/ledgerInfo/deleteInfo",
        method: "delete",
        params,
    });
};




//获取字典列表
export let getget = () => {
    return request({
        url: "/dict/getAll",
        method: "get",
    });
};