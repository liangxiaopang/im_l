<template>
  <div class="alert">{{this.str}}</div>
</template>
<script>
  export default {
    props:{
      str:{
        type:String
      }
    }
  }
</script>
<style lang="less" scoped>
  .alert{
    font-size:10px;
    color:red;
    z-index:52;
    position:absolute;
    width:100%;
    top:45px;
    left:0px;
    text-align: center;
  }
</style>
