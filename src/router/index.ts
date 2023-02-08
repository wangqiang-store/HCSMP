import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Layout from "../views/layout/index.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Layout",
    component: Layout,
    redirect: "/main",
    meta: { title: "首页" },
    children: [
      {
        path: "/main",
        name: "main",
        meta: { title: "首页" },
        component: () =>
          import(/* webpackChunkName: "main" */ "../views/main/index.vue"),
      },
      {
        path: "/createCompany",
        name: "createCompany",
        meta: { title: "企业信息", parentPath: "/ent/noncoalmine" },
        component: () =>
          import(
            /* webpackChunkName: "createCompany" */ "../views/ent/company/index.vue"
          ),
      },
      {
        path: "/createTrade",
        name: "createTrade",
        meta: { title: "企业信息", parentPath: "/ent/industry" },
        component: () =>
          import(
            /* webpackChunkName: "createTrade" */ "../views/ent/createTrade/index.vue"
          ),
      },
      {
        path: "/companyDetails",
        name: "companyDetails",
        meta: {
          title: "非煤企业详细信息",
          parentPath: "/ent/noncoalmine",
        },
        component: () =>
          import(
            /* webpackChunkName: "companyDetails" */ "../views/ent/companyDetails/index.vue"
          ),
      },
      {
        path: "/tradeDetails",
        name: "tradeDetails",
        meta: {
          title: "工贸企业详细信息",
          parentPath: "/ent/industry",
        },
        component: () =>
          import(
            /* webpackChunkName: "tradeDetails" */ "../views/ent/tradeDetails/index.vue"
          ),
      },
      {
        path: "/fileDetails",
        name: "fileDetails",
        meta: { title: "档案详情", parentPath: "/dep/policy" },
        component: () =>
          import(
            /* webpackChunkName: "fileDetails" */ "../views/dep/policy/fileDetails.vue"
          ),
      },
      {
        path: "/planDetails",
        name: "planDetails",
        meta: { title: "档案详情", parentPath: "/dep/plan" },
        component: () =>
          import(
            /* webpackChunkName: "planDetails" */ "../views/dep/plan/planDetails/index.vue"
          ),
      },
      {
        path: "/supervisionInfo",
        name: "supervisionInfo",
        meta: {
          title: "部门行政监管信息",
          parentPath: "/dep/supervision",
        },
        component: () =>
          import(
            /* webpackChunkName: "supervisionInfo" */ "../views/dep/supervision/supervisionInfo/index.vue"
          ),
      },
      {
        path: "/propagandaInfo",
        name: "propagandaInfo",
        meta: { title: "宣传宣教信息", parentPath: "/mission/propaganda" },
        component: () =>
          import(
            /* webpackChunkName: "propagandaInfo" */ "../views/mission/propaganda/propagandaInfo/index.vue"
          ),
      },
      {
        path: "/trainInfo",
        name: "trainInfo",
        meta: { title: "培训记录信息", parentPath: "/mission/train" },
        component: () =>
          import(
            /* webpackChunkName: "trainInfo" */ "../views/mission/train/trainInfo/index.vue"
          ),
      },
      {
        path: "/checkInfo",
        name: "checkInfo",
        meta: { title: "隐患排查信息", parentPath: "/trouble/check" },
        component: () =>
          import(
            /* webpackChunkName: "checkInfo" */ "../views/trouble/check/checkInfo/index.vue"
          ),
      },
      {
        path: "/checkDetails",
        name: "checkDetails",
        meta: { title: "隐患排查详细信息", parentPath: "/trouble/check" },
        component: () =>
          import(
            /* webpackChunkName: "checkDetails" */ "../views/trouble/check/checkDetails/index.vue"
          ),
      },
      {
        path: "/updateReportInfo",
        name: "updateReportInfo",
        meta: { title: "整改上报信息", parentPath: "/security/updateReport" },
        component: () =>
          import(
            /* webpackChunkName: "updateReportInfo" */ "../views/security/updateReport/updateReportInfo/index.vue"
          ),
      },
      {
        path: "/updateReportDetails",
        name: "updateReportDetails",
        meta: { title: "查看整改记录", parentPath: "/security/updateReport" },
        component: () =>
          import(
            /* webpackChunkName: "updateReportDetails" */ "../views/security/updateReport/updateReportDetails/index.vue"
          ),
      },
      {
        path: "/dailyInfo",
        name: "dailyInfo",
        meta: { title: "日常监督检查信息", parentPath: "/security/daily" },
        component: () =>
          import(
            /* webpackChunkName: "dailyInfo" */ "../views/security/daily/dailyInfo/index.vue"
          ),
      },
      {
        path: "/dailyDetails",
        name: "dailyDetails",
        meta: { title: "查看日常监督检查", parentPath: "/security/daily" },
        component: () =>
          import(
            /* webpackChunkName: "updateReportDetails" */ "../views/security/daily/dailyDetails/index.vue"
          ),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/login/index.vue"),
  },
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
