<template>
  <div class="circleplay">
    <div class="circleleft">
      <div class="small"></div>
      <div class="middle" :class="{'stopanimate':isanimate}"></div>
      <div class="large" :class="{'stopanimate':isanimate}"></div>
    </div>
    <!--<div class="circleright"  v-if="!show">-->
      <!--&lt;!&ndash;v-on:click="audio" status="stop" no="1"&ndash;&gt;-->
      <!--<div class="large" :class="{'stopanimate':isanimate}"></div>-->
      <!--<div class="middle" :class="{'stopanimate':isanimate}"></div>-->
      <!--<div class="small"></div>-->
    <!--</div>-->
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  export default{
    data(){
      return {}
    },
    props: {
      isanimate: Boolean
    },
    computed:{
      ...mapState(['voice'])
    },
    methods:{
    }
  }
</script>
<style lang="less" scoped>
  .circleplay{
    width: 100px;
    position:relative;
    display:inline-block;
    .circleleft{
      .small{
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width:2px;
        border-top-color: transparent;
        border-left-color: transparent;
        border-bottom-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        vertical-align: middle;
        display: inline-block;
        color:#A2A2A2;
      }
      .middle{
        width: 20px;
        height: 20px;
        border-width:2px;
        border-style: solid;
        border-top-color: transparent;
        border-left-color: transparent;
        border-bottom-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        vertical-align: middle;
        display: inline-block;
        margin-left: -16px;
        animation: show2 2s ease-in-out infinite;
        opacity: 1;
        color:#A2A2A2;
        @keyframes show2 {
          0% { opacity: 0;}
          30% { opacity: 1;}
          100% { opacity: 0;}
        }
      }
      .large{
        width: 30px;
        height: 30px;
        border-width:2px;
        border-style: solid;
        border-top-color:transparent;
        border-left-color: transparent;
        border-bottom-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        vertical-align: middle;
        display: inline-block;
        margin-left: -26px;
        animation: show3 2s ease-in-out infinite;
        opacity: 1;
        color:#A2A2A2;
        @keyframes show3 {
          0% { opacity: 0;}
          60% { opacity: 1;}
          100% { opacity: 0;}
        }
      }
      .stopanimate{
        -moz-animation-name: none;
        -webkit-animation-name: none;
        -ms-animation-name: none;
        animation-name: none;
      }
    }
  }

</style>
