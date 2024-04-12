<!-- 统计请假组件 -->
<template>
<div class="count-detail">
  <van-collapse v-model="activeNames" class="count-collapse">
    <van-collapse-item :title="lastMonth + '月请假统计'" name="1" icon="records">
      <template #value>
        <div v-if="leaveList.length != 0">{{ 2.8 }}天</div>
      </template>
      <template #default>
        <div class="content" v-if="leaveList.length != 0">
          <div class="content-item" v-for="(item, index) in leaveList" :key="index">
            <div class="item-top">
              <div class="type">事假</div>
              <div class="day">1天</div>
            </div>
            <div class="item-bottom">00/00 00:00—00/00 00:00</div>
          </div>
        </div>
        <div class="no-data" v-else>
          您上个月没有请假
        </div>
      </template>
    </van-collapse-item>
    <van-collapse-item :title="lastMonth + '月打卡统计'" name="2" icon="records">
      <template #value>
        <div v-if="clockList.length != 0">{{ 2.8 }}天</div>
      </template>
      <template #default>
        <div class="content" v-if="clockList.length != 0">
          <div class="content-item clock" v-for="(item, index) in clockList" :key="index">
            <div class="clock-left">
              <div class="type">{{ item.type }}</div>
              <div class="day">{{ item.date }}</div>
            </div>
            <div class="clock-right">{{ item.day }}天</div>
          </div>
        </div>
        <div class="no-data" v-else>
          您上个月没有缺勤
        </div>
      </template>
    </van-collapse-item>
  </van-collapse>
  <div class="count-leave" v-if="false">
    <div class="title">
      <div class="name">
        <van-icon name="records" size="18" color="#4e89f3" />
        <div class="name-desc">{{ lastMonth }}月请假统计</div>
      </div>
      <div class="day" v-if="leaveList.length != 0">{{ 2.8 }}天</div>
    </div>
    <div class="detail" v-if="leaveList.length != 0">
      <div class="detail-item" v-for="(item, index) in leaveList" :key="index">
        <div class="item-top">
          <div class="type">{{ item.type }}</div>
          <div class="day">{{ item.day }}天</div>
        </div>
        <div class="item-bottom">00/00 00:00—00/00 00:00</div>
      </div>
    </div>
    <div class="detail no-data" v-else>
      <img :src="require('assets/images/no-records.png')" alt="">
      <div class="desc">您上个月没有请假</div>
    </div>
  </div>
  <div class="count-leave" v-if="false">
    <div class="title">
      <div class="name">
        <van-icon name="records" size="18" color="#4e89f3" />
        <div class="name-desc">{{ lastMonth }}月打卡统计</div>
      </div>
      <div class="day" v-if="clockList.length != 0">{{ 2.8 }}天</div>
    </div>
    <div class="detail" v-if="clockList.length != 0">
      <div class="detail-item clock" v-for="(item, index) in clockList" :key="index">
        <div class="clock-left">
          <div class="type">{{ item.type }}</div>
          <div class="day">{{ item.date }}</div>
        </div>
        <div class="clock-right">{{ item.day }}天</div>
      </div>
    </div>
    <div class="detail no-data" v-else>
      <img :src="require('assets/images/no-records.png')" alt="">
      <div class="desc">您上个月没有缺勤</div>
    </div>
  </div>
</div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      lastMonth: '',
      leaveList: [
        { type: '事假', day: '1.0' },
        { type: '探亲假', day: '1.0' },
        { type: '驻境内人员家属探亲假', day: '1.0' }
      ],
      clockList: [
        { type: '上午缺卡', date: '02/24', day: '1.0' },
        { type: '下午缺卡', date: '02/24', day: '1.0' },
        { type: '迟到', date: '02/24', day: '1.0' },
        { type: '早退', date: '02/24', day: '1.0' }
      ],
      activeNames: []
    }
  },
  created() {},
  mounted() {
    this.getLastMonth()
  },
  methods: {
    // 获取上月月份
    getLastMonth() {
      var date = new Date()
      this.lastMonth = date.getMonth()
      // this.leaveList = []
      // this.clockList = []
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep.count-collapse {
  margin-top: 15px;
  .van-collapse-item {
    &__title {
      .van-icon-records {
        font-size: 18px;
        color: #4e89f3;
      }
      .van-cell__title {
        font-weight: 600;
      }
      .van-cell__value {
        color: #111111;
      }
    }
    &__content {
      color: #111111;
      .content {
        &-item {
          font-size: 12px;
          padding: 0 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid #eeeeee;
          .item-top {
            display: flex;
            justify-content: space-between;
            .type {
              color: #4e89f3;
              padding: 2px 10px;
              border: 1px solid #4e89f3;
              border-radius: 5px;
            }
            .day {
              font-size: 14px;
            }
          }
          .item-bottom {
            color: #999999;
            padding: 5px 0;
          }
        }
        .clock {
          height: 22px;
          line-height: 22px;
          vertical-align: middle;
          display: flex;
          justify-content: space-between;
          padding-bottom: 10px;
          &-left {
            height: 100%;
            display: flex;
            .type {
              padding: 2px 10px;
              background-color: #ffd7af;
              border-radius: 5px;
            }
            .day {
              font-size: 14px;
              margin-left: 15px;
              transform: translate(0, 10%);
            }
          }
          &-right {
            font-size: 14px;
          }
        }
      }
      .no-data {
        padding: 0 10px;
      }
    }
  }
}
</style>
