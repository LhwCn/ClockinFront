// 日期相关方法
/**
 * js根据日期计算星期几
 * @param date 2022-06-01
 * @returns {string}
 */
export function getWeekDay(date) {
  const dt = new Date(date.split('-')[0], date.split('-')[1] - 1, date.split('-')[2])
  const weekDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期五']
  return weekDay[dt.getDay()]
}
// 判断是否是星期天
export function isSunday(date) {
  if (getWeekDay(date) === '星期天') {
    return true
  } else {
    return false
  }
}
// 判断是否是今天
export function isToday(date) {
  const todayDate = new Date().setHours(0, 0, 0, 0) // 把今天的日期时分秒设置为00:00:00，返回一个时间戳
  const paramsDate = new Date(date).setHours(0, 0, 0, 0) // 给new Date()传入时间，并返回传入时间的时间戳
  return (todayDate === paramsDate) // 时间戳相同时 true 就为今天
}
// 获取当前月份xxxx-xx格式
export function getMonthFormat() {
  const date = new Date()
  const year = date.getFullYear() // 获取完整年份4位
  let month = date.getMonth() + 1 // 获取当前月份
  // 对当前月份进行处理，1-9月在前面添加一个0
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  // 拼接，xxxx-xx格式
  const nowYear = year + '-' + month
  return nowYear
}

// 获取今天的日期xxxx-xx-xx格式
export function getTodayFormat() {
  const date = new Date()
  const year = date.getFullYear() // 获取完整年份4位
  let month = date.getMonth() + 1 // 获取当前月份
  let day = date.getDate()
  // 对当前月份进行处理，1-9月在前面添加一个0
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 1 && day <= 9) {
    day = '0' + day
  }
  // 拼接，xxxx-xx-xx格式
  const nowDay = year + '-' + month + '-' + day
  return nowDay
}

// 获取年月日yyyymmdd
export function getToday() {
  const date = new Date()
  const year = date.getFullYear() // 获取完整年份4位
  let month = date.getMonth() + 1 // 获取当前月份
  let day = date.getDate()
  // 对当前月份进行处理，1-9月在前面添加一个0
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 1 && day <= 9) {
    day = '0' + day
  }
  const nowDay = '' + year + month + day
  return nowDay
}

// 获取今天时分(HH:MM:SS)
export function getTodayTime() {
  const date = new Date()
  const HH = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const MM = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const SS = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  return HH + ':' + MM + ':' + SS
}
// 获取今天时分(HH:MM:SS)
export function getTodayTimeFormat() {
  const date = new Date()
  const HH = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const MM = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const SS = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  return '' + HH + MM + SS
}
// 比较两个时间大小(HH:MM)
export function compareTime(time1, time2, interval = 0) {
  function time_to_sec(time) {
    if (time != null) {
      let s = ''
      const hour = time.split(':')[0]
      const min = time.split(':')[1]
      s = Number(hour * 3600) + Number(min * 60)
      return s
    }
  }
  if (time_to_sec(time1) - time_to_sec(time2) > interval) {
    return true
  }
  return false
}
// 打卡时间间隔两分钟
export function twoMinutesCompare(time1, time2) {
  function time_to_sec(time) {
    if (time != null) {
      let s = ''
      const hour = time.split(':')[0]
      const min = time.split(':')[1]
      const sec = time.split(':')[2]
      s = Number(hour * 3600) + Number(min * 60) + Number(sec)
      return s
    }
  }
  if (time_to_sec(time1) - time_to_sec(time2) >= 0 && time_to_sec(time1) - time_to_sec(time2) < 2 * 60) {
    return true
  }
  return false
}
