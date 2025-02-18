/*
 * @Date: 2022-05-27
 * @FilePath: \wc-clock-in\src\utils\convert.js
 * @Description: 坐标转换（百度-高德）
 */
// 百度坐标转⾼德（传⼊经度、纬度）
export const bd_gd = (bd_lng, bd_lat) => {
  var X_PI = Math.PI * 3000.0 / 180.0
  var x = bd_lng - 0.0065
  var y = bd_lat - 0.006
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
  var gg_lng = z * Math.cos(theta)
  var gg_lat = z * Math.sin(theta)
  return { lng: gg_lng, lat: gg_lat }
}

// ⾼德坐标转百度（传⼊经度、纬度）
export const gd_bd = (gg_lng, gg_lat) => {
  var X_PI = Math.PI * 3000.0 / 180.0
  var x = gg_lng
  var y = gg_lat
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI)
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI)
  var bd_lng = z * Math.cos(theta) + 0.0065
  var bd_lat = z * Math.sin(theta) + 0.006
  return {
    lat: bd_lat,
    lng: bd_lng
  }
}
