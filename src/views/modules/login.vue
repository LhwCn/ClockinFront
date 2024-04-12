<!-- 登录页面 -->
<template>
  <!-- <Loading v-if="loading"></Loading> -->
  <div class="login">

    <div class="headerArea">
      <img
        class="bg"
        src="../../assets/images/login/weiChai.jpg">
      <img
        class="bg-weichai"
        src="../../assets/images/login/logo.png">
    </div>

    <van-field
        class="account"
        v-model="userid"
        placeholder="账号"
        left-icon="manager"
        clearable/>

    <van-field
        v-model="password"
        type="password"
        placeholder="密码"
        left-icon="lock"
        clearable/>

    <!-- <van-checkbox v-model="remPwd" shape="square" id="loginCheck">记住密码</van-checkbox> -->

    <van-button @click="sign" id="searchs">
      登录
    </van-button>

    <van-loading v-if="toShowLoading" color="#1989fa" size="24px" vertical>
      加载中...
    </van-loading>

  </div>
</template>

<script>
// import Loading from './components/Loading.vue'
import { getToken } from '@/api/clock.js'
import qs from 'qs'
import { uuid } from '@/utils/uuid.js'

export default {
  // components: { Loading },
  props: {},
  data() {
    return {
      userid: '',
      password: '',
      setHeight: '300px',
      toShowLoading: false,
      remPwd: false,
      loading: false
    }
  },
  methods: {
    sign() {
      //发送请求超时检查网络和vue.config.js中查看代理问题
      // console.log(uuid)
      const _this = this
      _this.loading = true
      const params = {
        id:_this.userid,
        // username: _this.username,
        password: _this.password,
        uniqueCode: uuid()
      }
      // console.log(params.userid)
      // console.log(params.password)
      // console.log(JSON.stringify(params))
      getToken(JSON.stringify(params))
        .then((data) => {
          _this.loading = false
          if (data.code === 200) {
            _this.$store.dispatch('setOnlyOneTime', false)
            _this.$store.dispatch('setToken', data.access_token)
            this.$router.replace({
              name: 'Inside'
            })
          } else {
            _this.$toast(data.message)
          }
        })
        .catch(err => {
          _this.loading = false
          _this.$toast('登录失败')
          console.log(err.msg)
          console.log(err)
        })
    }

  },
  created() {}
}
</script>
<style lang="scss" scoped>
.login {
  width: 100%;
  height: calc(100% - 46px);
  background: '#f1f1f1';
  overflow: scroll;
}

/deep/ .van-checkbox {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  float: left;
  margin: 2rem 0 0 3rem;
}

/deep/ #loginCheck {

  .van-icon, .van-icon::before {
    display: inline-block;
    font-weight: inherit;
    font-size: inherit;
  }

  .van-checkbox__icon {

  }

  .van-checkbox__label {
    margin-left: 8px;
    color: #323233;
    // line-height: 1.4rem;
    font-size: 16px;
  }

  .van-checkbox__icon .van-icon {
    display: block;
    box-sizing: border-box;
    width: 1.25em;
    height: 1.25em;
    color: #fff;
    font-size: 16px;
    line-height: inherit;
    text-align: center;
    border: 1px solid #e5e5e5;
    -webkit-transition-duration: .2s;
    transition-duration: .2s;
    -webkit-transition-property: color, border-color, background-color;
    transition-property: color, border-color, background-color;
  }

}

/deep/ .van-cell {
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  overflow: hidden;
  color: #323233;
  font-size: 16px;
  // line-height: 3rem;
  background-color: #fff;
}

/deep/ .van-field__control {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  color: #323233;
  text-align: left;
  background-color: transparent;
  border: 0;
  resize: none;
  padding: 0 0 0 1rem;
  // line-height: 3rem;
}

/deep/ .van-cell-group {
  background-color: inherit;
}

/deep/ .headerArea {
  // width: 100%;
  // height: 20rem;
  /*background: #f7f7f7;*/
  // float: left;
  .bg {
    width: 100%;
    height: 240px;
    border-radius: 2px;
    opacity: 1;
  }
  .bg-weichai {
    position: absolute;
    right: 20px;
    top: 70px;
    width: 100px;
    z-index: 99999;
  }
}

/deep/ .van-field {
  margin: 5px 10%;
  width: 80%;
  border-radius: 5px;
  float: left;
}
.van-field.account {
  margin-top: 40px;
}

/deep/ .van-icon, .van-icon::before {
  display: inline-block;
  font-weight: bolder;
  font-size: 24px;
}

/deep/ .van-collapse {
  margin: 6rem 0 0 0rem;
  width: calc(100% - 0rem);
  border-radius: 10px;
  float: left;
}

/deep/ .van-collapse-item__content {
  padding: 3px;
  color: #969799;
  font-size: 13px;
  line-height: 1.5;
  background-color: #fff;
}

/deep/ .van-cell:not(:last-child)::after {
  position: absolute;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  right: 0;
  bottom: 0;
  left: 16px;
  border-bottom: 0px solid #ebedf0;
  border-bottom-color: rgb(235, 237, 240);
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
}

/deep/ .van-popup {
  margin: 0rem 0 0 2rem;
  width: calc(100% - 4rem);
}

/deep/ .van-overlay {
  display: none;
}

/deep/ .van-grid-item__content {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 3px;
  background-color: #fff;
  border: 0px solid #ebedf0;
  /*border-left: 0px solid #ebedf0;*/
}

/deep/ .van-grid-item__content::after {
  z-index: 1;
  border-width: 0 0px 0px 1px;
}

/deep/ .van-loading {
  color: #aaaaaa;
  font-size: 0;
  position: absolute;
  left: calc(50% - 60px);
  top: calc(50% - 60px);
  z-index: 99999999;
  background: #ffffff;
  width: 120px;
  height: 120px;
  // line-height: 8rem;
  vertical-align: middle;
  border-radius: 5px;
}

/deep/ .van-loading__spinner {
  position: relative;
  top: 5px;
}

/deep/ .van-button--normal {
  font-size: 16px;
  width: 100%;
  border-radius: 4rem;
  float: left;
}

/deep/ #searchs.van-button--normal {
  font-size: 16px;
  width: 80%;
  margin: 10px 10%;
  border-radius: 4rem;
  float: left;
}

.bottext {
  width: 100%;
  height: 4rem;
  float: left;
  text-align: center;
  color: #aaaaaa;
  // line-height: 4rem;
  font-size: 16px;
  border-radius: 0px 0px 10px 10px;
  background: #ffffff;
}

/*input::-webkit-input-placeholder{*/
/*  line-height: 0.4rem;*/
/*}*/
</style>
