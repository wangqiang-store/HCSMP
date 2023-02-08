import Layout from "@/views/layout/index.vue";
let title = "";
let twoTitle = "";
// 生成动态路由
export function generaMenu(routers: any, data: any, isTitle: boolean = false) {
  data.forEach((item: any) => {
    if (item.component != null && item.href != null) {
      if (!isTitle) {
        title = item.name;
      } else {
        twoTitle = item.name;
      }
      const menu = {
        path: item.href,
        name: (item.href as string).includes("/")
          ? item.href.replace("/", "")
          : item.href,
        component:
          item.component == "Layout"
            ? Layout
            : () => import("@/views" + item.component + "/index.vue"),
        children: [],
        meta: {
          title,
          id: item.id,
          icon: item.icon,
          twoTitle,
          children: item.type === 1 ? item.children ?? [] : [],
        },
      };
      if (
        item.children !== null &&
        item.children.length > 0 &&
        item.children[0].href
      ) {
        generaMenu(menu.children, item.children, true);
      }
      routers.push(menu);
    }
  });
  return routers;
}
