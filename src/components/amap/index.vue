<template>
  <div :id="AmapId">
    <!-- 搜索框 -->
    <input
      v-show="showSearch"
      type="text"
      id="tipinput"
      :placeholder="placeholder"
      value=""
    />
    <div class="tip-box" id="searchTip"></div>
  </div>
</template>
<script>
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  props: {
    AmapId: {
      type: String,
      default: "",
    },
    // 控制显示搜索条
    isShowSearch: {
      type: Boolean,
      default: false,
    },
    //搜索框提示词
    placeholder: {
      type: String,
      default: "",
    },
    // 纬度
    latitude: {
      type: Number,
    },
    // 经度
    longitude: {
      type: Number,
    },
    // 树状层级 控制缩放
    marking: {
      type: Number,
      default: 1,
    },
    // 企业列表 地图展示企业
    companyList: {
      type: Array,
      default: [],
    },
    // 区分地图企业不同类型显示
    viewType: {
      type: String,
      default: "",
    },
    // 区分模块 展示不同地图
    module: {
      type: String,
      default: "",
    },
    // 地区名 切换行政区域
    regionName: {
      type: String,
      default: "",
    },
    // 爆炸数据  显示爆炸范围
    blastData: {
      type: Array,
      default: [],
    },
    // 中毒数据  显示中毒范围
    toxicosisData: {
      type: Array,
      default: [],
    },
  },
  emits: ["getlnglat", "handleClickMarker", "getForecast", "handlePlay"],
  setup(props, { emit }) {
    const STORE = useStore();
    const ROUTER = useRouter();
    // 全局地图实例
    var map;
    // 地图唯一标注
    var marker;
    // 地理编码器 实例
    var Geocoder;
    // 地址
    var address;
    // 城市
    let city;
    // 信息窗口实例
    var infoWindow;
    // po搜素实例
    let poiPickers;
    // 搜索内容
    let center;
    // 设置 地图中心 切换行政区域
    let districtSearch;
    // 标注带圆 实例
    let markerList;
    // 地图上 marker
    let markerLists = [];
    let showSearch = ref(false);
    let tipinput = ref(null);
    let isShowInfoWindows2 = ref(false); // 首页两个信息窗体的控制
    let infoWindows2 = [];
    let DATA = reactive({
      lng: "",
      lat: "",
    });
    let filterCompanyType = (type) => {
      let companyType = "";
      switch (type) {
        case 1:
          companyType = "地下矿山企业";
          break;
        case 2:
          companyType = "露天矿山企业";
          break;
        case 4:
          companyType = "工贸行业企业";
          break;
        default:
          break;
      }
      return companyType;
    };

    // 经纬度转换成三角函数中度分表形式。
    function rad(d) {
      return (d * Math.PI) / 180.0;
    }

    // 根据经纬度计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
    function getDistance(lat1, lng1, lat2, lng2) {
      var radLat1 = rad(lat1);
      var radLat2 = rad(lat2);
      var a = radLat1 - radLat2;
      var b = rad(lng1) - rad(lng2);
      var s =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(a / 2), 2) +
              Math.cos(radLat1) *
                Math.cos(radLat2) *
                Math.pow(Math.sin(b / 2), 2)
          )
        );
      s = s * 6378.137; // EARTH_RADIUS;
      s = Math.round(s * 10000) / 10000; //输出为公里

      var distance = s;
      var distance_str = "";

      if (parseInt(distance) >= 1) {
        distance_str = distance.toFixed(1) + "km";
      } else {
        distance_str = distance * 1000 + "m";
      }

      //s=s.toFixed(4);

      return s;
    }

    let initAmap = () => {
      AMapLoader.load({
        key: "e4c77265ff45bdf58b359dbe94b5f474", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "1.4.15", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.Scale"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        AMapUI: {
          // 是否加载 AMapUI，缺省不加载
          version: "1.1", // AMapUI 缺省 1.1
          plugins: [
            "overlay/SimpleMarker", //SimpleMarker
            "overlay/SimpleInfoWindow", //SimpleInfoWindow
            "misc/PoiPicker",
            "control/BasicControl",
            "misc/MarkerList",
            "geo/DistrictExplorer",
          ], // 需要加载的 AMapUI ui插件
        },
        Loca: {
          // 是否加载 Loca， 缺省不加载
          version: "1.3.2", // Loca 版本，缺省 1.3.2
        },
      })
        .then(async (AMap) => {
          // 图层切换控件
          var layerCtrl1 = new AMapUI.BasicControl.LayerSwitcher({
            position: "tr",
          });

          // var imageLayer = new AMap.ImageLayer({
          //   url: 'http://amappc.cn-hangzhou.oss-pub.aliyun-inc.com/lbs/static/img/dongwuyuan.jpg',
          //   bounds: new AMap.Bounds(
          //     [113.401958, 24.207083],
          //     [116.342659, 39.946275]
          //   ),
          //   zooms: [10, 18],
          // });

          map = new AMap.Map(props.AmapId, {
            zoom: 11, //级别
            // center: [116.397428, 39.90923], //中心点坐标
            // center: [113.401958, 24.207083], //中心点坐标
            // viewMode: '3D', //使用3D视图
            layers: layerCtrl1.getEnabledLayers(),
            // layers: [
            //   new AMap.TileLayer(),
            //   imageLayer
            // ],
            resizeEnable: true, //是否监控地图容器尺寸变化
          });

          AMap.plugin(
            ["AMap.Geocoder", "AMap.DistrictSearch", "AMap.Weather"],
            function () {
              //异步加载插件
              Geocoder = new AMap.Geocoder({
                city: "010", //城市设为北京，默认：“全国”
                radius: 1000, //范围，默认：500
                viewMode: "3D", //使用3D视图
              });
              map.addControl(Geocoder);
              // var toolbar = new AMap.ToolBar();
              // map.addControl(toolbar);

              districtSearch = new AMap.DistrictSearch({
                // 关键字对应的行政区级别，country表示国家
                // level: 'country',
                //  显示下级行政区级数，1表示返回下一级行政区
                subdistrict: 1, //返回下一级行政区
                showbiz: false, //最后一级返回街道信息
              });

              // 搜索所有省/直辖市信息
              districtSearch.search("英德市", function (status, result) {
                // 查询成功时，result即为对应的行政区信息
                let { districtList } = result;
                if (status === "complete") {
                  map.setCenter([
                    districtList[0].center.lng,
                    districtList[0].center.lat,
                  ]); //设置地图中心点
                }
              });

              //创建天气查询实例
              var weather = new AMap.Weather();

              //执行实时天气信息查询
              weather.getForecast("英德市", function (err, data) {
                emit("getForecast", data);
              });
            }
          );

          // 显示标注
          function drawMaeker(lng, lat) {
            marker = new AMapUI.SimpleMarker({
              iconLabel: {
                style: {
                  color: "red",
                },
              },
              //自定义图标节点(img)的属性
              //webapi.amap.com/theme/v1.3/markers/b/mark_b.png
              iconStyle: {
                src: "//webapi.amap.com/theme/v1.3/markers/b/mark_r.png",
                style: {
                  width: "20px",
                  height: "30px",
                },
              },

              //设置基点偏移
              offset: new AMap.Pixel(-10, -30),

              map: map,
              position: [lng, lat],
              showPositionPoint: true,
              zIndex: 9999999,
            });
            // DATA.map.add(DATA.marker);
            if (marker) {
              marker.on("click", (e) => {
                switch (props.module) {
                  case "companyInfo":
                    infoWindow.open(map, marker.getPosition());
                    break;

                  default:
                    break;
                }
              });
            }
          }

          // 显示信息窗口
          function drawInfoWindow() {
            infoWindow = new AMapUI.SimpleInfoWindow({
              //模板, underscore
              infoTitle: "<strong><%= img %><%- title %></strong>",
              infoBody:
                '<p class="my-desc">' +
                //<%= 原值插入 ..
                // "<%= img %>" +
                //<%- html编码后插入
                // "<%- body %>"
                "<%= body %>" +
                "</p>",
              //模板数据
              // <p>是否选择该地点作为地图标示点？</p>
              infoTplData: {
                title: "提示",
                img: '<img src="//webapi.amap.com/theme/v1.3/autonavi.png" />',
                body: `
                  <div>
                    <p>坐标:(${DATA.lng},${DATA.lat})</p>
                    <p>地址:${address}</p>
                  </div>
                `,
              },

              //基点指向marker的头部位置
              offset: new AMap.Pixel(0, -31),
            });
          }

          // 地理编码
          function regeoCode(lnglat) {
            Geocoder.getAddress(lnglat, function (status, result) {
              if (status === "complete" && result.regeocode) {
                address = result.regeocode.formattedAddress;
                city = result.regeocode.addressComponent.city;
                drawInfoWindow();
                // infoWindow.open(map, lnglat);
              } else {
                console.error("根据经纬度查询地址失败");
              }
            });
          }

          // 定位
          function getLocation() {
            const location = {
              initMap(id) {
                let geolocation;
                map.plugin(["AMap.Geolocation"], function () {
                  geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true, //  是否使用高精度定位，默认:true
                    timeout: 10000, //  超过10秒后停止定位，默认：无穷大
                    maximumAge: 0, // 定位结果缓存0毫秒，默认：0
                    convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: true, //  显示定位按钮，默认：true
                    buttonPosition: "LB", // 定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20), //  定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true, //  定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true, //  定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true, //  定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy: true, //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                  });
                  //创建天气查询实例
                  map.addControl(geolocation);
                  geolocation.getCurrentPosition();
                  //执行实时天气信息查询
                });
                return geolocation;
              },
            };
            let geolocation = location.initMap(); //定位
            AMap.event.addListener(geolocation, "complete", (result) => {
              if (infoWindow) {
                infoWindow.close();
              }
              if (props.latitude && props.longitude) {
                regeoCode([props.longitude, props.latitude]);
                drawMaeker(props.longitude, props.latitude);
                DATA.lng = props.longitude;
                DATA.lat = props.latitude;
              } else {
                // regeoCode([result.position.lng, result.position.lat]);
                // drawMaeker(result.position.lng, result.position.lat);
                // DATA.lng = result.position.lng;
                // DATA.lat = result.position.lat;
                regeoCode([113.401958, 24.207083]);
                drawMaeker(113.401958, 24.207083);
                DATA.lng = 113.401958;
                DATA.lat = 24.207083;
              }

              // emit("getlnglat", { lng: result.position.lng, lat: result.position.lat })
            });
          }

          // 搜索
          function initSearch() {
            // let amapManager = new AMapManager();
            // let map = amapManager.getMap();
            var poiPicker = new AMapUI.PoiPicker({
              input: "tipinput", //输入框id
              placeSearchOptions: {
                map: map,
                pageSize: 10,
              }, //地点搜索配置
              suggestContainer: "searchTip", //输入提示显示DOM
              searchResultsContainer: "searchTip", //搜索结果显示DOM
            });
            poiPickers = poiPicker;
            //监听poi选中信息
            if (tipinput.value.value != "") {
              poiPickers.searchByKeyword(tipinput.value.value);
            }
            poiPicker.on("poiPicked", function (poiResult) {
              let source = poiResult.source;
              let poi = poiResult.item;
              if (source !== "search") {
                poiPicker.searchByKeyword(poi.name);
              } else {
                poiPicker.clearSearchResults();
                center = [
                  poiResult.item.location.lng,
                  poiResult.item.location.lat,
                ];
                address = poi.name;
                // vm.searchKey = "";
              }
            });
          }

          // 点击marker 显示信息窗口
          async function showInfoClick(e) {
            switch (props.module) {
              case "companyInfo":
                infoWindow && infoWindow.close();
                if (marker) {
                  map.remove(marker);
                  map.setFitView();
                }
                await regeoCode([e.lnglat.lng, e.lnglat.lat]);
                drawMaeker(e.lnglat.lng, e.lnglat.lat);
                break;

              default:
                break;
            }
            DATA.lng = e.lnglat.lng;
            DATA.lat = e.lnglat.lat;
            emit("getlnglat", { lng: e.lnglat.lng, lat: e.lnglat.lat });
          }

          // 绘制行政区域
          function drawDistrict() {
            var colors = [
              "#3366cc",
              "#dc3912",
              "#ff9900",
              "#109618",
              "#990099",
              "#0099c6",
              "#dd4477",
              "#66aa00",
              "#b82e2e",
              "#316395",
              "#994499",
              "#22aa99",
              "#aaaa11",
              "#6633cc",
              "#e67300",
              "#8b0707",
              "#651067",
              "#329262",
              "#5574a6",
              "#3b3eac",
            ];
            //创建一个实例
            var districtExplorer = new AMapUI.DistrictExplorer({
              map: map,
            });

            function renderAreaNode(areaNode) {
              //绘制子区域
              districtExplorer.renderSubFeatures(
                areaNode,
                function (feature, i) {
                  var fillColor = colors[i % colors.length];
                  var strokeColor =
                    colors[colors.length - 1 - (i % colors.length)];

                  return {
                    cursor: "default",
                    bubble: true,
                    strokeColor: strokeColor, //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 1, //线宽
                    fillColor: fillColor, //填充色
                    fillOpacity: 0.35, //填充透明度
                  };
                }
              );

              //绘制父区域
              districtExplorer.renderParentFeature(areaNode, {
                cursor: "default",
                bubble: true,
                strokeColor: "black", //线颜色
                strokeOpacity: 1, //线透明度
                strokeWeight: 1, //线宽
                fillColor: "#61afef", //填充色
                fillOpacity: 0.35, //填充透明度
              });
            }

            var adcodes = [441881];
            // var adcodes = [441800];

            districtExplorer.loadMultiAreaNodes(
              adcodes,
              function (error, areaNodes) {
                //清除已有的绘制内容
                districtExplorer.clearFeaturePolygons();

                for (var i = 0, len = areaNodes.length; i < len; i++) {
                  renderAreaNode(areaNodes[i]);
                }

                //更新地图视野
                map.setFitView(districtExplorer.getAllFeaturePolygons());
              }
            );
          }

          // marker带圆
          function markerCircle() {
            markerList = new AMapUI.MarkerList({
              //关联的map对象
              map: map,

              //列表的dom容器的id
              // listContainer: 'my-list',

              //返回数据项的Id
              getDataId: function (dataItem, index) {
                //index表示该数据项在数组中的索引位置，从0开始，如果确实没有id，可以返回index代替
                return dataItem.id;
              },
              //返回数据项的位置信息，需要是AMap.LngLat实例，或者是经纬度数组，比如[116.789806, 39.904989]
              getPosition: function (dataItem) {
                return dataItem.position;
              },
              // 这里不需要InfoWindow
              getInfoWindow: null,
              //返回数据项对应的Marker
              getMarker: function (dataItem, context, recycledMarker) {
                //marker的标注内容
                // var content = dataItem.id + ': ' + dataItem.desc;

                var label = {
                  offset: new AMap.Pixel(16, 18), //修改label相对于marker的位置
                  // content: content
                };

                //存在可回收利用的marker
                if (recycledMarker) {
                  //直接更新内容返回
                  recycledMarker.setLabel(label);
                  return recycledMarker;
                }

                //返回一个新的Marker
                return new AMap.Marker({
                  label: label,
                });
              },
              //返回数据项对应的列表节点
              getListElement: function (
                dataItem,
                context,
                recycledListElement
              ) {
                var tpl = "<p><%- dataItem.id %>：<%- dataItem.desc %><br/>";

                var content = MarkerList.utils.template(tpl, {
                  dataItem: dataItem,
                  dataIndex: context.index,
                });

                if (recycledListElement) {
                  //存在可回收利用的listElement, 直接更新内容返回
                  recycledListElement.innerHTML = content;
                  return recycledListElement;
                }

                //返回一段html，MarkerList将利用此html构建一个新的dom节点
                return "<li>" + content + "</li>";
              },
            });

            //监听marker在Map的添加和删除
            markerList.on(
              "markerAddToMap markerRemoveFromMap",
              function (event, record) {
                var marker = record.marker,
                  dataItem = record.data;

                if (!marker._circle) {
                  //创建一个新的circle，附加在Marker上
                  marker._circle = new AMap.Circle(dataItem.circle);
                } else {
                  //circle已经存在（切换数据时，marker会被回收利用），更新
                  marker._circle.setOptions(dataItem.circle);
                }

                switch (event.type) {
                  case "markerAddToMap":
                    //更新map
                    marker._circle.setMap(marker.getMap());

                    //更新position
                    marker._circle.setCenter(marker.getPosition());

                    break;

                  case "markerRemoveFromMap":
                    marker._circle.setMap(null);
                    break;
                }
              }
            );
          }

          // 绘制椭圆
          function drawEllipse(curData) {
            map.clearMap();
            curData.forEach((item) => {
              let ellipse = new AMap.Ellipse({
                center: item.center,
                radius: item.radius, //半径
                borderWeight: 3,
                strokeColor: "#fdf4d9",
                strokeOpacity: 1,
                strokeWeight: 1,
                strokeOpacity: 0.2,
                fillOpacity: 0.5,
                // 线样式还支持 'dashed'
                strokeStyle: "dashed",
                strokeDasharray: [10, 10],
                fillColor: item.color,
                zIndex: 50,
              });
              ellipse.setMap(map);
              // 缩放地图到合适的视野级别
              map.setFitView([ellipse]);
            });
          }

          // 绘制marker带圆
          async function drawMarkerCircle(curData) {
            await map.clearMap();
            //展示该数据
            markerList.render(curData);
            map.setZoom(15);
          }

          // 设置地图层级
          function setZoom(zoom) {
            map.setZoom(zoom); //设置地图层级
          }

          // 设置地图中心点
          function setCenter(lng, lat) {
            map.setCenter([lng, lat]); //设置地图中心点
          }

          // 地图图块加载完成后触发
          map.on("complete", function () {
            // getLocation();
            switch (props.module) {
              case "companyInfo":
                if (props.latitude && props.longitude) {
                  regeoCode([props.longitude, props.latitude]);
                  drawMaeker(props.longitude, props.latitude);
                  DATA.lng = props.longitude;
                  DATA.lat = props.latitude;
                } else {
                  regeoCode([113.401958, 24.207083]);
                  drawMaeker(113.401958, 24.207083);
                  DATA.lng = 113.401958;
                  DATA.lat = 24.207083;
                  emit("getlnglat", { lng: 113.401958, lat: 24.207083 });
                }
                break;
              case "homePage":
                drawDistrict();
                break;
              default:
                break;
            }
            map.setFitView(null, false, [150, 60, 100, 60]);
            // map.addControl(layerCtrl1);
            markerCircle();
            showSearch.value = props.isShowSearch;
            // map.add(imageLayer);

            map.setZoomAndCenter(11, [113.401958, 24.207083]); //同时设置地图层级与中心点
          });

          map.on("click", showInfoClick);
          tipinput.value &&
            tipinput.value.addEventListener("input", initSearch);

          // 地图缩放
          map.on("zoomend", (e) => {
            if (props.module == "homePage") {
              let zoom = map.getZoom(); //获取当前地图级别
              let arr = document.querySelectorAll(
                ".amap-simple-marker-icon-img"
              );
              let label = document.querySelectorAll(
                ".amap-simple-marker-label"
              );
              let position = document.querySelector(".amap-marker-content");
              if (zoom >= 13) {
                for (let i = 0; i < arr.length; i++) {
                  arr[i].style.width = "40px";
                  arr[i].style.height = "40px";
                  position.style.left = "-10px";
                  if (label[i]) {
                    label[i].style.fontSize = "28px";
                  }
                }
                // for (const item of arr) {
                //   item.style.width = "40px";
                //   item.style.height = "40px";
                //   position.style.left="-10px"
                //   label[0].style.fontSize = "32px"
                // }
              } else {
                // for (const item of arr) {
                //   item.style.width = "20px";
                //   item.style.height = "20px";
                //   position.style.left="auto"
                //   label[0].style.fontSize = "32px"
                // }
                for (let i = 0; i < arr.length; i++) {
                  arr[i].style.width = "20px";
                  arr[i].style.height = "20px";
                  position.style.left = "auto";
                  if (label[i]) {
                    label[i].style.fontSize = "14px";
                  }
                }
              }
            }
          });

          // 监听侧边栏 显示不同层级
          watch(
            () => props.marking,
            (newValue) => {
              if (newValue === 1) {
                setZoom(10);
              }
              if (newValue === 2) {
                setZoom(11);
              }
            }
          );

          // 监听 地名 切换行政区域
          watch(
            () => props.regionName,
            (newValue) => {
              // 搜索所有省/直辖市信息
              districtSearch.search(newValue, function (status, result) {
                // 查询成功时，result即为对应的行政区信息
                let { districtList } = result;
                if (status === "complete") {
                  if (districtList.length === 0) {
                    map.setCenter([
                      districtList[0].center.lng,
                      districtList[0].center.lat,
                    ]); //设置地图中心点
                  } else {
                    districtList.forEach((item) => {
                      if (item.citycode === "0763") {
                        map.setCenter([item.center.lng, item.center.lat]); //设置地图中心点
                      }
                    });
                  }
                }
              });
            }
          );

          // 监听企业列表 显示坐标位置
          watch(
            () => props.companyList,
            (newValue) => {
              markerLists.forEach((item) => {
                item.marker.setMap(null);
                if (item.infoWindow) {
                  item.infoWindow.close();
                }
              });
              if (newValue.length > 0) {
                switch (props.module) {
                  // 实时数据
                  case "realtime":
                    //内置的样式
                    let iconStyles =
                      new AMapUI.SimpleMarker.getBuiltInIconStyles("fresh");
                    newValue.forEach((item) => {
                      if (item.latitude && item.longitude) {
                        let bool = true;
                        if (item.deviceList) {
                          bool = item.deviceList.length > 0 ? true : false;
                        } else {
                          bool = false;
                        }

                        markerLists.push({
                          marker: new AMapUI.SimpleMarker({
                            containerClassNames: bool ? "" : "my_color",
                            iconLabel: "",
                            //自定义图标节点(img)的属性
                            iconStyle: bool
                              ? {
                                  src: "//webapi.amap.com/theme/v1.3/markers/b/mark_b.png",
                                  style: {
                                    width: "20px",
                                    height: "30px",
                                  },
                                }
                              : iconStyles[9],

                            //设置基点偏移
                            offset: new AMap.Pixel(-10, -30),

                            map: map,
                            position: [item.longitude, item.latitude],
                            showPositionPoint: true,
                            zIndex: 9999999,
                          }),
                          companyInfo: item,
                          longitude: item.longitude,
                          latitude: item.latitude,
                        });
                        let itemMarker = markerLists[markerLists.length - 1];

                        itemMarker.marker.on("click", (e) => {
                          emit("handleClickMarker", itemMarker.companyInfo);
                        });
                        let infoWindows = new AMapUI.SimpleInfoWindow({
                          infoBody: `
                              <div style="font-size: 14px;font-weight: bold;">
                                <p style="white-space: nowrap;margin-bottom:5px">${itemMarker.companyInfo.name}</p>
                              </div>
                            `,
                          //基点指向marker的头部位置
                          offset: new AMap.Pixel(0, -31),
                        });
                        // <p>坐标:(${itemMarker.longitude},${itemMarker.latitude})</p>
                        itemMarker.infoWindow = infoWindows;
                        itemMarker.marker.on("mouseover", (e) => {
                          infoWindows.open(
                            map,
                            itemMarker.marker.getPosition()
                          );
                        });
                        itemMarker.marker.on("mouseout", (e) => {
                          infoWindows.close();
                        });
                        // }

                        // });
                      }
                    });

                    break;
                  case "monitoringAids":
                    newValue.forEach((item) => {
                      if (item.latitude && item.longitude) {
                        let bool = item.indexCode ? true : false;
                        let iconStyles =
                          new AMapUI.SimpleMarker.getBuiltInIconStyles("fresh");
                        markerLists.push({
                          marker: new AMapUI.SimpleMarker({
                            containerClassNames: bool ? "" : "my_color",
                            iconLabel: "",
                            //自定义图标节点(img)的属性
                            iconStyle: bool
                              ? {
                                  src: "//webapi.amap.com/theme/v1.3/markers/b/mark_b.png",
                                  style: {
                                    width: "20px",
                                    height: "30px",
                                  },
                                }
                              : iconStyles[9],

                            //设置基点偏移
                            offset: new AMap.Pixel(-10, -30),

                            map: map,
                            position: [item.longitude, item.latitude],
                            showPositionPoint: true,
                            zIndex: 9999999,
                          }),
                          companyInfo: item,
                          longitude: item.longitude,
                          latitude: item.latitude,
                        });
                        let itemMarker = markerLists[markerLists.length - 1];

                        itemMarker.marker.on("click", (e) => {
                          emit("handleClickMarker", itemMarker.companyInfo);
                        });
                        let infoWindows = new AMapUI.SimpleInfoWindow({
                          //模板, underscore
                          infoTitle: "",
                          infoBody:
                            '<p class="my-desc">' +
                            //<%= 原值插入 ..
                            // "<%= img %>" +
                            //<%- html编码后插入
                            // "<%- body %>"
                            "<%= body %>" +
                            "</p>",
                          //模板数据
                          // <p>是否选择该地点作为地图标示点？</p>
                          infoTplData: {
                            title: "",
                            img: '<img src="//webapi.amap.com/theme/v1.3/autonavi.png" />',
                            body: `
                              <div style="font-size: 14px;font-weight: bold;">
                                <p style="white-space: nowrap;margin-bottom:5px">${itemMarker.companyInfo.name}</p>
                              </div>
                            `,
                          },
                          //基点指向marker的头部位置
                          offset: new AMap.Pixel(0, -31),
                        });
                        itemMarker.infoWindow = infoWindows;
                        itemMarker.marker.on("mouseover", (e) => {
                          infoWindows.open(
                            map,
                            itemMarker.marker.getPosition()
                          );
                        });
                        itemMarker.marker.on("mouseout", (e) => {
                          infoWindows.close();
                        });
                        // });
                      }
                    });

                    break;

                  case "homePage":
                    if (infoWindows2.length > 0) {
                      for (let i = 0; i < infoWindows2.length; i++) {
                        infoWindows2[i].close();
                      }
                    }

                    function labelStyle(item) {
                      let style = {
                        src: [1, 2].includes(item.type)
                          ? require("@/assets/image/u167.svg")
                          : require("@/assets/image/u168.svg"),
                        style: {
                          width: "20px",
                          height: "20px",
                          filter: "",
                          color: "",
                          // margin: "0px 10px 10px 3px",
                        },
                      };
                      if (props.viewType === "grading") {
                        switch (item.riskLevel) {
                          case 1:
                            style.style.filter = "hue-rotate(100deg)";
                            break;
                          case 2:
                            style.style.filter = "hue-rotate(300deg)";
                            break;
                          case 3:
                            style.style.filter = "hue-rotate(255deg)";
                            break;
                          case 4:
                            style.style.filter =
                              "hue-rotate(250.53061deg) saturate(149.41379%) brightness(87.19608%)";
                            break;
                          case 5:
                            style.style.filter = "grayscale(1)";
                            break;
                          default:
                            break;
                        }
                      } else if (props.viewType === "search") {
                        style.src =
                          "//webapi.amap.com/theme/v1.3/markers/b/mark_r.png";
                      }
                      return style;
                    }

                    //构建自定义信息窗体
                    function createInfoWindow(title, content) {
                      var info = document.createElement("div");
                      info.className =
                        "custom-info input-card content-window-card";

                      //可以通过下面的方式修改自定义窗体的宽高
                      info.style.width = "";
                      info.style.top = "10px";
                      // 定义顶部标题
                      // var top = document.createElement("div");
                      // var titleD = document.createElement("div");
                      // var closeX = document.createElement("img");
                      // top.className = "info-top";
                      // titleD.innerHTML = title;
                      // closeX.src = "https://webapi.amap.com/images/close2.gif";
                      // closeX.onclick = closeInfoWindow;

                      // top.appendChild(titleD);
                      // top.appendChild(closeX);
                      // info.appendChild(top);

                      // 定义中部内容
                      var middle = document.createElement("div");
                      middle.className = "info-middle";
                      middle.style.backgroundColor = "white";
                      middle.style.height = "30px";
                      middle.innerHTML = content;
                      info.appendChild(middle);

                      // 定义底部内容
                      var bottom = document.createElement("div");
                      bottom.className = "info-bottom";
                      bottom.style.position = "relative";
                      bottom.style.top = "0px";
                      bottom.style.margin = "0 auto";
                      info.appendChild(bottom);
                      return info;
                    }
                    //关闭自定义信息窗体
                    function closeInfoWindow() {
                      map.clearInfoWindow();
                    }

                    // 遍历企业, 设置点标记
                    newValue.forEach((item, index) => {
                      if (item.latitude && item.longitude) {
                        markerLists.push({
                          marker: new AMapUI.SimpleMarker({
                            iconLabel:
                              props.viewType === "search" ? index + 1 : "",
                            //自定义图标节点(img)的属性
                            iconStyle: labelStyle(item),

                            //设置基点偏移
                            offset: new AMap.Pixel(-10, -30),

                            map: map,
                            position: [item.longitude, item.latitude],
                            showPositionPoint: false,
                            zIndex: 9999999,
                          }),
                          companyInfo: item,
                          longitude: item.longitude,
                          latitude: item.latitude,
                        });
                      }
                    });

                    // 遍历点标记, 添加事件
                    markerLists.forEach((item, index) => {
                      // 信息窗口1
                      item.marker.on("click", (e) => {
                        isShowInfoWindows2.value = true;
                        // mouseover
                        // infoWindows.open(map, item.marker.getPosition());
                        let infoWindows = new AMapUI.SimpleInfoWindow({
                          infoBody: `
                              <div class="home">
                                <div style="position: relative;" class="mb-10">
                                  <img style="width:100%;display:${
                                    item.companyInfo.imgFileIdPath
                                      ? "block"
                                      : "none"
                                  }" height="200" src="${
                            item.companyInfo.imgFileIdPath ||
                            require("@/assets/image/图片加载失败.svg")
                          }" style="margin-bottom:10px">
                                  <div class="video" style="background-color: rgba(84, 92, 100, 0.5);width:100%;height: 30px;color: #fff;font-size: 14px; position: absolute;bottom: 0;line-height: 30px;display:${
                                    item.companyInfo.videoFileIdPath
                                      ? "flex"
                                      : "none"
                                  };cursor: pointer;">
                                     <img width="20" height="30" src="${require("@/assets/image/u283.svg")}" style="margin:0 10px 0 10px">
                                    播放全景图视频
                                  </div>
                                  
                                </div>
                                <h5 style="margin-bottom:10px" class="text-ellipsis" title='${
                                  item.companyInfo.name
                                }'>${item.companyInfo.name}</h5>
                                <p style="margin-bottom:10px;font-size:12px">主要负责人: ${
                                  item.companyInfo.legalPerson
                                }</p>
                                <p style="margin-bottom:10px;font-size:12px">联系电话: ${
                                  item.companyInfo.legalPhone
                                    ? item.companyInfo.legalPhone
                                    : ""
                                }</p>
                                <p style="margin-bottom:10px;font-size:12px">企业类型: ${filterCompanyType(
                                  item.companyInfo.type
                                )}</p>
                                <p style="margin-bottom:20px;font-size:12px">行业: ${
                                  item.companyInfo.mineTypeName || ""
                                }</p>
                                <h5 style="margin-bottom:10px;font-size:12px">资料完整度:</h5>
                                <div
                                  class="el-progress el-progress--line"
                                  role="progressbar"
                                  aria-valuenow="${
                                    item.companyInfo.dataCompletion || 0
                                  }"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                  style="margin-bottom:10px"
                                >
                                  <div class="el-progress-bar">
                                    <div class="el-progress-bar__outer" style="height: 6px;">
                                      <div class="el-progress-bar__inner"
                                        style="width: ${
                                          item.companyInfo.dataCompletion
                                            ? item.companyInfo.dataCompletion +
                                              "%"
                                            : "0%"
                                        }";
                                        animation-duration: 3s;"><!---->
                                      </div>
                                    </div>
                                  </div>
                                  <div class="el-progress__text" style="font-size: 14.4px;">
                                    <span>${
                                      item.companyInfo.dataCompletion
                                        ? item.companyInfo.dataCompletion + "%"
                                        : "0%"
                                    }</span>
                                  </div>
                                </div>
                                <p class="companyDetails" style="width:100%;text-align:right;font-size:12px;cursor: pointer;">企业详情>></p>
                              </div>
                            `,
                          //基点指向marker的头部位置
                          // offset: new AMap.Pixel(0, -31),
                          offset: new AMap.Pixel(0, 240),
                        });
                        item.infoWindow = infoWindows;
                        infoWindows
                          .get$InfoBody()
                          .on("click", ".companyDetails", function (event) {
                            //阻止冒泡
                            event.stopPropagation();
                            // 需要判断企业类型, 跳转对应页面
                            STORE.commit("setCompanyInfo", {
                              type: item.companyInfo.type,
                              companyId: item.companyInfo.id,
                            });
                            if (item.companyInfo.type === 4) {
                              STORE.commit("setTwoTitle", "工贸行业管理");
                              STORE.commit("setTitle", "企业档案管理");
                              ROUTER.push({
                                name: "tradeDetails",
                              });
                            } else {
                              STORE.commit("setTwoTitle", "非煤矿山企业管理");
                              STORE.commit("setTitle", "企业档案管理");
                              ROUTER.push({
                                name: "companyDetails",
                              });
                            }
                          });
                        infoWindows
                          .get$InfoBody()
                          .on("click", ".video", function (event) {
                            //阻止冒泡
                            event.stopPropagation();
                            emit("handlePlay", item.companyInfo);
                          });
                        infoWindows.open(map, map.getCenter());

                        infoWindows
                          .get$Container()
                          .on("click", function (event) {
                            isShowInfoWindows2.value = false;
                          });
                      });
                      // // item.marker.on("mouseout", (e) => {
                      //   infoWindows.close();
                      // });

                      //信息窗口2
                      var title = "";
                      var content = [
                        `<h5 style="margin-bottom:10px" class="text-ellipsis" title='${item.companyInfo.name}'>${item.companyInfo.name}</h5>`,
                      ];

                      infoWindows2[index] = new AMap.InfoWindow({
                        isCustom: true, //使用自定义窗体
                        content: createInfoWindow(title, content.join("<br/>")),
                        offset: new AMap.Pixel(10, -20),
                      });

                      item.marker.on("mouseover", (e) => {
                        if (!isShowInfoWindows2.value) {
                          infoWindows2[index].open(
                            map,
                            item.marker.getPosition()
                          );
                        }
                      });
                      item.marker.on("mouseout", (e) => {
                        if (!isShowInfoWindows2.value) {
                          infoWindows2[index].close();
                        }
                      });
                    });

                    setTimeout(() => {
                      let zoom = map.getZoom(); //获取当前地图级别
                      let arr = document.querySelectorAll(
                        ".amap-simple-marker-icon-img"
                      );
                      let label = document.querySelectorAll(
                        ".amap-simple-marker-label"
                      );
                      if (zoom >= 13) {
                        for (let i = 0; i < arr.length; i++) {
                          arr[i].style.width = "40px";
                          arr[i].style.height = "40px";
                          if (label[i]) {
                            label[i].style.fontSize = "28px";
                          }
                        }
                      } else {
                        for (let i = 0; i < arr.length; i++) {
                          arr[i].style.width = "20px";
                          arr[i].style.height = "20px";
                          if (label[i]) {
                            label[i].style.fontSize = "14px";
                          }
                        }
                      }
                    }, 16);

                    break;
                  case "emergency":
                    newValue.forEach((item) => {
                      if (item.latitude && item.longitude) {
                        markerLists.push({
                          marker: new AMapUI.SimpleMarker({
                            iconLabel: "",
                            //自定义图标节点(img)的属性
                            iconStyle: {
                              src: item.filePath,
                              style: {
                                width: "30px",
                                height: "30px",
                              },
                            },

                            //设置基点偏移
                            offset: new AMap.Pixel(-10, -30),

                            map: map,
                            position: [item.longitude, item.latitude],
                            showPositionPoint: false,
                            zIndex: 9999999,
                          }),
                          companyInfo: item,
                          longitude: item.longitude,
                          latitude: item.latitude,
                        });
                      }
                    });
                    markerLists.forEach((item) => {
                      let infoWindows = new AMapUI.SimpleInfoWindow({
                        //模板, underscore
                        infoTitle: "<strong><%= img %><%- title %></strong>",
                        infoBody:
                          '<p class="my-desc">' +
                          //<%= 原值插入 ..
                          // "<%= img %>" +
                          //<%- html编码后插入
                          // "<%- body %>"
                          "<%= body %>" +
                          "</p>",
                        //模板数据
                        // <p>是否选择该地点作为地图标示点？</p>
                        infoTplData: {
                          title: "",
                          img: '<img src="//webapi.amap.com/theme/v1.3/autonavi.png" />',
                          body: `
                              <div>
                                <h4 style="margin-bottom:10px">${
                                  item.companyInfo.aroundName
                                }</h4>
                                <p style="margin-bottom:10px;font-size:12px">与现场相距距离: ${getDistance(
                                  item.latitude,
                                  item.longitude,
                                  props.latitude,
                                  props.longitude
                                )}公里</p>
                                <h5 style="margin-bottom:10px;">联系方式</h5>
                                <p style="margin-bottom:10px;font-size:12px">电话: ${
                                  item.companyInfo.contactInformation
                                }</p>
                                <p style="margin-bottom:10px;font-size:12px">总机: ${
                                  item.companyInfo.switchboard
                                }</p>
                                <p style="margin-bottom:10px;font-size:12px">描述: ${
                                  item.companyInfo.informationDescribe
                                }</p>
                              </div>
                            `,
                        },
                        //基点指向marker的头部位置
                        offset: new AMap.Pixel(0, -31),
                      });
                      item.infoWindow = infoWindows;
                      item.marker.on("mouseover", (e) => {
                        infoWindows.open(map, item.marker.getPosition());
                      });
                    });
                    break;
                  default:
                    break;
                }
              } else {
                if (props.module === "homePage") {
                  if (infoWindows2.length > 0) {
                    for (let i = 0; i < infoWindows2.length; i++) {
                      infoWindows2[i].close();
                    }
                  }
                }
              }
            },
            {
              deep: true,
              immediate: true,
            }
          );

          // 监听爆炸数据
          watch(
            () => props.blastData,
            (newValue) => {
              drawMarkerCircle(newValue);
            }
          );

          // 监听中毒数据
          watch(
            () => props.toxicosisData,
            (newValue) => {
              drawEllipse(newValue);
            }
          );
        })
        .catch((e) => {
          console.log(e);
        });
    };

    onMounted(() => {
      nextTick(() => {
        tipinput.value = document.getElementById("tipinput");
        initAmap();
      });
    });
    return {
      ...toRefs(DATA),
      showSearch,
    };
  },
});
</script>
<style scoped lang="scss">
#tipinput {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  z-index: 99;
  padding: 5px;
  border: 2px solid;
  border-color: #eeece7;
  border-radius: 4px;
  //   box-shadow: 0 0 5px 0px rgb(100 100 100 / 80%);
  &:focus {
    border: 2px solid #ffa35c;
    border-radius: 4px;
  }
}

.tip-box {
  width: 400px;
  max-height: 150px;
  position: absolute;
  top: 40px;
  left: 10px;
  overflow-y: auto;
  background-color: #fff;
  z-index: 1000;
}

/deep/ .amap-simple-marker-label {
  color: #fff;
}

/deep/ .amap-ui-smp-ifwn-content-body {
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 0 8px 0px silver;
  border: none;
}

/deep/.amap-marker-content
  .my_color.amap-simple-marker-def-style
  .amap-simple-marker-icon {
  width: 20px;
  background-position: 89% 100%;
  background-size: 464px 30px;
  position: absolute;
  right: 8px;
}

#homePage {
  /deep/.amap-ui-smp-ifwn-combo-sharp {
    height: 0 !important;
  }

  /deep/.amap-info-contentContainer {
    .custom-info {
      padding: 5px;
      padding-bottom: 0;
      .info-middle {
        height: 30px !important;
        padding: 4px;
        color: #666666;
        text-align: center;
      }
      .info-bottom {
        height: 20px !important;
        &:after {
          position: absolute;
          content: "";
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0;
          z-index: 999999;
          margin-left: -8px;
          border-top: 14px solid #fff;
          border-bottom: 14px solid transparent;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
      }
    }
    .amap-ui-smp-ifwn-container {
      position: fixed;
      left: 50%;
      transform: translate(-50%, -50%);
      top: 52%;
    }
  }
  /deep/.companyDetails:hover {
    color: $themeColor;
  }
}

/deep/ .amap-ui-smp-ifwn-info-title {
  border: none;
}

#realtime /deep/ .amap-ui-infowindow-close {
  display: none;
}
#realtime /deep/ .amap-ui-smp-ifwn-content-body {
  padding: 0;
}
#monitoringAids /deep/ .amap-ui-infowindow-close {
  display: none;
}
#monitoringAids /deep/ .amap-ui-smp-ifwn-content-body {
  padding: 0;
}
</style>