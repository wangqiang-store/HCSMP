import { getToken, setToken, removeToken, setRefreshToken } from "@/utils/auth";
import router, { routes } from "@/router";
import { generaMenu } from "@/api/common/route";
import { signIn, getInfo } from "@/api/system/sysUser";
import { getSide } from "@/api/system/sysModule";
import { ElMessage } from "element-plus";
import { twoLogin } from "@/api/system/sysUser";
const user: any = {
  state: {
    BindingState: "", // 绑定状态
    token: getToken(),
    name: "",
    username: "",
    avatar: "",
    roles: [], //角色
    routers: [],
    addRouters: [],
    roleId: "", //角色id
    userId: "", //用户id
    routerModule: [], //路由模块
    allModule: [], //所有模块
    users: [], //所有用户
    personnel: {}, //关联人员信息
  },
  mutations: {
    // 修改绑定状态
    setBindingState: (state: any, data: string) => {
      state.BindingState = data;
    },
    SET_TOKEN: (state: any, token: any) => {
      state.token = token;
    },
    SET_NAME: (state: any, name: any) => {
      state.name = name;
    },
    SET_USERNAME: (state: any, name: any) => {
      state.username = name;
    },
    SET_ROLEID: (state: any, id: any) => {
      state.roleId = id;
    },
    SET_USERID: (state: any, id: any) => {
      state.userId = id;
    },
    SET_ROLES: (state: any, roles: any) => {
      state.roles = roles;
    },
    SET_ROUTER: (state: any, routers: any) => {
      state.addRouters = routers;
      state.routers = routes.concat(routers);
      router.options.routes = state.routers;
      for (let item of routers) {
        router.addRoute(item);
      }
      //   router.addRoute({
      //     path: "/:pathMatch(.*)", // :pathMatch(.*)  :catchAll(.*)
      //     name: "notFound",
      //     component: () => import("@/views/notFound.vue"),
      //   });
    },
    CLEAR_ROUTER: (state: any, routers: any) => {
      router.options.routes = routers;
    },
    SET_ROUTERMODULES: (state: any, modules: any) => {
      state.routerModule = modules;
    },
    SET_MODULE: (state: any, modules: any) => {
      state.allModule = modules;
    },
    SET_USERS: (state: any, users: any) => {
      state.users = users;
    },
    SET_Personnel: (state: any, data: any) => {
      state.personnel = data;
    },
  },
  actions: {
    // 登录
    Login({ commit }: any, userInfo: any) {
      commit("SET_ROLES", [], { root: true });
      const username = userInfo.username.trim();
      return new Promise((resolve, reject) => {
        signIn({ username, password: userInfo.password })
          .then((response) => {
            const data = response.data;
            if (data.code === 200) {
              // 保存认证令牌
              setToken(data.data.accessToken);
              commit("SET_TOKEN", data.data.accessToken);
              // 保存刷新认证令牌
              setRefreshToken(data.data.refreshToken);
              localStorage.setItem("ExpirationTime", data.data.expirationTime);
            }
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit }: any) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((response) => {
            const data = response.data;
            // if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            //   commit('SET_ROLES', data.roles)
            // } else {
            //   reject('getInfo: roles must be a non-null array !')
            // }
            commit("SET_NAME", data.data?.name);
            commit("SET_USERNAME", data.data?.username);
            commit("SET_ROLEID", data.data?.roleId);
            commit("SET_USERID", data.data?.id);
            commit("SET_Personnel", data.data?.personnel);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    GenerateRoutes({ commit, state }: any) {
      return new Promise<void>((resolve, reject) => {
        if (localStorage.getItem("Router") == null) {
          getSide()
            .then((response) => {
              const data = response.data.data;
              // if (data.length == 0) {
              //   // alert('此账号关联权限出错,请联系管理员')
              //   ElMessage({
              //     message: "此账号关联权限出错,请联系管理员",
              //     type: "warning",
              //   });
              //   // removeToken();
              //   commit("SET_ROUTER", []);
              //   resolve();
              // } else {
              commit("SET_ROUTERMODULES", data);
              let routers: Array<any> = [];
              generaMenu(routers, data);
              commit("SET_ROUTER", routers);
              localStorage.setItem("Router", JSON.stringify(routers));
              resolve();
              // }
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          commit(
            "SET_ROUTER",
            JSON.parse(localStorage.getItem("Router") || "{}")
          );
          resolve();
        }
      });
    },

    // 二次验证登录
    TwoLogin({ commit }: any, obj: any) {
      return new Promise((resolve, reject) => {
        twoLogin(obj)
          .then((res) => {
            if (res.data.code == 200) {
              setToken(res.data.data.accessToken);
              setRefreshToken(res.data.data.refreshToken);
              localStorage.setItem(
                "ExpirationTime",
                res.data.data.expirationTime
              );
              commit("SET_TOKEN", res.data.data.accessToken);
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 前端 登出
    FedLogOut({ commit, state }: any) {
      return new Promise<void>((resolve) => {
        commit("SET_TOKEN", "");
        commit("CLEAR_ROUTER", "");
        // removeToken();
        // removeRefreshToken();
        localStorage.clear();
        sessionStorage.clear();
        // history.go(0);
        resolve();
      });
    },
  },
};

export default user;
