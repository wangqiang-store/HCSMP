import { createStore } from "vuex";
import user from "./modules/user";
import globalData from "./modules/globalData";
import getters from "./getters";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    user,
    globalData,
  },
  getters,
});
