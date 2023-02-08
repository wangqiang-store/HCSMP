<template>
  <el-config-provider :locale="locale">
    <router-view v-if="isRouterAlive" />
  </el-config-provider>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  provide,
  reactive,
  toRefs,
} from 'vue';
import { sessionRead } from './api/common/common';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import { useStore } from 'vuex';
export default defineComponent({
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  setup() {
    const STORE = useStore();
    let DATA: any = reactive({
      isRouterAlive: true,
      locale: zhCn,
    });
    let METHODS = reactive({
      reload() {
        DATA.isRouterAlive = false;
        nextTick(() => {
          DATA.isRouterAlive = true;
        });
      },
    });
    provide('reload', METHODS.reload);
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionRead('store')) {
      STORE.replaceState(Object.assign({}, STORE.state, sessionRead('store')));
    }

    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener('beforeunload', () => {
      STORE.commit('SET_ROLES', []);
      sessionStorage.setItem('store', JSON.stringify(STORE.state));
    });
    onMounted(() => {
      localStorage.removeItem('Router');
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>

<style>
</style>
