<!-- 考勤打卡 -->
<template>
  <div :class="['inside', { 'inside-scroll': handleLastDayDaka(dayDakaModel) === true }]">
    <div class="top">
      <!-- <div class="name">
        <span class="tip">{{ tipMsg }}</span>
      </div> -->
      <div class="bg">
        <img :src="insideImg" alt="" />
      </div>
    </div>

    <div class="today" v-if="isShowSign">
      <div class="head" :style="{ 'text-align': 'left' }">
        <ClockComponent></ClockComponent>
      </div>
      <div class="location">
        <van-cell-group>
          <van-field v-model="carNo" :label="compLabel" placeholder="请输入车牌号" />
        </van-cell-group>
      </div>
      <div class="clock">
        <!-- canSign 是否在电子围栏之内
        isTimeInRange 是否在打卡允许的时间范围内
        myPosition 位置信息不能是"正在获取定位..."
        只有满足以上所有条件，才可以打卡，否则会提示当前不符合考勤打卡条件 -->
         {{ canSign }}{{ isTimeInRange }}{{ myPosition }}11111
        <van-button
          v-if="canSign && isTimeInRange && myPosition != '正在获取定位...'"
          round
          type="info"
          size="large"
          color="linear-gradient(to bottom, #98cff3, #40abf1)"
          style="box-shadow: 3px 3px 8px rgba(78, 137, 243, 0.6)"
          @click="handleDaKa('nomarl')"
        >
          {{ switchValue ? '换绑车牌' : '绑定车牌' }}
        </van-button>
        <van-button
          v-else
          round
          type="info"
          size="large"
          color="linear-gradient(to bottom, #b3c8da, #9fb8cd)"
          style="box-shadow: 3px 3px 8px rgba(156, 171, 199, 0.6)"
          @click="$toast('当前不符合考勤打卡条件')"
        >
          {{ switchValue ? '换绑车牌' : '绑定车牌' }}
        </van-button>
      </div>
    </div>
    <div id="container" style="display: none"></div>
  </div>
</template>

<script>
import { getUserInfo, getSignInfo, getSignRanges, getSignDayHistoryNew, saveSignInfo, saveSignLegwork } from '@/api/clock.js'
import isNeedSign from '@/mixins/isNeedSign'
import { getToday, getTodayTime, getTodayFormat, getTodayTimeFormat, compareTime } from '@/utils/dateFormat.js'
import ClockComponent from '@/components/ClockComponent.vue'
import * as dd from 'dingtalk-jsapi'
import AMapLoader from '@amap/amap-jsapi-loader'
import { uuid } from '@/utils/uuid.js'
import { gd_bd } from '@/utils/convert.js'
import { closeDD } from '@/utils/dingding.js'
import { Switch as VanSwitch } from 'vant'

export default {
  mixins: [isNeedSign],

  components: {
    [VanSwitch.name]: VanSwitch,
    ClockComponent
  },

  data() {
    return {
      maxHeight: '', // 页面的最大高度
      tipMsg: '', // 寄语
      isTimeInRange: false, // 标志位 当前时间是否在打卡计划规定的时间范围内，默认是不在
      routeLable: 'inside', // 打卡模式：inside 内勤打卡；outside 外勤打卡；默认是内勤打卡
      AMap: null, // 高德封装并使用的容器对象
      polygonPath: [], // 多个坐标点组成的集合
      polygon: null, // 高德使用的打卡范围多边形对象，包含polygonPath属性，可以理解为是一个打卡范围对象
      polygonList: [], // 打卡范围对象的集合，如果有多个打卡范围会使用，目前只有一个范围
      map: null, //打卡范围对象的集合最终会被添加到这个map中
      myPosition: '我的位置', // 显示的位置信息的文字，在获取位置信息时，会被修改成'正在获取定位。。。'
      switchValue: false, // 标志位：true 外勤打卡；fasle 内勤打卡；是否是外勤打卡，控制外勤按钮的开关，默认是内勤打卡
      canSign: true, // 标志位 是否在电子围栏之内，默认在

      dayDakaModel: {}, // 接收用户当日打卡计划信息的表单（sign_next）

      signType: '', // 打卡类型：0固定打卡；1自由打卡；
      ruleId: '',
      ruleName: '',

      dakaModel: {}, // 用户当日打卡的统计sign_file，其中包括内外勤打卡明细

      signStatus: '0', // 打卡状态，默认是0，也没做什么处理
      dakaDetailArray: [], // 当日打卡记录数组
      dakaLegDetailArray: [], // 外勤打卡记录数据
      dayDakaData: null,
      tempStatu: '',
      schedule: '', // 每15秒刷新位置的定时器

      carNo: '鲁B26P90', // 车牌号
      userName:'',
      model:{}
    }
  },

  computed: {
    compLabel(){
      return `${this.userName}`;
    },

    // 打卡背景图片切换
    insideImg() {
      const date = new Date()
      const hour = date.getHours()
      if (hour < 12) {
        return require('assets/images/inside/am-bg1.png')
      } else {
        return require('assets/images/inside/pm-bg1.png')
      }
    },

    // 打卡状态图标切换
    handleStatusImg() {
      return val => {
        // 0 已打卡；1 缺卡；2 迟到；3 早退；
        if (val === 0 || val === 4) {
          return require('assets/images/Check circle outline.png')
        } else if (val === 2 || val === 3) {
          return require('assets/images/miss.png')
        } else if (val === 1) {
          return require('assets/images/miss.png')
        }
        if (this.signType === 1) {
          return require('assets/images/inside/normal.png')
        }
      }
    },

    // 打卡类型为自由打卡，打卡规则名称是综合打卡并且满足在起始时间和结束时间之间时返回true
    handleLastDayDaka() {
      return val => {
        if (val.signType === '1' || this.ruleName === '综合打卡') {
          let endHour = '10:00'
          const startHour = '00:00'
          const nowHour = getTodayTime().substring(0, 5)
          if (val.endTime) {
            endHour = val.endTime
          }
          // 通过接口判断是否可以跨天打卡WCCheckLastDay
          if (compareTime(nowHour, startHour) && compareTime(endHour, nowHour)) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      }
    },

    handlehandpunch() {
      let dayDakaData = null
      this.$route.params.dayDakaModel ? (dayDakaData = this.$route.params.dayDakaModel) : (dayDakaData = null)
      if (dayDakaData.handpunch === '1') {
        return {
          reasonName: '手动打卡原因',
          reasonVal: '必填'
        }
      } else {
        return {
          reasonName: '备注',
          reasonVal: '选填'
        }
      }
    }
  },

  created() {
    // 计算页面最大高度
    const h = window.innerHeight
    document.documentElement.clientHeight
    document.body.clientHeight
    this.maxHeight = h - 46 - 50 - 265 - 50 - 100 - 20 + 'px'

    this.getUserInfo()
  },

  mounted() {},

  methods: {

    getUserInfo() {
      const params = {}
      getUserInfo(params)
        .then((data) => {
          if (data.code === 200) {
            this.userName = data.data.username
            if (data.data.photo) {
              this.$store.dispatch('setPhoto', 'http://xx/filepath' + data.data.photo)
            } else {
              this.$store.dispatch('setPhoto', '')
            }
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },

    refresh() {
      const currentTime = new Date()
      const amStartTime = new Date() // 上午允许打卡起始时间
      const amEndTime = new Date() // 上午允许打卡截止时间
      const pmStartTime = new Date() // 下午允许打卡起始时间
      const pmEndTime = new Date() //下午允许打卡截止时间
      // comeMustTime 上班时间
      if (this.dakaModel.comeMustTime) {
        // hoursCome 上班时间的小时；minutesCome 上班时间的分钟
        const [hoursCome, minutesCome] = this.dakaModel.comeMustTime.split(':') // 将字符串以":"分割为小时和分钟
        // 设置上班允许打卡的时间是从上班时间前一小时到上班时间后一小时，8点上班，7点到9点都可以打卡
        amStartTime.setHours(parseInt(hoursCome) - 1, minutesCome, 0)
        amEndTime.setHours(parseInt(hoursCome) + 1, minutesCome, 0)
      }
      // leaveMustTime 下班时间
      if (this.dakaModel.leaveMustTime) {
        // hoursEnd 下班时间的小时；minutesEnd 下班时间的分钟
        const [hoursEnd, minutesEnd] = this.dakaModel.leaveMustTime.split(':') // 将字符串以":"分割为小时和分钟
        // 设置下班打卡的允许时间是从下班开始到下班后一小时，17点下班，17点到18点可以打卡
        pmStartTime.setHours(parseInt(hoursEnd), minutesEnd, 0)
        pmEndTime.setHours(parseInt(hoursEnd) + 1, minutesEnd, 0)
      }
      // 判断当前时间是否在打卡规定的时间范围内，设置标志位isTimeInRange的值
      if (
        (currentTime >= amStartTime && currentTime <= amEndTime) ||
        (currentTime >= pmStartTime && currentTime <= pmEndTime)
      ) {
        this.isTimeInRange = true
      } else {
        this.isTimeInRange = false
      }

      // 需要新加一个是否能够打卡的标志 isAllowSign
      // if (this.dakaDetailArray.length === 1 && currentTime <= endDown) {
      //   this.isTimeInRange = true
      // } else {
      //   this.isTimeInRange = false
      // }
      // 以下是当不符合打卡条件时，展示给用户的提示信息，需要完善逻辑
      // if(!this.canSign){
      //   this.DaKaErrorTip = '当前位置不在考勤范围内，请刷新定位'
      // }else if(!this.isTimeInRange){
      //   this.DaKaErrorTip = '当前时间不在打卡时间范围内'
      // }

      let flag = false // flag 这个是是否外勤打卡标志位，但是后面没有用，使用了switchValue替代
      if (this.routeLable && this.routeLable === 'inside') {
        // 内勤打卡
        flag = true
        // 获取电子围栏数据，并赋值给this.map
        this.getRanges(this.AMap)
      } else if (this.routeLable && this.routeLable === 'outside') {
        // 外勤打卡，不需要获取打卡计划中的电子围栏信息，就是不需要判断用户当前是否在打卡范围之内
        flag = false
      }
      if (dd.env.platform === 'notInDingTalk') {
        // pc定位
        this.getMyLocation(this.AMap, this.map, flag)
      } else {
        // 钉钉定位
        this.getDdSingleLoc(this.AMap, this.map, flag)
      }
    },

    checkChange() {
      this.refresh()
      if (this.switchValue) {
        this.routeLable = 'outside'
        this.tempStatu = this.isTimeInRange
        this.isTimeInRange = true
      } else {
        this.routeLable = 'inside'
        this.isTimeInRange = this.tempStatu
      }
    },

    initMap(flag) {
      window._AMapSecurityConfig = {
        securityJsCode: '3d6c821aa4b94a39e25e89141d8c1bdf'
      }
      AMapLoader.load({
        key: 'e58f9334d511a8bd0f8a4423bb8d8114', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.Geocoder'] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          this.AMap = AMap
          this.map = new AMap.Map('container', {
            center: [120.184615, 36.031294],
            zoom: 13
          })
          if (flag) {
            this.getRanges(AMap)
          }
          // this.getMyLocation(AMap, this.map, flag)
          dd.env.platform === 'notInDingTalk'
            ? this.getMyLocation(AMap, this.map, flag)
            : // : this.handleDdPermission(AMap, this.map, flag)
              this.getDdLocation(AMap, this.map, '', flag)
        })
        .catch(e => {
          console.log(e)
        })
    },

    getRanges(AMap) {
      // polygon 多边形，这里指代一个考勤电子围栏位置信息
      // polygonPath是坐标点的集合，polygon包含这个属性
      // polygonList是指多个考勤电子围栏位置的集合，通常只有一个，也只取第一个

      const params = {}
      this.polygonPath = []
      this.polygon = null
      this.polygonList = []
      getSignRanges(params)
        .then(data => {
          const polygonData = data.polygonData
          polygonData.forEach((array, arrIndex) => {
            array.forEach(item => {
              // const trans = bd_gd(item.longitude, item.latitude)
              this.polygonPath.push(
                // new AMap.LngLat(trans.lng, trans.lat)
                new AMap.LngLat(item.longitude, item.latitude)
              )
            })
            this.polygon = new AMap.Polygon({
              fillColor: '#4ea4f8',
              fillOpacity: 0.6,
              strokeColor: '#4ea4f8',
              strokeOpacity: 0.6,
              path: this.polygonPath
            })
            // this.polygonPath = []
            this.polygonList[arrIndex] = this.polygon
          })
          // 如果是多个，这里map.add([polygon, polygon1])
          this.map.add(this.polygonList)
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 高德获取当前定位
    getMyLocation(AMap, map, flag) {
      this.myPosition = '正在获取定位...'
      const _this = this
      const options = {
        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
        showButton: true, // 是否显示定位按钮
        position: 'LB', // 定位按钮的位置
        /* LT LB RT RB */
        timeout: 5000,
        offset: [10, 20], // 定位按钮距离对应角落的距离
        showMarker: false, // 是否显示定位点
        // zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
        useNative: false, // 是否使用安卓SDK辅助定位
        // 自定义定位点样式，同Marker的Options
        markerOptions: {
          offset: [-18, -36],
          anchor: 'center'
        },
        showCircle: false, // 是否显示定位精度圈
        // 定位精度圈的样式
        circleOptions: {
          strokeColor: '#0093FF',
          noSelect: true,
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: '#02B0FF',
          fillOpacity: 0.25
        }
      }
      AMap.plugin(['AMap.Geolocation'], function () {
        const geolocation = new AMap.Geolocation(options)
        geolocation.getCurrentPosition(function (status, result) {
          //console.log(status, result)
          if (status === 'complete') {
            // 高德坐标
            _this.myCoordinate = {
              lng: result.position.lng,
              lat: result.position.lat
            }

            // 逆向地理编码方法
            const geocoder = new AMap.Geocoder({
              // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
              // city: '010'
            })
            const lnglat = [result.position.lng, result.position.lat]
            geocoder.getAddress(lnglat, function (status, result) {
              //console.log(status, result)
              if (status === 'complete' && result.info === 'OK') {
                // result为对应的地理位置详细信息
                _this.myPosition = result.regeocode.formattedAddress
              }
            })
            setTimeout(() => {
              _this.checkInDakaAreas(flag)
            }, 300)
          } else {
            // _this.myPosition = '获取当前定位失败，点击“重新定位”再次尝试'
            if (dd.env.platform === 'notInDingTalk') {
              _this.myPosition = result.message
              _this.$toast('获取当前定位失败，点击“重新定位”再次尝试')
            } else {
              // this.handleDdPermission(AMap, map, flag)
              this.getDdLocation(AMap, map, '', flag)
            }
          }
        })
      })
    },

    // 获取当前定位——钉钉，body：鉴权接口的返回值
    getDdLocation(AMap, map, flag, isSingle) {
      const avatar = this.$store.state.app.photo
      const icon = new AMap.Icon({
        size: [30, 30],
        image: avatar,
        imageSize: [30, 30]
      })

      if (isSingle) {
        this.getDdSingleLoc(map, flag, icon)
      } else {
        this.getDdContinueLoc(AMap, map, flag, icon)
      }
    },

    // 钉钉获取单次定位
    getDdSingleLoc(AMap, map, flag) {
      const _this = this
      _this.myPosition = '正在获取定位...'
      dd.device.geolocation.get({
        targetAccuracy: 200, // 期望定位经度半径单位米，推荐采用200m
        coordinate: 1, // 1：获取高德坐标；0：获取标准坐标
        withReGeocode: true, // 是否需要带有你地理编码信息
        useCache: false, // 是否缓存地理位置信息，默认true
        onSuccess: function (result) {
          // 调用成功时回调
          console.log('单次定位res', result)
          // 删除上一次的位置图标
          if (_this.position) {
            _this.position.setMap(null)
            _this.position = null
          }
          // 高德坐标
          _this.myCoordinate = {
            lng: result.longitude,
            lat: result.latitude
          }
          _this.position = new AMap.Marker({
            position: [result.longitude, result.latitude]
          })
          // _this.myPosition = result.address
          // 若单次定位无地址结果则用经纬度逆地理编码获取
          if (result.address === '') {
            const params = {
              longitude: result.longitude,
              latitude: result.latitude
            }
            _this.handleNullPosition(params)
          } else {
            _this.myPosition = result.address
          }
          setTimeout(() => {
            _this.checkInDakaAreas(flag)
          }, 300)
        },
        onFail: function (err) {
          _this.myPosition = '正在获取定位...'
          // 调用失败时回调
          console.log('单次定位err', err)
          _this.myPosition = '获取当前定位失败，请点击蓝色定位标志获取位置'
        }
      })
    },

    // 处理定位地址不存在的情况
    handleNullPosition(data) {
      // console.log(data);
      const _this = this
      window._AMapSecurityConfig = {
        securityJsCode: '3d6c821aa4b94a39e25e89141d8c1bdf'
      }
      AMapLoader.load({
        key: 'e58f9334d511a8bd0f8a4423bb8d8114', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.Geocoder'] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then(AMap => {
        // 逆向地理编码方法
        const geocoder = new AMap.Geocoder({
          // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
          // city: '010'
        })
        const lnglat = [data.longitude, data.latitude]
        geocoder.getAddress(lnglat, function (status, result) {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            _this.myPosition = result.regeocode.formattedAddress
          }
        })
      })
    },

    //判断是否在打卡电子围栏内
    checkInDakaAreas(flag) {
      if (this.switchValue) {
        // 外勤默认在电子围栏之内
        this.canSign = true
      } else {
        // 内勤打卡 高德API判断员工是否在打卡范围内
        var point = this.myCoordinate // 高德经纬度坐标集合
        var isPointInRing = AMap.GeometryUtil.isPointInRing(point, this.polygonPath)
        this.canSign = isPointInRing
      }
    },

    // 钉钉停止连续定位
    stopDdContinueLoc() {
      // alert('停止连续定位' + this.random)
      const _this = this
      dd.device.geolocation.stop({
        sceneId: _this.random, // 需要停止定位场景id
        onSuccess: function (result) {
          // alert('停止成功')
          console.log('停止连续定位', result)
        },
        onFail: function (err) {
          console.log('停止连续定位err', err)
        }
      })
    },

    // 钉钉获取连续定位
    getDdContinueLoc(AMap, map, flag, icon) {
      // alert('连续定位' + this.random)
      const _this = this
      _this.myPosition = '正在获取定位...'
      dd.device.geolocation.start({
        targetAccuracy: 5, // 期望定位经度半径单位米，推荐采用200m
        iOSDistanceFilter: 5, // 变更感知精度(iOS端参数)
        useCache: false, // 是否使用缓存(Android端参数)，默认为true
        callBackInterval: 5000, // 回传时间间隔，ms
        sceneId: _this.random, // 定位场景id,
        coordinate: 1, // 1：获取高德坐标；0：获取标准坐标
        withReGeocode: true, // 是否需要带有你地理编码信息
        onSuccess: function (result) {
          // if (result.resultCode == '0') {
          // alert('位置：' + result.longitude + ';' + result.latitude)
          // }
          if (_this.position) {
            _this.position.setMap(null)
            _this.position = null
          }
          // map.clearMap()
          // flag ? _this.getRanges(AMap) : ''
          // 调用成功时回调
          console.log('连续定位res', result)
          // 高德坐标
          _this.myCoordinate = {
            lng: result.longitude,
            lat: result.latitude
          }
          _this.position = new AMap.Marker({
            position: [result.longitude, result.latitude],
            icon: icon
          })
          map.add(_this.position)
          map.setFitView(_this.position)
          map.setZoom(15)
          // _this.myPosition = result.address
          // 如果连续定位地址为空则不赋值，提示重新定位，用单次定位地址
          if (result.address !== '') {
            _this.myPosition = result.address
          }
          _this.checkInDakaAreas(flag)
        },
        onFail: function (err) {
          // 调用失败时回调
          console.log('持续定位err', err)
          _this.myPosition = '获取当前定位失败，请点击蓝色定位标志获取位置'
        }
      })
    },

    beforeRouteLeave(to, from, next) {
      // alert('停止定位' + this.random)
      const _this = this
      if (dd.env.platform !== 'notInDingTalk') {
        dd.device.geolocation.stop({
          sceneId: _this.random, // 需要停止定位场景id
          onSuccess: function (result) {
            console.log('停止连续定位', result)
            next()
          },
          onFail: function (err) {
            console.log('停止连续定位err', err)
            _this.$toast('应用异常，3秒后自动退出')
            setTimeout(() => {
              closeDD()
            }, 3000)
          }
        })
      } else {
        next()
      }
      this.$destroy()
    },

    // 延迟一秒钟
    async sleepOneSecond() {
      await this.sleep(1000)
    },

    // 如果已经打了两次卡了，那么打卡操作的标志就变成了更新打卡
    checkCondition() {
      if (this.dakaDetailArray.length >= 2) {
        this.flag = 'update' // 正常打卡flag=normal，当存在两次打卡记录，flag变为update
      }
    },

    // 打卡操作，点击点卡按钮事件
    handleDaKa() {
      // 首先获取位置
      this.getRanges(this.AMap)

      if (this.myPosition === '正在获取定位...') {
        this.$toast('位置信息未加载完成，请稍后再试')
        return
      }

      this.checkCondition()
      this.dayDakaData = this.dayDakaModel // dayDakaModel 打卡计划
      const dayDakaData = this.dayDakaData
      const nowTime = getTodayTime() // hh:mm:ss
      const bdPosition = gd_bd(this.myCoordinate.lng, this.myCoordinate.lat) // 包含经纬度的坐标
      console.log('地图', bdPosition)
      // 有上班打卡记录，并且当前时间在上班时间后的四个小时之内，提示已经打卡
      this.openLocation(this.switchValue) // 外勤打卡标志位，默认是内勤，这个方法中没有用到
      // 区分驻外打卡、考勤打卡（根据路由传参lable）
      // 驻外打卡没有限制,考勤打卡根据接口数据做处理

      if (this.routeLable === 'outside') {
        // 外勤按钮会改变switchValue的值，进而改变routeLable
        if (this.dayDakaModel.legworkFlag) {
          // 用户的是否外勤的标志
          // 调用外勤打卡接口
          this.outsideDaka(dayDakaData, bdPosition)
        }
        this.$toast('没有外勤计划，请联系管理员')
        setTimeout(() => {
          this.switchValue = false
          this.getDayHistory()
          this.refresh()
        }, 2000)
      } else if (this.routeLable === 'inside') {
        // const { comeMustTime, leaveMustTime } = dayDakaData
        const details = this.$route.params.details // details 内勤打卡明细
        console.log(dayDakaData, details)
        if (details && details.length > 0) {
          const num = details.length - 1
          this.model = details[num] // 取最后一条内勤打卡记录，赋给model
        }
        const dateFormat1 = getToday() // yyyymmdd
        const dateFormat2 = getTodayTimeFormat() // hhmmss
        // 参数
        const params = {
          id: dayDakaData.id,
          ruleId: dayDakaData.ruleId,
          // 如果打卡计划不为空，取打卡计划中的打卡类型，为空设置为1自由打卡，0正常打卡
          signType: dayDakaData ? dayDakaData.signType : '1',
          isUpdate: this.flag === 'update' ? '1' : '', // 更新打卡标志
          signWay: 0, // 打卡方式 0正常 1自动
          commute: this.dakaModel.signType, // sign_file中的signType指的是上班还是下班 0 上班 1下班
          uniqueCode: uuid(), // 设备编码
          // rootVal // 是否越狱
          remarks: this.reasonValue, // 打卡原因
          paramVal: this.$encryptDes(dateFormat2, dateFormat1), // 时间加密
          isLastDay: this.flag === 'last' ? '1' : '' // 是否最终打卡
        }
        if (params.commute === 0) {
          // 打上班卡的情况
          params.comeTime = nowTime
          params.comeLatitude = bdPosition.lat
          params.comeLongitude = bdPosition.lng
          params.comeAddress = this.myPosition
        } else {
          // 打下班卡的情况
          params.leaveTime = nowTime
          params.leaveLatitude = bdPosition.lat
          params.leaveLongitude = bdPosition.lng
          params.leaveAddress = this.myPosition
        }
        // 1、检查是否在定位范围（根据定位状态判断）
        if (this.canSign === false) {
          this.$dialog.alert({
            title: '提示',
            message: '当前位置不在考勤范围内，请检查是否开启位置权限后，点击重新定位'
          })
          return
        }
        // 2、是否限制打卡有提示（暂未使用）
        // handpunch 是否限制打卡，1：限制 ，2不限制
        if (this.dayDakaData.handpunch === '1' && this.reasonValue === '') {
          this.$toast('请先填写打卡理由')
          return
        }
        // 判断是否需要上传图片（暂未使用）
        if (dayDakaData.photographClock === '0') {
          this.$toast('缺少照片，请上传照片')
          return
        }
        this.insideDaka(params)
      }
      // 打卡完成后，重新加载打卡记录展示到页面
      this.getNormalDakaModel() // 这种类似的方法都是获取最新的数据，展示到页面上
    },

    openLocation(flag) {
      // flag 用于区分正常打卡normal，昨日打卡last和更新打卡update
      const currentTime = new Date()
      const beforeNoonTime = new Date()
      // dakaModel 打卡统计sign_file
      console.log('shijian', this.dakaModel.comeMustTime)
      const [hours, minutes] = this.dakaModel.comeMustTime.split(':') // 将字符串以":"分割为小时和分钟
      // beforeNoonTime 上班时间加了四个小时
      beforeNoonTime.setHours(parseInt(hours) + 4, minutes, 0)
      // 如果dakaDetailArray中的内容有一个满足后面的条件，hasSignType0Or2就为true
      // 内勤打卡记录表中的sign_type，0是上班，1是下班，2是外勤
      const hasSignType0Or2 = this.dakaDetailArray.some(item => item.signType === '0' || item.signType === '2')
      console.log('+++++++++++1', hasSignType0Or2)
      console.log('+++++++++++2', currentTime)
      console.log('+++++++++++3', beforeNoonTime)
      console.log('+++++++++++4', currentTime < beforeNoonTime)
      // 有上班打卡记录，并且当前时间在上班时间后的四个小时之内，提示已经打卡，上班不允许打两次卡
      if (hasSignType0Or2 && currentTime < beforeNoonTime) {
        this.$toast('您已经打过卡了，请不要重复打卡')
        return
      }
    },

    //获取当天打卡计划信息
    getTodayDaka() {
      const params = {}
      getSignInfo(params)
        .then(data => {
          //debugger
          //有打卡计划，设置表单部分信息
          if (data.code === 200) {
            this.dayDakaModel = data // dayDakaModel 打卡计划sign_next
            this.signType = data.signType // 固定还是自由打卡
            this.ruleName = data.ruleName
            this.isMust = data.isMust // 是否必须打卡
            this.getDayHistory()
          } else if (data.code === 404) {
            //没有打卡计划
            this.ruleName = '综合打卡'
            this.getDayHistory()
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    insideDaka(data) {
      saveSignInfo(data)
        .then(data => {
          if (data.code !== 500) {
            this.$toast('打卡成功')
            setTimeout(() => {
              // this.$router.back()
              this.$store.dispatch('setIsMap', 1)
              this.getDayHistory()
              this.refresh()
              // this.$router.replace({
              //   name: 'Inside'
              // })
              // this.$router.go(-1) // 地图replace之后要返回两次的问题
            }, 2000)
          } else {
            this.$toast('您已经打过卡了，请不要重复打卡')
            this.dakaColor = 'linear-gradient(to bottom, #FFD6AF, #f3a24e)'
            this.dakaShadow = 'daka-unable-shadow'
            setTimeout(() => {
              // this.$router.back()
              this.$store.dispatch('setIsMap', 1)
              this.getDayHistory()
              this.refresh()
              // this.$router.replace({
              //   name: 'Inside'
              // })
              // this.$router.go(0) // 地图replace之后要返回两次的问题
            }, 2000)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 驻外打卡，外勤打卡
    outsideDaka(dayDakaData, position) {
      if (
        this.canSign === false ||
        this.myPosition === '获取当前定位失败，点击“重新定位”再次尝试' ||
        this.myPosition === '正在获取定位...' ||
        this.myPosition === ''
      ) {
        this.$toast('请重新获取定位')
        return
      }

      const dateFormat1 = getToday() // yyyymmdd
      const dateFormat2 = getTodayTimeFormat() // hhmmss
      const params = {
        id: dayDakaData.id,
        // userId: dayDakaData.userId,
        paramVal: this.$encryptDes(dateFormat2, dateFormat1), // 打卡时间加密 yyyymmdd hh:mm:ss
        signTime: getTodayTime(), // 打卡时间 hh:mm:ss
        signLatitude: position.lat, // 纬度
        signLongitude: position.lng, // 经度
        uniqueCode: uuid(), // 设备编码 暂时使用uuid
        clockInSite: this.myPosition, // 地址的地理名字，比如xx市xx区xx街道
        rootVal: null, // 是否越狱
        remarks: this.reasonValue, // 备注，打卡原因，暂时未用到
        groupId: dayDakaData.groupId
      }
      saveSignLegwork(params)
        .then(data => {
          if (data) {
            this.$toast('打卡成功')

            // 赋值——限制驻外打卡成功返回之后一分钟不允许再进入驻外打卡页面
            this.$store.dispatch('setOneMinLimit', true)
            setTimeout(() => {
              // this.$router.back()
              this.$store.dispatch('setIsMap', 1)
              this.getDayHistory()
              this.switchValue = false
            }, 2000)
          } else {
            this.$toast('您已经打过卡了，请不要重复打卡')
            this.dakaColor = 'linear-gradient(to bottom, #FFD6AF, #f3a24e)'
            this.dakaShadow = 'daka-unable-shadow'
            setTimeout(() => {
              // this.$router.back()
              this.$store.dispatch('setIsMap', 1)
              // this.$router.replace({
              //   name: 'Outside'
              // })
              // this.$router.go(-1) // 地图replace之后要返回两次的问题
              this.getDayHistory()
              this.switchValue = false
            }, 2000)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    getDayHistory() {
      const params = {
        signDay: getTodayFormat() //获取yyyy-mm-dd格式的当日日期
        // nextId: this.dayDakaModel.id
      }
      getSignDayHistoryNew(params)
        .then(data => {
          //debugger
          if (data.code === 200) {
            //debugger
            this.dakaModel = data // 查询用户当日的打卡统计sign_file，其中包括内外勤打卡明细
            this.signType = data.signType // 固定/自由
            this.ruleName = data.ruleName
            this.isMust = data.isMust
            this.handleData(data)
          } else {
            this.ruleName = '综合打卡'
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 处理打卡数据
    handleData(dakaModel) {
      // debugger
      // signType打卡类型：0固定；1自由
      if (dakaModel.signType === '0') {
        // 当打卡规则为固定打卡时，判断字段isQuartic是否四次打卡：0 否；1 是；
        // 四次打卡就是上午上下班和下午上下班都要打卡
        if (dakaModel.isQuartic === '1') {
          this.getFreeDakaModel(dakaModel) // 自由打卡
        } else {
          this.getNormalDakaModel(dakaModel)
        }
      } else if (dakaModel.signType === '1') {
        this.getFreeDakaModel(dakaModel)
      } else {
        // 没有打卡规则
        this.dayDakaModel.signType = '1' //自由打卡
        this.dayDakaModel.photographClock = '0' // 0开启 1停用
        this.dayDakaModel.locationClock = '0'
        this.getFreeDakaModel(dakaModel)
      }
      // this.handleHistoryData(dakaModel)
      // this.getNormalDakaModel_20230713(dakaModel)
    },

    handleHistoryData(dakaModel) {
      if (dakaModel) {
        // 判断是否是自由打卡 1是 0不是
        if (this.signType === '1') {
          // 获取打卡记录信息
          this.dakaDetailArray = dakaModel.details
        } else if (this.signType === '0') {
          this.dakaDetailArray = []
          let model, model1
          if (dakaModel.comeMustTime == null) {
            this.dakaDetailArray = dakaModel.details
            return
          }
          if (!dakaModel.comeTime || dakaModel.comeTime === '') {
            model = {
              signType: 0, // 上班
              isNow: false,
              style: 1,
              signWay: dakaModel.signWay,
              signDate: dakaModel.signDate,
              workTime: dakaModel.comeMustTime
            }
            this.dakaDetailArray[0] = model
          } else {
            model = {
              signType: 0, // 上班
              isNow: false,
              signWay: dakaModel.signWay,
              signDate: dakaModel.signDate,
              signTime: dakaModel.comeTime,
              workTime: dakaModel.comeMustTime
            }
            this.dakaDetailArray[0] = model
          }
          if (!dakaModel.leaveTime || dakaModel.leaveTime === '') {
            model1 = {
              signType: 1, // 下班
              isNow: false,
              style: 1,
              signDate: dakaModel.signDate,
              workTime: dakaModel.leaveMustTime
            }
            this.dakaDetailArray.push(model1)
          } else {
            model1 = {
              signType: 1, // 下班
              isNow: false,
              signDate: dakaModel.signDate,
              signTime: dakaModel.leaveTime,
              workTime: dakaModel.leaveMustTime
            }
            this.dakaDetailArray.push(model1)
          }
          // console.log(this.dakaDetailArray)
          // 固定打卡时 添加上班时间和下班时间
          if (this.dakaDetailArray.length !== 0) {
            this.dakaDetailArray.forEach(item => {
              if (item.signType === '0') {
                item.workTime = dakaModel.comeMustTime
              } else {
                item.workTime = dakaModel.leaveMustTime
              }
            })
          }
          // 0：正常  1：缺卡  2：迟到  3：早退  4：外勤
          // 判断后台是否归档
          // 如果没有归档 三天以内的数据没有归档  通过返回model 添加上下班数据
          if (!dakaModel.status || dakaModel.status === '') {
            if (this.dakaDetailArray.length !== 0) {
              var flag = 0
              this.dakaDetailArray.forEach(item => {
                // eslint-disable-next-line eqeqeq
                if (item.signType == '0') {
                  // 如果为上午
                  // 判断时候缺卡
                  // if (!dakaModel.comeTime || dakaModel.comeTime === '') {
                  //   item.style = '1' // 缺卡
                  //   flag = flag + 1
                  // } else {
                  //   // 判断是否迟到（比较时间大小）
                  //   if (compareTime(dakaModel.comeTime, dakaModel.comeMustTime)) {
                  //     item.style = '2'
                  //     flag = flag + 1
                  //   } else {
                  //     model.style = '0'
                  //     flag = flag + 1
                  //   }
                  // }
                } else {
                  // 如果为下午
                  // 判断时候缺卡
                  if (!dakaModel.leaveTime || dakaModel.leaveTime === '') {
                    model.style = '1' // 缺卡
                    flag = flag + 1
                  } else {
                    if (compareTime(dakaModel.leaveTime, dakaModel.leaveMustTime) === false) {
                      item.style = '3'
                      flag = flag + 1
                    } else {
                      item.style = '0'
                      flag = flag + 1
                    }
                  }
                  console.log(flag)
                }
              })
            }
          } else {
            if (this.dakaDetailArray.length !== 0) {
              this.dakaDetailArray.forEach(item => {
                if (dakaModel.status === '1') {
                  if (item.signType === '0') {
                    item.style = '2' // 迟到
                    return
                  }
                } else if (dakaModel.status === '2') {
                  if (item.signType === '1') {
                    item.style = '3' // 早退
                    return
                  }
                } else if (dakaModel.status === '3') {
                  if (item.signType === '0') {
                    item.style = '2' // 迟到
                  } else if (item.signType === '1') {
                    item.style = '3' // 早退
                  }
                } else if (dakaModel.status === '10') {
                  if (item.signType === '0' || item.signType === '1') {
                    item.style = '1' // 缺卡
                  }
                } else if (dakaModel.status === '11') {
                  if (item.signType === '0') {
                    item.style = '1' // 缺卡
                    return
                  }
                } else if (dakaModel.status === '12') {
                  if (item.signType === '1') {
                    item.style = '1' // 缺卡
                    return
                  }
                } else if (dakaModel.status === '40') {
                  if (item.signType === '0' || item.signType === '1') {
                    item.style = '4' // 外勤
                  }
                } else if (dakaModel.status === '50') {
                  if (item.signType === '0' || item.signType === '1') {
                    item.style = '5' // 外勤
                  }
                }
              })
            }
          }
        }
      }
    },

    // 综合打卡
    getFreeDakaModel(dakaModel) {
      //debugger
      this.dakaDetailArray = []
      const details = dakaModel.details //内勤打卡
      if (details && details.length > 2) {
        this.dakaDetailArray.push(details[0])
        this.dakaDetailArray.push(details[1])
        let lastModel = this.dakaDetailArray[1]
        for (let i = 2; i < details.length; i++) {
          const model = details[i]
          if (lastModel.signType === '1' && model.signType === '1') {
            this.dakaDetailArray[i - 1] = model
          } else {
            this.dakaDetailArray.push(model)
          }
          lastModel = model
        }
      } else {
        this.dakaDetailArray = details
      }
    },

    // 固定打卡
    // 打卡完成后，进入这个方法是空参的
    // dakaModel sign_file
    getNormalDakaModel(dakaModel) {
      // details 内勤打卡 legworkDetails 外勤打卡
      this.dakaDetailArray = [] // 所有的打卡记录数组
      this.ruleId = dakaModel.ruleId
      let model, model1, legModel // 分别是上班的情况、下班的情况、外勤的情况
      let details = dakaModel.details //内勤打卡明细
      const legWorkDetails = dakaModel.legWorkDetails //外勤打卡明细
      if (details && details.length > 0) {
        details = details.filter(item => {
          return item.isLegWork !== '1' // 筛选出内勤打卡的记录
        })
      }

      // eslint-disable-next-line prefer-const
      // sign_file 中的signType指的是上下班，0上班1下班
      model = {
        signType: '0', // 上班
        isNow: true,
        signWay: dakaModel.signWay, // 打卡方式 正常打卡 自动打卡
        signDate: dakaModel.signDate, // 打卡日期
        workTime: dakaModel.comeMustTime, //上班时间
        signTime: null, // 打卡时间
        signAddress: null, // 打卡地址
        style: ''
      }
      // eslint-disable-next-line prefer-const
      model1 = {
        signType: '1', // 下班
        isNow: true,
        workTime: dakaModel.leaveMustTime, // 下班时间
        signTime: null,
        signAddress: null,
        signWay: dakaModel.signWayPm, // 下班打卡方式 正常打卡 自动打卡
        signDate: dakaModel.signDate,
        style: ''
      }

      switch (details.length) {
        case 1: // 记录中有一条打卡记录，那就是打的上班卡
          model.style = details[0].flag // 这个flag是正常打卡、最终打卡、更新打卡
          if (details[0].signType === '0') {
            // 打的上班卡
            model.signTime = dakaModel.comeTime //打卡时间是来的时间
            model.signAddress = dakaModel.comeAddress
            model.isNow = false
            model.style = details[0].flag
            this.dakaDetailArray.push(model) // dakaDetailArray 内勤打卡
          } else {
            // 打的下班卡
            model1.isNow = false
            model1.signTime = dakaModel.leaveTime
            model1.signAddress = dakaModel.leaveAddress
            model1.style = details[0].flag
            this.dakaDetailArray.push(model1)
            this.dakaDetailArray.push(model)
          }
          break
        default:
          // eslint-disable-next-line no-redeclare
          for (var i = 0; i < details.length; i++) {
            if (details[i].signType === '0') {
              // 上班卡
              model.signTime = dakaModel.comeTime
              model.signAddress = dakaModel.comeAddress
              model.isNow = false
              model.style = details[i].flag
            } else {
              // 下班卡
              model1.isNow = false
              model1.signTime = dakaModel.leaveTime
              model1.signAddress = dakaModel.leaveAddress
              model1.style = details[i].flag
            }
          }
          this.dakaDetailArray.push(model)
          this.dakaDetailArray.push(model1)
      }

      // 外勤
      if (legWorkDetails != null) {
        const legWorkDetailsLength = legWorkDetails.length
        if (legWorkDetails && legWorkDetailsLength > 0) {
          // eslint-disable-next-line no-redeclare
          for (var i = 0; i < legWorkDetailsLength; i++) {
            legModel = {
              signType: '2', // sign_file 中的sign_type 0上班1下班2外勤
              isNow: true,
              signWay: '0', //打卡方式 正常打卡 自动打卡
              signDate: legWorkDetails[i].creationDate,
              workTime: null,
              signTime: legWorkDetails[i].signTime,
              signAddress: legWorkDetails[i].clockInSite,
              style: 4
            }
          }
          this.dakaDetailArray.push(legModel)
        }

        const filterArray = this.dakaDetailArray.filter(item => item.signType !== '0' || item.signType === '2')
        // 筛选出下班或者是外勤的
        this.dakaDetailArray = filterArray
      }

      this.refresh(true)
      // 大于两条取消定时操作，意思是当用户的打卡记录超过两条，表明今天用户已经打完上下班的卡了，不需要在定时刷新获取位置了
      // 今天的打卡操作已经完成了，节省服务器资源
      if (this.dakaDetailArray.length >= 2) {
        clearInterval(this.schedule)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.inside {
  box-sizing: border-box;
  font-size: 14px;
  margin-bottom: 75px; // 50+15+10
  height: 80%;

  .top {
    position: relative;

    .bg {
      width: 100%;

      img {
        width: 100%;
      }
    }

    .rule {
      position: absolute;
      top: 95%;
      left: 5%;
      display: flex;
      background-color: #ffffff;
      width: 90%;
      height: 60px;
      line-height: 60px;
      margin: 0 auto;
      border-radius: 10px;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);

      .blue {
        margin: auto 0;
        width: 5px;
        height: 60%;
        line-height: 60%;
        border-radius: 2px;
        background-color: #4e89f3;
      }

      .desc {
        font-size: large;
        padding: 0 15px;
      }
    }
  }

  .today {
    position: relative;
    box-sizing: border-box;
    width: 96%;
    //max-height: 250px;
    margin: -30px auto 0;
    background-color: #ffffff;
    border-radius: 10px;
    padding-bottom: 17px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);

    .head {
      font-size: large;
      font-weight: 600;
      padding: 10px 12px;
      height: 50px;
      line-height: 20px;
      padding-top: 30px;
    }

    .title {
      font-size: large;
      padding: 10px;
      height: 30px;
      display: flex;
      align-items: center;
      .left {
        width: 30%;
        text-align: center;
        font-size: 14px;
        color: #c0bfc0;
      }

      .right {
        width: 50%;
        font-size: 14px;
        font-weight: bolder;
        color: #c0bfc0;
        line-height: 21px;
        overflow: auto;
        .icon-son {
          width: 20px;
          height: 20px;
          vertical-align: middle;
        }
        .icon-moon {
          width: 14px;
          height: 14px;
          vertical-align: middle;
        }
      }

      .check-box {
        width: 20%;
        align-items: center;
        margin-left: auto;
        display: flex;
        .check-label {
          font-size: 14px;
          font-weight: bolder;
        }
      }
    }

    .records {
      max-height: 160px;
      overflow: scroll;

      &-box {
        display: flex;
        box-sizing: border-box;
        padding: 0 15px 0 0;
        margin-bottom: 1px;

        .left {
          flex: 1;
          text-align: right;
          color: #c0bfc0;
          padding-right: 8px;
          font-size: 14px;
          font-weight: 400;
          // .type {}
        }

        .mid {
          flex: 0.3;
          display: flex;
          flex-direction: column;
          height: 100px;
          margin-right: 5px auto;

          .line {
            flex: 0.8;
            width: 1px;
            height: 100px;
            border-left: #c7cacf 2px dashed;
            margin: 5px auto 0;
          }

          .node {
            flex: 0.2;
            border: 1px;
            border-radius: 50%;

            display: flex;

            img {
              padding-top: 5px;
              padding-left: 2px;
              width: 15px;
              height: 15px;
            }
          }
        }

        .right {
          position: relative;
          flex: 4;
          padding-left: 10px;

          .DakaTime {
            font-size: 14px;
            font-weight: bold;
          }

          .update {
            position: absolute;
            font-size: 14px;
            color: #1989fa;
          }

          .status-box {
            display: flex;
            font-size: larger;
            justify-content: flex-end;

            .status-img {
              width: 20px;
              height: 20px;
              margin-right: 5px;
            }

            .normal {
              color: #1989fa;
            }
          }

          .address {
            font-size: 13px;
            box-sizing: border-box;
            max-height: 100px;
            height: auto;
            padding: 5px;
            margin-top: 5px;
            overflow: scroll;
            color: #c0bfc0;
          }
        }
      }
    }

    .none {
      height: 80%;
      display: flex;
      justify-content: center;

      img {
        height: 120px;
      }

      .records {
        height: 120px;
        line-height: 120px;
        color: #aaaaaa;
        margin-left: 10px;
      }
    }

    .location {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 20px;

      .center-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70%;
      }

      .position-info {
        margin-left: 4px;
        font-size: 14px;
        color: #767676;
        resize: none;
        overflow: auto; /* 自动显示滚动条，但只有在需要时才显示 */
        resize: none; /* 禁止用户调整元素大小 */
      }

      .location-icon {
        width: 35px;
        height: 35px;
      }

      .flash-icon {
        width: 24px;
        height: 24px;
      }
    }

    .clock {
      width: 50%;
      bottom: 0;
      left: 50%;
      transform: translateX(50%);

      .van-button {
        height: 50px;

        &__content {
          font-size: 14px;
          font-weight: bolder;
        }
      }
    }
  }
}

.gray-button {
  background-color: #cccccc;
}

.inside-scroll {
  margin-bottom: 130px; // 35+35+10+50
}
</style>

