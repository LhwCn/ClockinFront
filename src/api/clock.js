import { async } from 'regenerator-runtime'
import api from './index'
// axios
import request from '@/utils/request'

// 用户信息
export function getUserInfo(params) {
  return request({
    url: api.UserInfo,
    method: 'get',
    params
  })
}

// 获取打卡范围
export function getSignRanges(params) {
  return request({
    url: api.GetSignRanges,
    method: 'get',
    params,
    hideloading: true
  })
}

// 检查是否定位在打卡范围
export function checkInAreas(data) {
  return request({
    url: api.CheckInAreas,
    method: 'post',
    params: data,
    hideloading: true
  })
}

export function getSignRange(params) {
  return request({
    url: api.GetSignRange,
    method: 'get',
    params,
    hideloading: true
  })
}

export function checkInArea(data) {
  return request({
    url: api.CheckInArea,
    method: 'post',
    data,
    hideloading: true
  })
}

// 获取当天打卡信息
export function getSignInfo(params) {
  return request({
    url: api.GetSignInfo,
    method: 'get',
    params
  })
}

export function isNeedSign(params) {
  return request({
    url: api.IsNeedSign,
    method: 'get',
    params
  })
}

export function getSignDayHistoryNew(params) {
  return request({
    url: api.GetSignDayHistoryNew,
    method: 'get',
    params
  })
}

// 月度数据（日历模块数据）
export function getSignInfoByMonth(params) {
  return request({
    url: api.GetSignInfoByMonth,
    method: 'get',
    params
  })
}

// 提交补卡申请，把补卡状态situation改成2
export function applyRepairSign(params) {
  return request({
    url: api.ApplyRepairSign,
    method: 'get',
    params
  })
}

// 提交请假申请，把补卡状态situation改成6
export function applyLeaveSign(params) {
  return request({
    url: api.ApplyLeaveSign,
    method: 'get',
    params
  })
}

// 保存打卡信息（考勤打卡）
export function saveSignInfo(params) {
  return request({
    url: api.SaveSignInfo,
    method: 'post',
    params
  })
}

// 驻外打卡
export function saveSignLegwork(params) {
  return request({
    url: api.SaveSignLegwork,
    method: 'post',
    params
  })
}

// 登录
export function getToken(data) {
  return request({
    url: api.GetToken,
    method: 'post',
    headers: {
      'Content-Type': 'application/json' // 设置完以后 传入的params对象就会时候用formdata传参的方式
    },
    data
  })
}

// 钉钉单点
export function getDdToken(data) {
  debugger
  return request({
    url: api.GetDdToken,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // 设置完以后 传入的params对象就会时候用formdata传参的方式
    },
    data
  })
}

// 钉钉鉴权
export function getDdPermission(data) {
  return request({
    url: '/dingding/jsapi',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}
