// 格式化时间  时分秒
export function filterTime(
  time: any,
  sym: string = "-",
  isHMS: boolean = true
) {
  if (time == null) {
    return "";
  }
  let d = new Date(time);
  if (d.getHours() < 10) {
    var Hours: string | number = "0" + d.getHours();
  } else {
    var Hours: string | number = d.getHours();
  }
  if (d.getMinutes() < 10) {
    var Minutes: string | number = "0" + d.getMinutes();
  } else {
    var Minutes: string | number = d.getMinutes();
  }
  if (d.getSeconds() < 10) {
    var Seconds: string | number = "0" + d.getSeconds();
  } else {
    var Seconds: string | number = d.getSeconds();
  }

  if (isHMS) {
    return (
      d.getFullYear() +
      sym +
      (d.getMonth() + 1) +
      sym +
      d.getDate() +
      " " +
      Hours +
      ":" +
      Minutes +
      ":" +
      Seconds
    );
  } else {
    return d.getFullYear() + sym + (d.getMonth() + 1) + sym + d.getDate();
  }
}

// 格式化日期 年月日
export function formatDate(time: any) {
  if (!time) return;
  let d = new Date(time);
  let year = d.getFullYear();
  year = addZero(year);
  let month = d.getMonth() + 1;
  month = addZero(month);
  let day = d.getDate();
  day = addZero(day);
  return `${year}-${month}-${day}`;
}
function addZero(val: any) {
  return val > 9 ? val : "0" + val;
}

/**
 *
 * @param degree 经纬度
 * @param direction 经纬度字典 lon 经度 lat 纬度
 * @returns
 */
// 经纬度转度分秒
export function transformDMS(degree: number, direction: string) {
  var D = plusZeroAtHead(Math.floor(degree));
  var M = plusZeroAtHead(Math.floor((degree - (D as number)) * 60));
  var S = plusZeroAtHead(
    Math.floor(((degree - (D as number)) * 60 - (M as number)) * 60)
  );
  var result = D + "°" + M + "′" + S + "″";

  // 如果是个位数， 则在首位加 0
  function plusZeroAtHead(num: number | string) {
    if (num > -10 && num < 0) {
      num = "-0" + Math.abs(num as number);
    }
    if (num > 0 && num < 10) {
      return "0" + num;
    }
    return num;
  }

  if (direction === "lon") {
    D > 0 ? (result += "E") : (result += "W");
    return result;
  }
  if (direction === "lat") {
    D > 0 ? (result += "N") : (result += "S");
    return result;
  }
  return result;
}

// var lonDMS = transformDMS(lon, "lon");
// var latDMS = transformDMS(lat, "lat");
