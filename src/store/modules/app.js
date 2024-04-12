const state = {
  token: '',
  userName: '',
  phone: '',
  isMap: '',
  onlyOneTime: false, // 限制不在打卡规则弹框只弹一次
  oneMinLimit: false // 限制驻外打卡成功返回之后一分钟不允许再进入驻外打卡页面
}
const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USER_NAME(state, name) {
    state.userName = name
  },
  SET_PHOTO(state, photo) {
    state.photo = photo
  },
  SET_ISMAP(state, isMap) {
    state.isMap = isMap
  },
  SET_ONLYONETIME(state, onlyOneTime) {
    state.onlyOneTime = onlyOneTime
  },
  SET_ONEMINLIMIT(state, oneMinLimit) {
    state.oneMinLimit = oneMinLimit
  }
}
const actions = {
  // 设置token
  setToken({ commit }, token) {
    commit('SET_TOKEN', token)
  },
  // 设置name
  setUserName({ commit }, name) {
    commit('SET_USER_NAME', name)
  },
  // 设置地图头像
  setPhoto({ commit }, photo) {
    commit('SET_PHOTO', photo)
  },
  // 设置是否地图页
  setIsMap({ commit }, isMap) {
    commit('SET_ISMAP', isMap)
  },
  setOnlyOneTime({ commit }, onlyOneTime) {
    commit('SET_ONLYONETIME', onlyOneTime)
  },
  setOneMinLimit({ commit }, oneMinLimit) {
    commit('SET_ONEMINLIMIT', oneMinLimit)
  }
}
export default {
  state,
  mutations,
  actions
}
