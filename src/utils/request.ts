import axios from "axios";
import store from "../store";
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  removeToken,
  removeRefreshToken,
} from "./auth";
import { refreshToken } from "@/api/system/sysUser";
import { ElMessage } from "element-plus";
// 创建axios实例
// console.log("process.env: ", process.env);
axios.defaults.withCredentials = true;
const service = axios.create({
  baseURL: process.env.BASE_URL, // api 的 base_url
  timeout: 5000 * 6, // 请求超时时间
});
// 拦截请求白名单
let whiteListUrls = [
  "/sysUser/checkRepeat",
  "/dict/getByKey",
  "/RealTimeMonitor/yunTaiOperation",
  "/province/get",
  "/city/get",
  "/county/get",
  "/town/get",
  "/gateway/findByCompany",
  "/sensorDevice/findByCompany",
  "/personnel/getEnableBound",
  "/company/findAll",
  "/simulation/findByDevice",
  "/sensorData/findByCompany",
  "/sensorDevice/findByPressure",
  "/sensorDevice/findByPosition",
  "/departSupervision/findByPage",
];

// 刷新状态
let refreshState = false;

// 重新请求列表
let afreshList: Array<any> = [];

// 401拦截白名单
let whiteList401Urls = ["/company/getDataIntegrity", "/sysUser/refreshToken"];

// 正在进行中的请求列表
let reqList: any[] = [];

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function(
  reqList: any,
  url: string,
  cancel: any,
  errorMessage?: string
) {
  const errorMsg = errorMessage || "";
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !whiteListUrls.includes(url)) {
      console.log("拦截", url);

      cancel(errorMsg);
      return;
    }
  }
  reqList.push(url);
};

/**
 * 允许某个请求可以继续进行
 * @param {array} reqList 全部请求列表
 * @param {string} url 请求地址
 */
const allowRequest = function(reqList: any, url: string) {
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !whiteListUrls.includes(url)) {
      reqList.splice(i, 1);
      break;
    }
  }
};

// request拦截器
service.interceptors.request.use(
  (config) => {
    if (store.getters.token && getRefreshToken()) {
      config.headers["Authorization"] =
        config.url !== "/sysUser/refreshToken" ? getToken() : getRefreshToken(); // 让每个请求携带自定义token 请根据实际情况自行修改 Accept
    }
    let cancel;
    // 设置cancelToken对象
    config.cancelToken = new axios.CancelToken(function(c) {
      cancel = c;
    });
    // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    stopRepeatRequest(reqList, config.url as string, cancel);
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  async (response) => {
    let { config, data } = response;
    let time = setTimeout(() => {
      allowRequest(reqList, config.url as string);
      clearTimeout(time);
    }, 200);
    if (data.code === 401 && !whiteList401Urls.includes(config.url as string)) {
      if (!refreshState) {
        refreshState = true;
        return refreshToken({ refreshToken: getRefreshToken() })
          .then((res) => {
            const { accessToken, refreshToken, expirationTime } = res.data.data;
            setToken(accessToken);
            setRefreshToken(refreshToken);
            store.commit("SET_TOKEN", accessToken);
            // 保存刷新认证令牌
            localStorage.setItem("ExpirationTime", expirationTime);
            config.headers.Authorization = accessToken;
            // token 刷新后将数组的方法重新执行
            afreshList.forEach((cb) => cb(accessToken));
            afreshList = []; // 重新请求完清空
            return service(config);
          })
          .catch((err) => {
            ElMessage.warning("抱歉，您的登录状态已失效，请重新登录");
            removeToken();
            removeRefreshToken();
            localStorage.removeItem("ExpirationTime");
            window.location.href = "/";
            return Promise.reject(err);
          })
          .finally(() => {
            refreshState = false;
          });
      } else {
        // 返回未执行 resolve 的 Promise
        return new Promise((resolve) => {
          // 用函数形式将 resolve 存入，等待刷新后再执行
          afreshList.push((token: string) => {
            config.headers.Authorization = token;
            resolve(service(config));
          });
        });
      }
    }

    if (data.code === 500 && !whiteListUrls.includes(config.url as string)) {
      ElMessage({
        message:
          data.msg.indexOf(":") !== -1 ? data.msg.split(":")[1] : data.msg,
        type: "error",
      });
      console.log(data.msg);
    }
    return response;
  },
  (error) => {
    // console.log("axios.isCancel(error);: ", axios.isCancel(error));
    console.log("err" + error); // for debug
    let errorMsg =
      error.message.indexOf("timeout") !== -1 ? "请求超时" : error.message;
    if (error.message) {
      ElMessage({
        message: errorMsg,
        type: "error",
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);
export default service;
