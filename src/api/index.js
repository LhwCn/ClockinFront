const api = {
  Login: '/user/login',
  UserName: '/user/name',
  // 打卡相关
  UserInfo: '/appnew/getUserInfo',
  GetSignRanges: '/sign/getSignRanges', // 获取打卡范围
  CheckInAreas: '/sign/checkSignLocations', // 检查是否定位在打卡范围
  GetSignRange: '/sign/getSignRange',
  CheckInArea: '/sign/checkSignLocation',
  GetSignInfo: '/sign/getSignInfo', // 获取当天打卡信息
  IsNeedSign: '/sign/isNeedSign',
  GetSignDayHistoryNew: '/sign/getSignDayHistoryNew', // 获取历史记录
  GetSignInfoByMonth: '/sign/getSignInfoByMonth',
  ApplyRepairSign: '/sign/applyRepairSign',
  ApplyLeaveSign: '/sign/applyLeaveSign',
  SaveSignInfo: '/sign/saveSignInfo', // 考勤打卡
  SaveSignLegwork: '/sign/saveSignLegwork', // 驻外打卡
  // 登录相关
  GetToken: '/api/login',
 // GetDdToken: '/dingding/ddsignin'
  GetDdToken: '/api/SsoLogin'
}

export default api
