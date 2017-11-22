<template>
	<div class="recent_chat" @click="hide">
		<ul v-show="!showloginmask" class="list">
			<li v-for="(friend,index) in friends" :class="{'active':friend.active,'unactive':!friend.active}" class="friend-content border-1px" @click.stop="select(friend,index)"  @dblclick.stop.prevent="showNews(index)" @touchstart.prevent="showNews(index)">
				<img :src="friend.u_h_img" alt="" width="46" height="46" class="avatar">
				<div class="placename" @contextmenu.prevent="menushow($event,index)">
          <div class="left">
            <div class="name">{{friend.nickname}}
              <div v-if="friend.unread" :class="friend.unread ? 'dot' : '' ">{{friend.unread}}</div>
            </div>
            <div class="msg" v-if="broadcast[friend.uid]" :title="getlast(index)">{{getlast(index)}}</div>
          </div>
          <div class="right">
            <span v-if="broadcast[friend.uid]">{{gettime(index)}}</span>
          </div>
				</div>
			</li>
		</ul>
    <dialogbox v-if="dialogboxshow"></dialogbox>
    <div class="confirm" v-if="confirmdeletefriend">
      <div class="titl">是否删除[&nbsp;<div class="groupname">{{chosentodel.name}}</div>&nbsp;]?</div>
      <div class="opt">
        <div class="right" @click="deletefriend">确定</div><div class="right one" @click="giveup">取消</div>
      </div>
    </div>
    <div class="confirm" v-if="confirmaddblack">
      <div class="titl">是否把[&nbsp;<div class="groupname">{{chosentodel.name}}</div>&nbsp;]加入黑名单</div>
      <div class="opt">
        <div class="right" @click="addblacklist">确定</div><div class="right one" @click="giveupaddblacklist">取消</div>
      </div>
    </div>
    <div class="drop" ref="dropbox">
      <dropdownmenu v-if="dropdownshow" :option="dropdownoption"></dropdownmenu>
    </div>
	</div>
</template>
<script>
import dialogbox from "./subcom/dialogbox.vue"
import axios from 'axios'
import qs from 'querystring'
import {formaturl} from '../utils/util.js'
import Vue from 'vue'
import dropdownmenu from './subcom/dropdownmenu.vue'
const CryptoJS = require("crypto-js");
import {mapState} from 'vuex'
import config from '../utils/config.js'
import {getNowFormatDate,randomString} from '../utils/util.js'
	export default{
		data(){
			return{
				detailShow:false,
        dropdownoption:['删除好友','加入黑名单'],
        msgtypearr:['[语音]','[图片]','[视频]']
			};
		},
    computed:{
      ...mapState(['currentuser','confirmdeletefriend','confirmaddblack','friends', 'connection', 'dialogboxshow', 'dropdownshow', 'showloginmask','currentsession','broadcast','chosentodel']),
      key(){
        return this.$store.getters.getkey
      },
      opinion(){
        return this.$store.getters.getopinion
      }
    },
		methods: {
      showalert(str){
        let _this = this;
        _this.alerttext=str;
        _this.alertshow=true;
        setTimeout(function(){
          _this.alertshow=false;
          _this.alerttext=''
        },4000)
      },
      hide(){
        this.$store.commit('infoboxhide')
      },
      menushow($event,index){
        if($event.target.nodeName === 'DIV'){
          let target = $event.target.parentNode
          let top = $event.offsetY+52*index;
          let left=$event.offsetX;
          let payload={
            top:top,
            left:left
          };
          let el=this.$refs.dropbox
          el.style.left=(left+58)+'px';
          el.style.top=top+'px';
          this.$store.commit('dropdownshows')
          this.$store.commit('getmousepos',payload)
          this.$store.commit('getchoosenuid',index)
        }
      },
      getlast(index){
        let uid=this.friends[index].uid
        let msgarr=this.broadcast[uid]
        let len=msgarr.length
        if(msgarr[len-1].msgtype==='voice') {return this.msgtypearr[0]}
        else if(msgarr[len-1].msgtype==='img') {return this.msgtypearr[1]}
        else if(msgarr[len-1].msgtype==='video') {return this.msgtypearr[2]}
        else return msgarr[len-1].msg

//          return broadcast[friend.uid][(broadcast[friend.uid].length-1)].msg
      },
      gettime(index){
        let uid=this.friends[index].uid
        let msgarr=this.broadcast[uid]
        let len=msgarr.length
        let time=msgarr[len-1].time
        let date=new Date()
        let aft=time.split(' ')[1]
        let bef=time.split(' ')[0]
        let year=bef.split('-')[0]
        let month=bef.split('-')[1]
        let day=bef.split('-')[2]
        if(date.getFullYear()!=year){
          return bef
        }
        else if((date.getMonth() + 1)!=month){
          return month+'月'+day+'日'
        }
        else if(date.getDate()-day>1){
          return month+'月'+day+'日'
        }
        else if(date.getDate()-day==1){
          return '昨天'
        }
        else if(date.getDate()-day==0){
          return aft.slice(0,5)
        }
      },
      select (friend, index) {
        this.$store.commit('dropdownhide')
        this.$store.commit('infoboxhide')
//        this.$store.commit('getchoosenuid',index)
        this.$nextTick(function () {
          this.friends.forEach(function (friend) {
            Vue.set(friend,'active',false);
          });
          Vue.set(friend,'active',true);
        });
      },
      encrypt(app_id, word) {
        let RandomStr = randomString(16);
        let appid = CryptoJS.MD5(app_id).toString();
        let str2 = RandomStr + word + appid;
        let encrypted = CryptoJS.AES.encrypt(str2, this.key, this.opinion);
        return encrypted.toString();
      },
      controldialogbox() {
        this.$store.dispatch('controldialogbox', true)
      },
      showNews(index) {
        let _this = this;
        _this.$store.commit('resetcount',index);
        _this.$store.commit('dropdownhide')
        _this.$store.commit('setflag',index)
        _this.$store.commit('setsessionfriend',index)
        let appid = this.currentuser.app_sid;
        let timestamp = getNowFormatDate();
        let userlist = this.currentuser.uid + ',' + this.friends[index].uid;
        let data = {
          auth_token: this.currentuser.auth_token,
          userlist: userlist,
          rooms_type: "single"
        };
        let isen = config.isencrypt;
        let en_data;
        if (isen) {
          let strdata = JSON.stringify(data);
          en_data = this.encrypt(appid, strdata);
        }
        let singleroomcreate = {
          "app_id": appid,
          "method": "rooms_creat",
          "version": "1.0",
          "timestamp": timestamp,
          "data": en_data
        };
        let jsonstr = JSON.stringify(singleroomcreate);
        let wordArray = CryptoJS.enc.Utf8.parse(jsonstr);
        let base64str = CryptoJS.enc.Base64.stringify(wordArray);
        this.connection.send(base64str);
        this.$nextTick(() => {
          setTimeout(function(){
            let lastmsg_room = JSON.parse(window.localStorage.msg_room_id);
            let idd = _this.friends[index].uid;
//            let roomids = lastmsg_room[_this.currentuser.uid]
            let roomid=_this.currentsession.rooms_id
            let content = _this.$store.state.broadcast[idd]
            if (!content|| content&&content.length === 0) {
              let historymsg = {
                "auth_token": _this.currentuser.auth_token,
                "rooms_id": roomid,
                //这里碰到个数据自动转换的坑,变成了字符串拼接了
//              1+parseInt(lastmsgid)
                "msgid": 0,
                "limit": 25
              }
              let hismsg = JSON.stringify(historymsg);
              let en_hismsg = _this.encrypt(appid, hismsg);
              let selectmessag = {
                "app_id": appid,
                "method": "rooms_select_message",
                "version": "1.0",
                "timestamp": timestamp,
                "data": en_hismsg
              }
              let jsons = JSON.stringify(selectmessag);
              let wordA = CryptoJS.enc.Utf8.parse(jsons);
              let base64s = CryptoJS.enc.Base64.stringify(wordA);
              _this.connection.send(base64s);
            }
            else{
              _this.$store.dispatch('controldialogbox', true)
            }
          },400)
          setTimeout(function () {
            let datas={
              "auth_token":_this.currentuser.auth_token,
              "rooms_id":_this.currentsession.rooms_id
            }
            let strdatas = JSON.stringify(datas);
            let en_datas = _this.encrypt(appid, strdatas);
            let sreadermsg = {
              "app_id": appid,
              "method": "rooms_sreaded_message",
              "version": "1.0",
              "timestamp": timestamp,
              "data": en_datas
            }
            let jsonss = JSON.stringify(sreadermsg);
            let wordAs = CryptoJS.enc.Utf8.parse(jsonss);
            let base64ss = CryptoJS.enc.Base64.stringify(wordAs);
            _this.connection.send(base64ss);
          },500)
        })
      },
      giveup(){
        this.$store.commit('confirmdelfriend',false)
      },
      deletefriend(){
        let index;
        let _this=this
        for (let i = this.friends.length - 1; i >= 0; i--) {
          if (this.friends[i].uid == this.chosentodel.uid) {
            index = i;
            break;
          }
        }
        this.friends.splice(index,1)
        let data = {
          appid:config.appid,
          uid1:this.currentuser.uid,
          uid2:this.chosentodel.uid
        }
        let url=config.httpServer+'index/delFriend'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          _this.$store.commit('confirmdelfriend',false)
          let str =_this.chosentodel.name+ '删除成功';
          _this.showalert(str)
        })
      },
      addblacklist(){
        this.$store.commit('confirmaddblacklist',false)
        let index;
        let _this=this
        for (let i = this.friends.length - 1; i >= 0; i--) {
          if (this.friends[i].uid == this.chosentodel.uid) {
            index = i;
            break;
          }
        }
        let data = {
          appid:config.appid,
          uid1:this.currentuser.uid,
          uid2:this.chosentodel.uid
        }
        let url=config.httpServer+'index/addBlack'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          _this.$store.commit('confirmdelfriend',false)
          let str =_this.chosentodel.name+ '被加入黑名单';
          _this.showalert(str)
          _this.$store.dispatch('removefromfriend')
        })
      },
      giveupaddblacklist(){
        this.$store.commit('confirmaddblacklist',false)
      }
    },
		components:{
			dialogbox,
      dropdownmenu
		}
	}
</script>
<style lang="stylus" scoped>
  @import '../assets/stylus/mixin.styl'
  .recent_chat{
    width:100%;
    overflow auto
    &::-webkit-scrollbar-button{
      display: none;
    }
    &::-webkit-scrollbar{
      width: 1px;
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
      position:relative;
      width:100%;
      .friend-content{
        position: relative;
        padding:3px;
        color:#111;
        display: flex;
        cursor default
        border-1px(rgba(7,17,27,.2))
        &:last-child{
          border-none()
        }
        &:hover{
          background-color #c9c9c9
        }
        .avatar{
          flex:0 0 46px;
        }
        .placename {
          flex:1;
          display :flex;
          padding-left: 10px;
          .left{
            flex:1;
            display:flex;
            flex-direction :column;
            .name {
              flex:1;
              display inline-block
              font-weight: 700px;
              font-size: 14px;
              height:23px;
              line-height:23px;
              .dot {
                display inline-block
                width: 16px;
                height: 16px;
                line-height 16px
                border-radius: 50%;
                align-self: center;
                background: #ff0000;
                color:white;
                font-size:8px;
                text-align:center;
                margin-left 10px
              }
            }
            .msg {
              flex:1;
              display block
              max-width 600px
              font-size: 12px;
              font-weight: 200px;
              height:23px;
              line-height:23px;
              padding-left:4px;
              color #333
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              @media screen and (max-width:700px){
                max-width:280px;
              }
            }
          }
          .right{
            flex:0 0 130px;
            font-size :10px;
            padding-right:30px
            line-height:46px;
            text-align right
            color:#333;
            @media screen and (max-width:700px){
              flex 0 0 60px
              padding-right 0px
              text-align center
            }
          }
        }
        .icon-close{
          position: absolute;
          right: 10px;
          top: 15px;
        }
      }
      .active{
        background-color: #ccc;
      }
      .unactive{
        background-color:#f6f6f6;
      }
      .fade-enter,.fade-leave-active{
        transition: all .5s ease;
        opacity:0;
      }
      .fade-enter-active{
        transition: all .5s ease;
        background:rgba(7,17,27,0.8);
      }
    }

    .confirm{
      width:300px;
      height:160px;
      border-radius:4px;
      position:absolute;
      top:180px;
      left:50%;
      margin-left:-80px;
      border:1px solid #ccc;
      -webkit-box-shadow: inset 0 0 5px #c9c9c9 ;
      -moz-box-shadow: inset 0 0 5px #c9c9c9;
      box-shadow: inset 0 0 5px #c9c9c9;
      background-color #fff;
      .titl{
        width:100%;
        height:60px;
        line-height 60px
        text-align center
        cursor default
        .groupname{
          display inline-block
          max-width 100px
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
          color red
          vertical-align bottom
        }
      }
      .opt{
        width:100%;
        height:100px;
        .right{
          width:60px;
          height:30px;
          line-height 30px
          background-color green
          text-align center
          color white
          display inline-block
          border-radius 4px
          cursor pointer
          margin-left:60px;
          margin-top 30px
          &:hover{
            box-shadow 0 0 10px #111
          }
        }
        .one{
          background-color red
        }
      }
    }
    .drop{
      position:absolute;
      width:66px;
      top:20px;
      right:10px;
    }
	}
</style>
