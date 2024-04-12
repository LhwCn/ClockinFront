import { isNeedSign, getUserInfo } from '@/api/clock.js'

export default {
  data() {
    return {
      isNeedSignType: '', // 是否需要打卡的情况，包括0正常打卡、1没有打卡规则，3节假日等
      signMsg: '', // 不同打卡情况的用户提示信息
      isShowSign: true, //是否展示打卡按钮那一部分区域的页面内容，如果是false，页面图片以下空白
      userName: ''
    }
  },

  computed: {},

  methods: {
    // 目前后端只返回0、1、3

    // 0:正常打卡，不处理
    // 1:无打卡规则，提示信息：您不在打卡规则，请联系部门考勤员
    // 2:在白名单，提示信息：您不在打卡规则，请联系部门考勤员
    // 3:节假日，提示信息：今日不上班，好好休息（配图）
    // 4:有打卡规则但还未生成打卡信息，提示信息：您不在打卡规则，请联系部门考勤员
    getIsNeedSign() {
      this.getDakaUserInfo() //获取用户信息
      const params = {}
      isNeedSign(params)
        .then((data) => {
          this.isNeedSignType = data
          //正常打卡
          if (this.isNeedSignType === 0) {
            this.signMsg = '0'
            this.isShowSign = true
          } else if (this.isNeedSignType === 3) {
            //节假日
            this.signMsg = '今日不上班，好好休息'
            this.isShowSign = true
          } else { // 1、2、4的情况
            this.isShowSign = true
            if ([1, 2, 4].includes(this.isNeedSignType)) {
              this.signMsg = '您不在打卡规则中，请联系部门考勤员'
            }
            if (!this.$store.state.app.onlyOneTime) {
              this.$dialog.alert({
                title: '提示',
                message: this.signMsg
              })
                .then(() => {
                  this.$store.dispatch('setOnlyOneTime', true) // 设置不在打卡规则提示弹框只弹一次
                  // on confirm
                })
            }
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },

    getDakaUserInfo() {
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
    }
  }
}
