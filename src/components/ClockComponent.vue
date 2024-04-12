<template>
  <div class="time-container">
    <div class="left-section">
      <div class="currentTime">{{ currentTime }}</div>
    </div>
    <div class="right-section">
      <div>{{ currentDay }}</div>
      <div>{{ currentDate }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTime: '',
      currentDay: '',
      currentDate: ''
    }
  },
  methods: {
    updateTime() {
      const now = new Date()
      const hours = ('0' + now.getHours()).slice(-2)
      const minutes = ('0' + now.getMinutes()).slice(-2)
      const seconds = ('0' + now.getSeconds()).slice(-2)
      this.currentTime = hours + ':' + minutes + ':' + seconds

      const days = ['日', '一', '二', '三', '四', '五', '六']
      const dayIndex = now.getDay()
      this.currentDay = '星期' + days[dayIndex]

      const month = ('0' + (now.getMonth() + 1)).slice(-2)
      const date = ('0' + now.getDate()).slice(-2)
      this.currentDate = now.getFullYear() + '-' + month + '-' + date
    }
  },
  created() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  }
}
</script>

<style scoped>
.time-container {
  display: flex;
  justify-content: space-between;
}

.left-section {
  flex: 1;
}

.right-section {
  text-align: right;
  font-size: 14px;
  color: #b2b9c6;
}
.currentTime{
  margin-top: 15px;
  font-size: 28px;
  margin-left: 5px;
}

</style>
