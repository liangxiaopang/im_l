<template>
  <div id="app" class="app">
      <login></login>
      <heads></heads>
      <alerts :str="alerttext" v-if="alertshow"></alerts>    <div class="tab border-1px">
      <div class="item-tab"  @click="clickpersonal">
        <router-link to="/recentchat" active-class="active" class="iconfont icon-xiaoxi"></router-link>
      </div>
      <!--<div class="item-tab"  @click="clickpersonal">-->
        <!--<router-link to="/personal" active-class="active" class="iconfont icon-gerenzhongxinxia"></router-link>-->
      <!--</div>-->
      <div class="item-tab"  @click="clickpersonal">
        <router-link to="/friends" active-class="active" class="iconfont icon-qun"></router-link>
      </div>
      <div class="item-tab"  @click="clickpersonal">
        <router-link to="/group" active-class="active" class="iconfont icon-qunfaxiaoxi">
          <div class="triangle" @click="popupgroup"></div>
          <div class="drop" v-show="group.switch" ref="creategroupbox" @click="creategroup">
            创建群组
          </div>
        </router-link>
      </div>
      <div class="item-tab"  @click="clickpersonal">
        <router-link to="/personal" active-class="active" class="iconfont icon-gerenzhongxin"></router-link>
      </div>
    </div>
    <transition name="rout">
      <router-view class="view"></router-view>
    </transition>
    <footer>
      <div class="notice" @click.stop.prevent="addfriend">加好友</div>
      <div class="notice" @click.stop.prevent="notice">通知<div class="badge" v-show="undonenotice">{{undonenotice}}</div></div>
    </footer>
    <addfriend></addfriend>
    <notice></notice>
  </div>
</template>

<script>
import login from './components/login.vue'
import alerts from './components/subcom/alert.vue'
import dropdownmenu from './components/subcom/dropdownmenu.vue'
import axios from 'axios'
import qs from 'querystring'
import config from './utils/config.js'
import heads from "./components/subcom/header.vue"
import addfriend from './components/subcom/addfriend.vue'
import notice from './components/subcom/notice.vue'
import {getNowFormatDate} from './utils/util.js'
import {mapState} from 'vuex'
const CryptoJS = require("crypto-js")
export default{
  data(){
    return {
      wsip:'',
      wsport:'',
      alerttext:'',
      alertshow:false,
      opts:2
    }
  },
  computed: {
    ...mapState(['currentuser', 'currentmsg', 'notices','group','groups','friends']),
    timestamp(){
      return getNowFormatDate()
    },
    key(){
      return this.$store.getters.getkey
    },
    undonenotice(){
      return this.$store.getters.unreadnotice
    },
    opinion(){
      return this.$store.getters.getopinion
    }
  },
  methods:{
    showalert(str){
      let _this = this;
      _this.alerttext=str;
      _this.alertshow=true;
    },
    clickpersonal(){
      this.$store.commit('dropdownhide')
    },
    setlocalstorage(uid){
      let _this=this;
      if(window.localStorage.msg_room_id){
        let temp=JSON.parse(window.localStorage.msg_room_id)
        if(!temp[uid]){
          let url=config.httpServer+'dialog/getLastMsgid'
          axios.post(url,{
            uid:uid
          }).then((response)=>{
            response = response.data
            if(response !== ''){
              _this.$store.dispatch('updatemsgid',response)
            }
            else{
              _this.$store.dispatch('addmsgid')
            }
          })
        }
        _this.$store.dispatch('updatemsgid',temp)
      }
      else{
        let url=config.httpServer+'dialog/getLastMsgid'
        axios.post(url,{
          uid:uid
        }).then((response)=>{
          response = response.data
          if(response !== ''){
            if(response[uid]){
              _this.$store.dispatch('updatemsgid',response)
            }else{
              _this.$store.dispatch('addmsgid')
            }
          }
          else{
            _this.$store.dispatch('addmsgid')
          }
        })
      }
    },
    addfriend(){
      this.$store.commit('addfriend');
      this.$store.commit('dropdownhide');
      this.$store.commit('infoboxhide');
    },
    notice(){
      this.$store.commit('shownotice');
      this.$store.commit('dropdownhide');
      this.$store.commit('infoboxhide');
    },
    heartbeat(){
      let beat={
        "app_id": this.currentuser.app_sid,
        "method": "heartbeat",
        "version": "1.0",
        "timestamp": this.timestamp
      }
      let jsonstr = JSON.stringify(beat);
      let wordArray = CryptoJS.enc.Utf8.parse(jsonstr);
      let base64str =  CryptoJS.enc.Base64.stringify(wordArray);
      this.$store.state.connection.send(base64str);
    },
    decrypt(word) {
      let decrypts = CryptoJS.AES.decrypt(word, this.key, this.opinion);
//      let decryptedStr = CryptoJS.enc.Utf8.stringify(decrypts);
      let decryptedStr = decrypts.toString(CryptoJS.enc.Utf8);
      return decryptedStr;
    },
    popupgroup(){
      this.$store.commit('switchtogroup',true)},
    creategroup(){
      this.$store.commit('switchtogroup',false)
      this.$store.commit('showcreategroup')
    }
  },
  mounted(){
    let _this=this;
    let data={
      'appid':config.appid
    }
    let url=config.httpServer+'index/imConnect'
    axios.post(url,qs.stringify(data)).then((response)=>{
      response = response.data.data;
      _this.wsip=response.ip;
      _this.wsport=response.port
      _this.$store.dispatch('imconnect',response)
    })
    _this.$nextTick(()=>{
      setTimeout(function(){
        if(!_this.wsip||!_this.wsport){
          let str = '连接失败,请刷新重试' ;
          _this.showalert(str)
          return
        }
        let address = 'ws://'+_this.wsip+':'+_this.wsport

        let connect=new WebSocket(address);
        _this.$store.dispatch('setconnect',connect);
        connect.onopen = function (e) {
          setInterval(function(){return _this.heartbeat()},60000);
        },
          connect.onmessage = function (e) {
            let data = JSON.parse(e.data);
            if (config.isencrypt) {
              let datadetail = data.data;
              let Decryptstr;
              if(data.method === 'httpAddFriendRequest'){
                _this.$store.dispatch('addfriendonline',datadetail)
                return;
              }
              if(data.method === 'httpAddFriend'){
                _this.$store.dispatch('agreeaddfriendonline',datadetail)
                return;
              }
              if(datadetail){
                Decryptstr= _this.decrypt(datadetail)
                let strlen = Decryptstr.length;
                let jsonstr = Decryptstr.substring(16, strlen - 32);
                let obj = JSON.parse(jsonstr);
                if (data.method === "clientlogin") {
                  window.localStorage.setItem('auth_token', obj.auth_token)
                  _this.$store.commit('toggleloginmask');
                  _this.$store.dispatch('userinfo',obj);
                  _this.$store.dispatch('setuserrelation',obj.uid)
                  setTimeout(_this.setlocalstorage(_this.currentuser.uid),300)
                }
                if(data.method ==='rooms_select_message'){
                  _this.$store.dispatch('getchathistory',obj)
                  console.log('群历史记录---'+JSON.stringify(obj))
                }
                if(data.method ==='rooms_select_list'){
                  _this.$store.dispatch('initunread',obj)
                }
                if(data.method ==='rooms_select_userlist'){
                  _this.$store.dispatch('newfriendunread',obj)
                }
                if(data.method === 'rooms_creat'){
                  _this.$store.dispatch('getcurrentsession',obj)
                  _this.$nextTick(()=>{
                    _this.$store.dispatch('controldialogbox', true)
                    _this.$store.dispatch('saveroomid',obj)
                  })
                }
                if(data.method === 'rooms_send_message'){
                  _this.currentmsg.msgid=obj.msgid
                  _this.$store.dispatch('addmessageid',_this.currentmsg)
                  _this.$store.dispatch('addmessage',_this.currentmsg)
                }
                if(data.method ==='rooms_rev_message'){
                  obj.sessiontype='single'
                  for(let i=0,len=_this.groups.length;i<len;i++){
                    if(_this.groups[i].rooms_id===obj.rooms_id){
                      obj.sessiontype='group'
                      obj.to=0
                    }
                  }
                  obj.from=obj.uid;
                  if(obj.sessiontype!=='group'){
                    obj.to = _this.currentuser.uid;
                    _this.$store.dispatch('addmessageid',obj)
                  }
                  _this.$store.dispatch('addmessage',obj)
                }
                if(data.method ==='OnlineNotice') {
                  for(let i=0,len=_this.friends.length;i<len;i++){
                    if(_this.friends[i].uid==obj.uid){
                      let str=_this.friends[i].nickname+'上线了'
                      _this.showalert(str)
                      setTimeout(function(){
                        _this.alertshow=false;
                        _this.alerttext=''
                      },4000)
                      break
                    }
                  }
                }
              }
            }
          },
          connect.onclose=function(e){
            let str = '连接已断开,请刷新重连';
            _this.showalert(str)
            return
          }
      },1000)
    })
  },
  components:{
    heads,
    login,
    addfriend,
    notice,
    alerts,
    dropdownmenu
  }
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import './assets/stylus/mixin.styl'
  #app{
    -moz-box-shadow: 0 0 8px #000;
    -webkit-box-shadow: 0 0 8px #000;
    box-shadow: 0 0 8px #000;
    position absolute;
    width:800px;
    margin-left 50%
    background-color #fff
    /*height:100%;*/
    top:0;
    left:-400px;
    bottom:0;
    min-height:100%;
    z-indx:50;
    overflow-y:auto;
    &::-webkit-scrollbar-button{
      display: none;
    }
    &::-webkit-scrollbar{
      width: 0px;
      background-color: #ccc;
    }

    /*定义滚动条轨道 内阴影+圆角*/
    &::-webkit-scrollbar-track{
      background-color: #ccc;
    }

    /*定义滑块 内阴影+圆角*/
    &::-webkit-scrollbar-thumb{
      border-radius: 3px;
      background: #ccc;
    }
    @media screen and (max-width:700px){
      width 100%;
      font-size:14px;
      margin 0px
      left 0px
    }
    /*border: 1px solid #00b2ae;*/
    .tab{
      display: flex;
      width: 100%;
      height: 40px;
      border-1px(rgba(7,17,27,.2))
      .item-tab{
        flex:1;
        .iconfont{
          display: block;
          text-align:center;
          font-size: 20px;
          width:80px;
          margin:0 auto;
          height:40px;
          line-height :40px;
          color: rgb(77,85,93);
          position:relative;
          .drop{
            position:absolute;
            width 50px
            height 20px
            line-height 20px
            cursor:pointer;
            z-index:12;
            top:35px;
            left:38px;
            border 1px solid red
            font-size 12px
            color #111
          }
        }
        .active{
          color:rgb(240,20,20);
          .triangle{
            position:absolute;
            left:56px;
            top:20px;
            border-color:#b7b7b7 #fff #fff #fff;
            border-style:solid;
            border-width:10px 6px 0 6px;
            width:0;
            height:0;
          }
        }
      }
    }
    .view{
      width:100%;
      position: absolute;
      top: 145px;
      left:0px;
      bottom:30px;
      overflow-y: auto;
      &.rout-enter-active,&.rout-leave-active{
        transition:all .3s linear;
      }
      &.rout-enter,&.rout-leave-active{
        transform:translate3d(-100%,0,0);
        /*opacity:0;*/
      }
    }
    footer{
      display:flex;
      position:absolute;
      bottom:0px;
      left:0;
      width:100%;
      height:30px;
      .notice{
        position:relative;
        flex:1;
        cursor:default;
        text-align: center;
        line-height:30px;
        font-weight:700;
        letter-spacing: 10px;
        color:#333;
        @media screen and (max-width:700px){
          font-size:14px;
        }
        .badge{
          display inline-block
          width:15px;
          height:15px;
          border-radius: 50%;
          background: red;
          font-size:12px;
          color:white;
          line-height: 15px;
          letter-spacing: 0;
          vertical-align middle
          @media screen and (max-width:700px){
            font-size:10px;
            width:12px;
            height:12px;
            line-height:14px;
            right:33%;
            top:8px;
          }
        }
      }
    }

  }

</style>
