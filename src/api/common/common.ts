import request from "@/utils/request";
import qs from "qs";
export let RES_SUCCESS = 200;

export let IMG_URL = "/file/upload";

export let IMG_File = "";

export let VIDEO_URL = "/file/upload";

// 根据ID查找文件数据
export let findById = (params: { id: number }) => {
  return request({
    url: "/file/findById",
    method: "get",
    params,
  });
};

// localStorage存储数据
export let localWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
};

// localStorage读取数据
export let localRead = (key: string) => {
  let value: string | null = localStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};

// sessionStorage存储数据
export let sessionWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(key, value);
};

// sessionStorage读取数据
export let sessionRead = (key: string) => {
  let value: string | null = sessionStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};

//  根据键获取字典列表
export let getByKey = (params: { key: string }) => {
  return request({
    url: "/dict/getByKey",
    method: "get",
    params,
    timeout: 0,
  });
};

/**
 * @param val 分页回调返回的数量
 * @param pagingParams 分页对象
 * @param pagingParamsCopy 分页对象深拷贝
 * @param handleGetPagingData 获取分页数据请求
 * @param total 数据总数
 */
// 切换分页显示个数
export let sizeChange = (
  val: number,
  pagingParams: any,
  pagingParamsCopy: any,
  handleGetPagingData: any,
  total: number
) => {
  var aggregate = pagingParams.page * pagingParams.limit;
  if (aggregate > total) {
    aggregate = total;
  }
  pagingParamsCopy.limit = val;
  pagingParams.limit = val;
  var size = Math.ceil(aggregate / pagingParams.limit);
  if (size <= 0) {
    pagingParams.page = 1;
    pagingParamsCopy.page = 1;
  } else {
    pagingParams.page = size;
    pagingParamsCopy.page = size;
  }
  handleGetPagingData(pagingParamsCopy);
};

// 切换分页当前页
export let currentChange = (
  val: number,
  pagingParams: any,
  pagingParamsCopy: any,
  handleGetPagingData: any
) => {
  pagingParams.page = val;
  pagingParamsCopy.page = val;
  handleGetPagingData(pagingParamsCopy);
};
