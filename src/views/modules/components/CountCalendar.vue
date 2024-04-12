<!-- 考勤统计组件 -->
<template>
  <div class="count-calender">
    <div class="title">
      <div class="now">{{ nowMonth }}月考勤</div>
      <!-- <div class="last" @click="openLastMonth">
        <van-icon name="orders-o" size="18" />
        <div>{{ lastMonth }}月考勤记录</div>
      </div> -->
    </div>

    <br />

    <div class="calendar">
      <vc-calendar
        ref="calendar"
        is-expanded
        :disablePageSwipe="handlePageSwipe"
        :attributes="attrs"
        @update:to-page="handleUpdate"
      />
      <!-- 关闭了日期点击功能 @dayclick="onDayClick" -->
    </div>

    <div class="color-list">
      <ul>
        <div class="color" v-for="(item, index) in colorList" :key="index">
          <div class="color-block" :style="{ backgroundColor: item.color }"></div>
          <div class="color-desc">{{ item.desc }}</div>
        </div>
      </ul>
    </div>

    <!-- <div class="ps">
      注：点击打卡异常的日期可以申请补卡<br />
      <p></p>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;点击今天及以后的日期可以申请请假<br />
      <p></p>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;正常状态包含正常打卡和补卡申请通过
    </div> -->
  </div>
</template>

<script>
import { getSignInfoByMonth, applyRepairSign, applyLeaveSign } from '@/api/clock.js'
import Calendar from './v-calendar/src/components/Calendar'

import Vue from 'vue'
import { Picker } from 'vant'
import { Popup } from 'vant'

Vue.use(Popup)
Vue.use(Picker)

export default {
  props: {},
  components: { 'vc-calendar': Calendar },
  data() {
    // const date = new Date()
    // const year = date.getFullYear()
    // const month = date.getMonth()

    return {
      calendar: null,
      nowMonth: null, // 当前月
      lastMonth: null, // 上个月
      colorList: [
        { color: '#a1dfb1', desc: '正常' },
        { color: '#ff9999', desc: '异常' },
        
        // { color: '#afd9ff', desc: '请假' },
        // { color: '#ffd7af', desc: '申请补卡' },
        // { color: '#ffff00', desc: '申请请假' }
        // { color: '#afd9ff', desc: '请假公出/出差' }
      ],
      attrs: [
        {
          key: 'normal', // 正常
          highlight: {
            color: 'green',
            fillMode: 'solid', // 颜色填充的形式
            class: 'test', // 高亮背景元素的类
            style: {
              borderRadius: '2px',
              backgroundColor: '#a1dfb1'
            }, // 高亮背景元素的样式
            contentClass: 'italic', // 添加突出显示内容元素的类
            contentStyle: {} // 突出显示内容元素的样式
          },
          dates: []
        },
        {
          key: 'abnormal', // 异常
          highlight: {
            color: 'red',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#FF9999'
            }
          },
          dates: []
        },
        {
          key: 'leave', // 请假公出
          highlight: {
            color: 'blue',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#afd9ff'
            }
          },
          dates: []
        },
        {
          key: 'business', // 出差
          highlight: {
            color: 'blue',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#ffd7af'
            }
          },
          dates: []
          // dates: [
          //   new Date(year, month, 15), // Jan 1st
          //   new Date(year, month, 16), // Jan 10th
          //   new Date('2022-06-01') // Jan 22nd
          // ]
        },
        {
          key: 'nothing',
          highlight: {
            color: 'gray',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#eeeeee'
            }
          },
          dates: []
        },
        {
          key: 'repair', // 补卡
          highlight: {
            color: 'green',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#ffd7af'
            }
          },
          dates: []
        },
        {
          key: 'askleave', // 申请请假
          highlight: {
            color: 'green',
            fillMode: 'solid',
            style: {
              borderRadius: '2px',
              backgroundColor: '#ffff00'
            }
          },
          dates: []
        }
      ]
    }
  },

  computed: {
    handlePageSwipe() {
      const day = new Date().getDate()
      if (day >= 1 && day <= 2) {
        return false
      } else {
        return true
      }
    }
  },

  created() {},

  mounted() {
    this.getNowMonth()
  },

  methods: {
    // 请假流程
    onConfirm(value) {
      this.value = value
      this.showPicker = false
    },

    // 装配月份数据
    getNowMonth() {
      var date = new Date()
      this.nowMonth = date.getMonth() + 1
      this.lastMonth = date.getMonth()
    },

    // update:from-page，参数fromPage和update:to-page，参数：toPage
    handleUpdate(val) {
      this.nowMonth = val.month
      this.$emit('change-month', val)
    },

    // 跳转上月记录
    // goLastRecord() {
    //   this.$router.push({
    //     name: 'LastRecord'
    //   })
    // },

    //跳转上月记录
    openLastMonth() {
      localStorage.setItem('goLastMonth', '1')
      // window.open('http://mpprod.weichai.com:8090/filepath/static/h5DDwebapp/yuedukaoqinProd/#/?fromDaka=1', '_self')
    },

    // 异常提示逻辑
    getToast(signStatus, date, type) {
      let signDesc = ''
      if (signStatus === '1') {
        // this.$toast('迟到')
        signDesc = '迟到'
      } else if (signStatus === '2') {
        // this.$toast('早退')
        signDesc = '早退'
      } else if (signStatus === '10') {
        // this.$toast('全天缺卡')
        signDesc = '全天缺卡'
      } else if (signStatus === '11') {
        // this.$toast('上午缺卡')
        signDesc = '上午缺卡'
      } else if (signStatus === '12') {
        // this.$toast('下午缺卡')
        signDesc = '下午缺卡'
      } else {
        signDesc = '暂无记录'
      }

      if (type === 'abnormal') {
        this.$dialog
          .confirm({
            title: date,
            message: '签到情况：' + signDesc,
            confirmButtonText: '申请补卡', //改变确认按钮上显示的文字
            cancelButtonText: '关闭' //改变取消按钮上显示的文字
          })
          .then(() => {
            const params = {
              date: date,
              type: 'abnormal'
            }
            applyRepairSign(params)
              .then(data => {
                if (data > 0) this.$toast('补卡申请成功！')
                // this.$router.go(0)
                setTimeout(() => {
                  window.location.reload()
                }, 500) // 延迟1秒显示Toast
              })
              .catch(err => {
                console.log(err)
                this.$toast('补卡申请失败！')
              })
          })
          .catch(() => {
            // console.log('点击了取消按钮')
          })
      } else if (type === 'nothing') {
        this.$dialog
          .confirm({
            title: date,
            message: '签到情况：' + signDesc,
            confirmButtonText: '请假', //改变确认按钮上显示的文字
            cancelButtonText: '关闭' //改变取消按钮上显示的文字
          })
          .then(() => {
            const params = {
              date: date,
              type: 'nothing'
            }
            applyRepairSign(params)
              .then(data => {
                if (data > 0) this.$toast('请假申请成功！')
                // this.$router.go(0)
                setTimeout(() => {
                  window.location.reload()
                }, 500) // 延迟1秒显示Toast
              })
              .catch(err => {
                console.log(err)
                this.$toast('请假申请失败！')
              })
          })
          .catch(() => {
            // console.log('点击了取消按钮')
          })
      }
    },

    // 日历模块点击
    onDayClick(day) {
      const id = day.id
      console.log('****', id.substring(0, 7))
      if (day.attributes[0].key === 'abnormal' || day.attributes[0].key === 'nothing') {
        const params = {
          month: id.substring(0, 7) // yyyy-mm
        }
        getSignInfoByMonth(params)
          .then(data => {
            const _this = this
            data &&
              data.forEach(item => {
                if (item.signMonth === id) {
                  _this.getToast(item.signStatus, day.id, day.attributes[0].key)
                }
              })
          })
          .catch(err => {
            console.log(err)
          })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.count-calender {
  box-sizing: border-box;
  width: 100%;
  //height: 500px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px 15px 10px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
  .title {
    // display: flex;
    justify-content: space-between;
    .now {
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }
    .last {
      display: flex;
      color: #4e89f3;
    }
  }
  .color-list {
    display: flex;
    justify-content: space-between;
    .color {
      margin: 15px 2px;
      display: flex;
      &-block {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-right: 5px;
      }
    }
  }
  .ps {
    margin-top: 10px;
    font-size: 14px;
    color: #999999;
  }
}

::v-deep .calendar {
  .vc-container {
    height: inherit;
    border: 0;
    .vc-pane-container {
      .vc-header {
        display: none;
      }
      .vc-arrows-container {
        display: none;
      }
      .vc-day {
        &-content {
          color: #222222 !important;
          font-weight: 600 !important;
          &:focus {
            color: #222222;
            font-weight: 600;
          }
        }
      }
      .vc-weeks {
        padding: 5px 0;
        height: 280px;
      }
    }
  }
}
</style>
