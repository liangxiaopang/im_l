<template>
  <transition name="movetop">
    <div class="notice" v-show="noticeshow">
      <header border-1px>
        <div class="title">好友验证</div>
        <div class="title">群系统消息</div>
        <div class="icon-close" @click="closenotice"></div>
      </header>
      <ul>
        <li v-for="(notice,index) in notices" class="list">
          <img :src="notice.u_h_img" alt="" width="38" height="38">
          <div class="content">
            <div class="apply"><a href="#">{{notice.nickname}}</a>请求添加你为好友</div>
            <div class="time" v-if="notice.datetime">{{notice.datetime|formatetime}}</div>
            <div class="time" v-if="!notice.datetime">{{time}}</div>
            <div class="authmsg">附加消息:{{notice.send_msg}}</div>
            <div class="agree common" @click="agree(index,notice.from_id)" v-show="!notice.hasdone">同意</div>
            <div class="deny common" @click="deny(index,notice.from_id)" v-show="!notice.hasdone">拒绝</div>
            <div class="result" v-show="notice.hasdone">{{notice.result}}</div>
          </div>

        </li>
      </ul>
      <footer>

      </footer>
    </div>
  </transition>
</template>

<script>
  import {mapState} from 'vuex'
  import axios from 'axios'
  import qs from 'querystring'
  import Vue from 'vue'
  import {getNowFormatDate} from '../../utils/util.js'
  import config from '../../utils/config.js'
  export default {
    data() {
      return {
        beforeaction:true,
        result:''
      }
    },
    computed:{
      ...mapState(['notices', 'noticeshow']),
      time(){
        return getNowFormatDate()
      }
    },
    filters:{
      formatetime(value){
        return getNowFormatDate(value*1000)
      }
    },
    methods:{
      closenotice(){
        this.$store.commit('closenotice')
      },
      agree(index,val){
        let _this=this;
        let data = {
          "appid": config.appid,
          "uid1": this.$store.state.currentuser.uid,
          "uid2": val
        };
        let url=config.httpServer+'index/addFriend'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          _this.$store.dispatch('agree',index)
        })
      },
      deny(index,val){
        let _this=this;
        let data = {
          "appid": config.appid,
          "to_id": this.$store.state.currentuser.uid,
          "from_id": val
        };
        let url=config.httpServer+'index/delFriendRequest'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          _this.$store.dispatch('deny',index)
        })
      }
    },
    components: {}
  }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import '../../assets/stylus/mixin.styl'
  .notice{
  /*border:1px solid red;*/
  position:relative;
  top:20px;
  width:100%;
  height:200px;
  background: #f6f6f6;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  -moz-box-shadow: 0 0 8px #000;
  -webkit-box-shadow: 0 0 8px #000;
  box-shadow: 0 0 8px #000;
  &.movetop-enter-active,&.movetop-leave-active{
    transition:all .5s linear;
  }
  &.movetop-enter,&.movetop-leave-active{
    transform:translate3d(0,100%,0) scale3d(0,0,0);
    opacity:0;
  }
  header{
    display:flex;
    height:20px;
    width:100%;
    background-color: #f6f6f6;
    border-1px(rgba(7,17,27,.2))
    color:black;
    font-size:10px;
    line-height: 20px;
    cursor: pointer;
    .title{
      flex:0 0 100px;
      text-align:center;
      &:hover{
      font-size:14px;
    }
    }
    .icon-close{
      display: block;
      position: absolute;
      line-height: 20px;
      width:20px;
      top:0;
      right:4px;
      font-size:14px;
      height:20px;
      text-align: center;
    }
    .icon-close:hover{
      border-radius: 50%;
      color:black;
      background-color: red;
      font-size:16px
    }
  }
  ul{
    width:100%;
    height:180px;
    overflow: auto;
    &::-webkit-scrollbar-button{
      display: none;
    }
    &::-webkit-scrollbar{
      width: 4px;
      background-color: #ccc;
    }

    /*定义滚动条轨道 内阴影+圆角*/
    &::-webkit-scrollbar-track{
      background-color: #ccc;
    }

    /*定义滑块 内阴影+圆角*/
    &::-webkit-scrollbar-thumb{
      border-radius: 10px;
      background: #ccc;
    }
    .list{
      display: flex;
      width:100%;
      margin-top:3px;
      height:60px;
      padding-left:4px;
      border-bottom:1px solid rgba(7,17,27,.1);
      &:first-child{
        margin-top:0;
      }
      img{
        flex:0 0 38px;
        border-radius: 50%;
        margin:11px 5px 11px auto;
      }
      .content{
        flex:1;
        padding:2px 5px;
        position:relative;
        .apply{
          display:inline-block;
          font-size:14px;
          color:black;
          vertical-align: middle;
        }
        .time{
          position:absolute;
          bottom:3px;
          left:3px;
          display: inline-block;
          font-size:8px;
          vertical-align: middle;
          color:blue;
        }
        .authmsg{
          position:absolute;
          bottom:16px;
          left:3px;
          display: inline-block;
          font-size:10px;
        }
        .common{
          position:absolute;
          right:12px;
          font-size:10px;
          width:30px;
          text-align:center;
          height:16px;
          line-height:16px;
          cursor: pointer;
          color:white;
          border-radius: 5px;
        }
        .common:hover{
          opacity:.6;
        }
        .agree{
          top:8px;
          background-color:green;
        }
        .deny{
          bottom:8px;
          background-color:red;
        }
        .result{
          font-size:10px;
          color:#333;
          position:absolute;
          right:12px;
          top:20px;

        }
      }
    }
  }


}
</style>
