import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./permission";
// 引入iconfont字体图标
import "@/font/iconfont/iconfont.scss";
// 引入UI库element-plus
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import "@/styles/reset.scss";
import "@/styles/common.scss";
// 引入echarts
import * as echarts from "echarts";
// 引入video.js
import Video from "video.js";
import "videojs-contrib-hls";
import "video.js/dist/video-js.css";
// 引入animejs
import anime from "animejs";
import {
  create,
  NDatePicker
} from 'naive-ui'

const naive = create({
  components: [NDatePicker]
})

const app = createApp(App);
app.config.globalProperties.echarts = echarts;
app.config.globalProperties.$video = Video;
app.config.globalProperties.$anime = anime;

app
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(naive)
  .mount("#app");
