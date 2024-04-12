<!-- 加载 -->
<template>
  <van-overlay :show="show" @click="show = false">
    <div class="wrapper" @click.stop>
      <div class="block">
        <van-loading color="#0094ff" size="48px" vertical >加载中...</van-loading>
      </div>
    </div>
  </van-overlay>
</template>

<script>
export default {
  name: "loading",
  data(){
    return{
      show:true
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-content: center;
  background-color: rgba(0,0,0,0);
  div{
    display: flex;
    justify-content: center;
    align-content: center;
  }
}
</style>
