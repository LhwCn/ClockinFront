<!-- 统计 -->
<template>
  <div class="count">
    <count-calendar ref="count-calender" @change-month="changeMonth"></count-calendar>
    <!-- <count-detail></count-detail>
     <div class="last-button">
       <van-button round type="info" size="large" color="#4e89f3" @click="openLastMonth">查看上月考勤记录</van-button>
     </div> -->
  </div>
</template>

<script>
import CountCalendar from './components/CountCalendar'
// import CountDetail from './components/CountDetail'
import { getSignInfoByMonth } from '@/api/clock.js'
import { isSunday } from '@/utils/dateFormat.js'
import qs from 'qs'
import { getCode, closeDD } from '@/utils/dingding.js'
import { getDdToken } from '@/api/clock.js'
import store from '../../store'

export default {
  components: { CountCalendar },
  data() {
    return {
      calendarData: [],
      normalList: [], // 正常
      abnormalList: [], // 异常
      leaveList: [], // 请假公出
      businessList: [], // 出差
      nothingList: [],
      repairList: [], //补卡
      askleaveList: [] //请假申请
    }
  },

  created() {},

  mounted() {},

  methods: {
    // v-calendar切换，重新获取当前月份的打卡数据
    changeMonth(val) {
      const month = val.year + '-' + (val.month >= 1 && val.month <= 9 ? '0' + val.month : val.month)
      // const month = '2023-08'
      this.getSignMonth(month)
    },

    getSignMonth(month) {
      const params = {
        month: month
        // month: '2023-08'
      }
      getSignInfoByMonth(params)
        .then(data => {
          this.calendarData = data
          this.formatMonthDate(this.calendarData)
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 对月度数据进行规则判断处理
    formatMonthDate(data) {
      data.forEach(item => {
        // 非工作日和工作日（是否是周天）
        if (isSunday(item.signMonth)) {
          // 判断异常打卡
          if (item.situation === '1') {
            this.abnormalList.push(new Date(item.signMonth))
          } else {
            this.nothingList.push(item.signMonth)
          }
        } else {
          if (item.isMust === '0') {
            // 工作日
            if (!item.situation || item.situation === '0') {
              if (item.isLeave === '1' || item.isLeave === '3') {
                // 1 请假、外勤
                this.leaveList.push(new Date(item.signMonth))
              } else if (item.isLeave === '2') {
                // 2 出差
                this.businessList.push(new Date(item.signMonth))
              } else {
                // 4 调休  5 补卡 (一些其他情况)  0 正常
                this.normalList.push(new Date(item.signMonth))
              }
            } else if (item.situation === '4' || item.situation === '5') {
              // 4 调休  5  补卡
              this.normalList.push(new Date(item.signMonth))
            } else if (item.situation === '2') {
              // situation 2 补卡申请
              this.repairList.push(new Date(item.signMonth))
            } else if (item.situation === '6') {
              // situation 6 请假申请
              this.askleaveList.push(new Date(item.signMonth))
            } else if (item.situation === '7') {
              // situation 7 请假
              this.leaveList.push(new Date(item.signMonth))
            } else {
              this.abnormalList.push(new Date(item.signMonth))
            }
          } else {
            this.nothingList.push(item.signMonth)
          }
        }
      })
      this.$refs['count-calender'].attrs[0].dates = this.normalList
      this.$refs['count-calender'].attrs[1].dates = this.abnormalList
      this.$refs['count-calender'].attrs[2].dates = this.leaveList
      this.$refs['count-calender'].attrs[3].dates = this.businessList
      this.$refs['count-calender'].attrs[4].dates = this.nothingList
      this.$refs['count-calender'].attrs[5].dates = this.repairList
      this.$refs['count-calender'].attrs[6].dates = this.askleaveList
    }
  }
}
// 修复iOS跨vue不走生命周期问题
window.addEventListener('pageshow', () => {
  if (localStorage.getItem('goLastMonth') == '1') {
    const _this = this
    getCode(code => {
      const loginForm = {
        code: code,
        sendBy: '501905df0b924bea868011f70a6f4dc3' // 正式
      }
      getDdToken(qs.stringify(loginForm))
        .then(data => {
          if (data.code === 200) {
            store.dispatch('setToken', data.body.access_token)
            localStorage.setItem('goLastMonth', '0')
          } else {
            this.$router.replace({
              name: 'Login'
            })
          }
        })
        .catch(err => {
          alert(JSON.stringify(err))
          closeDD()
        })
    })
  }
})
</script>

<style scoped lang="scss">
.count {
  box-sizing: border-box;
  padding: 15px;
  font-size: 14px;
}
.last-button {
  width: 100%;
}
.van-button--large {
  width: 80%;
  height: 40px;
  margin-top: 10px;
  margin-left: 10%;
}
</style>
