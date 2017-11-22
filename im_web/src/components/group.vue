<template>
  <div class="group" @click="hide">
    <div class="groups">
      <ul>
        <li v-for="(group,index) in groups" class="groups-content border-1px" @dblclick.stop.prevent="groupboxaction(index)" @touchstart.prevent="groupboxaction(index)">
          <img :src="group.group_head"  width="46" height="46" :alt="group.group_name" :title="group.group_name">
          <div class="groupinfo" @contextmenu.prevent="dismissgroup($event,index)">
            <div class="left">
              <div class="group-name">{{group.group_name}}
                <div v-if="group.unread" :class="group.unread ? 'dot' : '' ">{{group.unread}}</div>
              </div>
              <div class="msg" v-if="flag(index)">{{getlast(index)}}</div>
            </div>
            <div class="right">
              <span v-if="flag(index)">{{gettime(index)}}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="quitegroup" ref="quitebox" v-show="quitebox" @click="commitgroup">退出此群</div>
    <div class="confirm" v-show="confirmquitegroup">
      <div class="titl">真的要退出[&nbsp;<div class="groupname" :title="currentchosengroup.group_name">{{currentchosengroup.group_name}}</div>&nbsp;]群吗</div>
      <div class="opt">
        <div class="right" @click="confirmquite">确定</div><div class="right one" @click="giveupquite">取消</div>
      </div>
    </div>
    <groupbox v-if="groupboxshow" :groupname="selectgroup"></groupbox>
    <alerts :str="alerttext" v-if="alertshow"></alerts>
    <!--<div class="group-container">-->
      <!--<div class="group-apply beforeSuccess">-->
        <!--申请聊天权限-->
      <!--</div>-->
      <!--<div class="group-title">-->
        <!--<span>为了提升群聊天的质量，请先申请聊天权限自动审核后将开放群聊天系统</span>-->
      <!--</div>-->
    <!--</div>-->
    <!--<div class="group-container" :class="{hide:hides}">-->
      <!--<div class="group-success-title">-->
        <!--<span>恭喜您，审核通过</span>-->
      <!--</div>-->
      <!--<div class="group-apply success">立即进入群聊天</div>-->
    <!--</div>-->
    <!--<div class="group-container" :class="{hide:hides}">-->
      <!--<div class="group-fail">-->
        <!--<span>很遗憾，未达到充值或消费标准审核未通过</span>-->
      <!--</div>-->
    <!--</div>-->
    <transition name="creat">
      <div class="realgroup" v-if="group.creatgroup">
        <div class="title">
          <div class="cancel" @click="cancelcreate">取消</div>
          <div class="create" @click="creategroup"><div class="createlogo">创建<div class="num" v-show="num">({{num}})</div></div></div>
        </div>
        <ul>
          <li v-for="(friend,index) in friends" class="friends-content">
            <img :src="friend.u_h_img" alt="" width="46" height="46">
            <div class="placename" @click="chosenfriend(index)">{{friend.nickname}}</div>
            <div class="checkbox" @click="chosenfriend(index)" :class="{chose:friend.cho}"><div class="right" v-if="friend.cho"></div></div>
          </li>
        </ul>
      </div>
    </transition>
    <transition name="confirm">
      <div class="setgroup" v-if="group.confirm">
        <div class="title border-1px">
          <div class="name">创建新群</div>
          <div class="icon-close" @click="backto"></div>
        </div>
        <div class="chosenfriends border-1px">
          <div v-for="(select,index) in selectarr" class="chosenfriend">
            <img :src=select.u_h_img :alt="select.nickname" :title="select.nickname" width="46" height="46">
          </div>
        </div>
        <div class="groupinfo">
          <div class="groupname"><div class="nameleft">群名称 ：</div><input class="input" v-model="groupname" maxlength="16"  placeholder="16个字符以内" /></div>
          <div class="groupname">
            <div class="nameleft">加群验证 ：</div>
            <div class="radio">
              <div class="radiobox">
                <input type="radio" id="one" v-model="picked" value="0" name="grouptype">
                <label for="one">允许任何人</label>
              </div>
              <div class="radiobox">
                <input type="radio" id="two" v-model="picked" value="1" name="grouptype">
                <label for="two">需身份验证</label>
              </div>
              <div class="radiobox">
                <input type="radio" id="three" v-model="picked" value="2" name="grouptype">
                <label for="three">不允许任何人</label>
              </div>
            </div>
          </div>
          <div class="groupname"><div class="nameleft">群介绍 ：</div><textarea class="textarea" v-model="groupmsg" placeholder="群介绍"></textarea></div>
        </div>
        <div class="submit" @click="submitgroupinfo">完成</div>
      </div>
    </transition>
  </div>
</template>
<script>
  import groupbox from './subcom/groupbox.vue'
  import axios from 'axios'
  import config from '../utils/config.js'
  const CryptoJS = require("crypto-js");
  import qs from 'querystring'
  import alerts from './subcom/alert.vue'
  import {mapState} from 'vuex'
  import {getNowFormatDate,randomString} from '../utils/util.js'
  export default{
    data (){
      return {
        num:'',
        groupname:'',
        groupmsg:'',
        picked:'',
        selectgroup:[],
        alerttext:'',
        alertshow:false,
        grouptype:['public','private','verift'],
        msgtypearr:['[语音]','[图片]','[视频]']
      }
    },
    computed:{
      ...mapState(['confirmquitegroup','friends','group','selectarr','currentuser','groups','groupboxshow','connection','sessionlist','quitebox','currentchosengroup']),
      getnum(){
        return this.selectarr.length
      },
      key(){
        return this.$store.getters.getkey
      },
      opinion(){
        return this.$store.getters.getopinion
      }
    },
    watch:{
      getnum(val){
        this.num=val
      }
    },
    mounted(){
      let data={
        appid:config.appid,
        uid:this.currentuser.uid
      }
      let _this=this
      if(this.groups.length){
        return
      }
      let url=config.httpServer+'index/getGroup'
      axios.post(url,qs.stringify(data)).then((response)=>{
        response = response.data
        _this.$store.dispatch('downloadgroup',response.data)
        _this.$nextTick(()=>{
          setTimeout(function(){
            for(let i=0,len=_this.sessionlist.length;i<len;i++){
              if(_this.sessionlist[i].rooms_type==='group'){
                for(let j=0,lens=_this.groups.length;j<lens;j++){
                  if(_this.groups[j].rooms_id===_this.sessionlist[i].rooms_id){
                    _this.groups[j].unread=_this.sessionlist[i].unread
                  }
                }
              }
            }
          },400)
        })
      })
    },
    methods:{
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
        this.$store.commit('canceltogroup')
      },
      encrypt(app_id, word) {
        let RandomStr = randomString(16);
        let appid = CryptoJS.MD5(app_id).toString();
        let str2 = RandomStr + word + appid;
        let encrypted = CryptoJS.AES.encrypt(str2, this.key, this.opinion);
        return encrypted.toString();
      },
      cancelcreate(){
        this.$store.commit('cancelcreategroup')
      },
      chosenfriend(index){
        this.$store.commit('chosenfriend',index)
      },
      creategroup(){
        if(this.selectarr.length<2){
          let str='至少需要两个好友'
          this.showalert(str)
          return
        }
        this.$store.commit('confirmcreategroup')
      },
      backto(){
        this.$store.commit('backtonext')
      },
      getlast(index){
        let msgarr=this.groups[index].group_hismsg
        let len=msgarr.length
        if(msgarr[len-1].msgtype==='voice') {return msgarr[len-1].user.nickname+':'+this.msgtypearr[0]}
        else if(msgarr[len-1].msgtype==='img') {return msgarr[len-1].user.nickname+':'+this.msgtypearr[1]}
        else if(msgarr[len-1].msgtype==='video') {return msgarr[len-1].user.nickname+':'+this.msgtypearr[2]}
        else return msgarr[len-1].user.nickname+':'+msgarr[len-1].msg
      },
      gettime(index){
        let msgarr=this.groups[index].group_hismsg
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
      flag(index){
        return this.groups[index].group_hismsg.length
      },
      submitgroupinfo(){
        let _this = this
        if(this.groupname===''||this.picked===''){
          let str='群名称或群类型不能为空'
          this.showalert(str)
          return
        }
        let str='';
        for(let i=0,len=this.selectarr.length;i<len;i++){
          str=str+this.selectarr[i].uid+','
        }
        let userlist=str.slice(0,-1)
        let data={
          "appid": config.appid,
          "userlist": userlist,
          "uid":this.currentuser.uid,
          "group_type": "group",
          "rooms_name": this.groupname,
          "group_nature": this.grouptype[this.picked],
          "status": 0,
          "state":this.groupmsg
        }
        let url=config.httpServer+'dialog/addGroup'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data;
          if(response.error_code!==0){
            let str=response.msg
            _this.showalert(str)
            return
          }
          let str="群"+"[ "+this.groupname+" ]"+"创建成功"
          _this.showalert(str)
          _this.currentuser.role=2
          _this.selectarr.unshift(_this.currentuser)
          let obj={
            rooms_id:response.data.rooms_id,
            group_name:_this.groupname,
            group_type: "group",
            group_head:'http://im.weixinkaifvip.com/public/uploads/group_head.jpg',
            group_state:_this.groupmsg,
            status:0,
            group_nature:_this.grouptype[this.picked],
            groupmember:_this.selectarr,
            group_hismsg:[]
          }
          _this.$store.dispatch('creategroupsuccess',obj)
        })
      },
      groupboxaction(index){
        let _this=this
        _this.selectgroup=_this.groups[index].group_hismsg
        _this.$store.commit('getgroupindex',index)
        _this.$store.commit('quiteboxshow',false)
        _this.$store.commit('resetgroupcount',index);
        _this.$store.dispatch('controlgroupbox', true);
        _this.$store.commit('setgroupflag',index)
        let appid = this.currentuser.app_sid;
        let timestamp = getNowFormatDate();
        if(this.groups[index].groupmember) {
          _this.$store.dispatch('setcurrentgroupsession',index)
        }
        else{
          let data={
            'appid': config.appid,
            'rooms_id':this.groups[index].rooms_id
          }
          let url=config.httpServer+'index/getGroupMembers'
          axios.post(url,qs.stringify(data)).then((response)=>{
            response = response.data
            let payload={}
            payload.groupmember=response.data
            payload.ind=index
            _this.$store.dispatch('getgroupmember',payload)
            _this.$store.dispatch('setcurrentgroupsession',index)
          })
        }
        this.$nextTick(() => {
          setTimeout(function(){
            let group = _this.groups[index]
            let roomid=group.rooms_id
            let content = group.group_hismsg
            if (!content|| content&&content.length === 0) {
              let historymsg = {
                "auth_token": _this.currentuser.auth_token,
                "rooms_id": roomid,
                //这里碰到个数据自动转换的坑,变成了字符串拼接了
//              1+parseInt(lastmsgid)
                "msgid": 0,
                "limit": 50
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
          },400)
        })
      },
      dismissgroup($event,index){
        let top = $event.offsetY+48*index;
        let left=$event.offsetX;
        let el=this.$refs.quitebox;
        el.style.left=(left+64)+'px';
        el.style.top=top+'px';
        this.$store.commit('quiteboxshow',true)
        this.$store.commit('getchoosengroup',index)
      },
      commitgroup(){
        this.$store.commit('quiteboxshow',false)
        this.$store.commit('quitegroupconfirm',true)
      },
      giveupquite(){
        this.$store.commit('quitegroupconfirm',false)

      },
      confirmquite(){
        let _this=this
        let role;
        let member=this.currentchosengroup.groupmember
        if(member===undefined){
          let data={
            'appid': config.appid,
            'rooms_id':this.currentchosengroup.rooms_id
          }
          let url=config.httpServer+'index/getGroupMembers'
          axios.post(url,qs.stringify(data)).then((response)=>{
            response = response.data
            let payload=response.data
            _this.$store.dispatch('getbeforedelete',payload)
            let newmember=_this.currentchosengroup.groupmember
            for(let i=0,len=newmember.length;i<len;i++){
              if(newmember[i].uid==_this.currentuser.uid){
                role=newmember[i].role
                break
              }
            }
          })
        }
        else{
          for(let i=0,len=member.length;i<len;i++){
            if(member[i].uid==this.currentuser.uid){
              role=member[i].role
              break
            }
          }
        }
        setTimeout(()=>{
          _this.$store.commit('quitegroupconfirm',false)
          if(role==2){
            let data={
              'appid': config.appid,
              'rooms_id': _this.currentchosengroup.rooms_id,
              'uid': _this.currentuser.uid
            }
            let url=config.httpServer+'dialog/delGroup'
            axios.post(url,qs.stringify(data)).then((response)=>{
              response=response.data
              if(response.error_code===0){
                _this.$store.dispatch('successdismiss')
                let str='解散成功'
                _this.showalert(str)
              }
            })
          }
          else{
            let datas={
              'appid': config.appid,
              'rooms_id': _this.currentchosengroup.rooms_id,
              'uid': _this.currentuser.uid
            }
            let url=config.httpServer+'dialog/qtGroup'
            axios.post(url,qs.stringify(datas)).then((response)=>{
              response=response.data
              console.log('huifu---'+JSON.stringify(response))
              if(response.error_code===0){
                _this.$store.dispatch('successdismiss')
                let str='退出成功'
                _this.showalert(str)
              }
            })
            console.log('作为普通会员退出群的接口还没有')
          }
        },300)
      }
    },
    components:{alerts,groupbox}
}
</script>
<style lang="stylus" scoped>
  @import '../assets/stylus/mixin.styl'
  .group{
    position relative
    padding:5px 5px;
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
    .groups{
      .groups-content{
        display: flex;
        padding:1px;
        background-color :#f6f6f6;
        position:relative;
        cursor default
        border-1px(rgba(7,17,27,.2))
        &:last-child{
          border-none()
        }
        &:hover{
          background-color #c9c9c9
        }
        img{
          flex:0 0 46px;
          font-size:10px;
          text-align :center;
          color:blue;
          height:46px;
          border:1px solid #ccc;
          text-overflow :ellipsis;
          overflow hidden
        }
        .groupinfo{
          flex:1;
          display :flex;
          padding-left: 10px;
          .left{
            flex:1;
            display:flex;
            flex-direction :column;
            .group-name {
              flex:1;
              font-weight: 700px;
              font-size: 14px;
              height:23px;
              line-height:23px;
              .dot{
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
      }
    }
    .quitegroup{
      position absolute
      top 0px
      right 0px
      width: 60px
      height: 30px
      line-height 30px
      text-align center
      color red
      font-size 8px
      border-radius 6px
      background-color #fff
      cursor pointer
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
    .realgroup{
      position:absolute;
      top:0;
      left:50%;
      bottom:0;
      margin-left:-250px;
      width:500px;
      display:flex;
      flex-direction :column;
      font-size:16px;
      background-color :#fffeef;
      z-indx:100;
      &.creat-enter-active,&.creat-leave-active{
        transition:all .3s linear;
      }
      &.creat-enter,&.creat-leave-active{
        transform:translate3d(0,100%,0);
        opacity:0;
      }
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
      @media screen and (max-width:700px){
        width:100%;
        left:0;
        margin:0;
        overflow-y:scroll;
      }
      .title {
        flex: 0 0 30px;
        line-height: 30px;
        padding-right: 5px;
        cursor: pointer;
        width:100%;
        color: green;
        display: flex;
        .cancel {
          flex: 1;
          text-align: left;
          padding-left: 10px;
          color: red;
        }
        .create {
          flex: 1;
          padding-right: 5px;
          display :flex;
          flex-direction row-reverse
          width:100%;
          .createlogo{
            width:80px;
            height:30px;
            background-color :green;
            color:white;
            text-align center;
            border-radius :5px;
            margin-right:10px;
            .num {
              display inline-block
              width: 30px;
              height: 30px;
              line-height: 30px;
              text-align center
            }
          }

        }
      }
      .friends-content {
        display: flex;
        padding: 4px;
        background-color: #f6f6f6;
        position: relative;
        border-1px(rgba(7, 17, 27, .2))
        &:last-child {
          border-none()
        }
        img {
          flex: 0 0 46px;
        }
        .placename {
          flex: 1;
          height: 46px;
          line-height: 46px;
          padding-left: 10px;
        }
        .checkbox {
          position: absolute;
          right: 18px;
          top: 17px;
          border-radius: 3px;
          border: 1px solid #cba;
          width: 20px;
          height: 20px;
          .right {
            position: absolute;
            top: 11px;
            left: 2px;
            display: inline-block;
            width: 7px;
            height: 1px;
            background: white;
            line-height: 0;
            font-size: 0;
            vertical-align: middle;
            transform: rotate(45deg);
          }
          .right::after {
            content: '';
            display: block;
            width: 14px;
            height: 1px;
            background: white;
            transform: rotate(-100deg) translateY(-50%) translateX(50%);
          }
        }

        .chose {
          background-color: green;
        }
      }
    }
    .setgroup{
      position:absolute;
      top:0;
      left:50%;
      bottom:0;
      width:500px;
      margin-left:-250px;
      overflow:auto;
      display:flex;
      flex-direction :column;
      background-color :#fffeef;
      text-align :center;
      @media screen and (max-width:700px){
        width:100%;
        left:0;
        margin:0;
      }
      .title{
        flex:0 0 30px;
        display:flex;
        height:30px;
        line-height:30px;
        border-1px(rgba(7,17,27,.2))
        .name{
          flex:1;
          cursor:auto;
        }
        .icon-close{
          flex:0 0 30px;
          width:30px;
          font-size:20px;
          line-height:30px;
          cursor:pointer;
          &:hover{
            font-size:22px;
            color:red;
          }
        }
      }
      .chosenfriends{
        width: 100%;
        padding:10px 5px;
        border-1px(rgba(7,17,27,.2))
        .chosenfriend{
          display inline-block
          width 50px
          height 50px
          padding 1px
          img{
            border-radius 50%
          }
        }
      }
      .groupinfo{
        width:100%;
        height:300px;
        padding:10px 5px;
        .groupname{
          line-height :30px;
          display:flex;
          margin-bottom:20px;
          .nameleft{
            height:30px;
            flex:0 0 150px;
            text-align :right;
          }
          .input{
            display :block;
            height:30px;
            flex:0 0 250px;
            border:1px solid #ccc;
            font-size:16px;
            padding-left :5px;
          }
          .radio{
            height:90px;
            width:250px;
            text-align:left;
            padding-left:5px;
          }
          .textarea{
            width:250px;
            height:80px;
            padding:4px 3px 0 4px;
            box-sizing :border-box;
            border:1px solid #ccc;
            text-indent:2px;
            font-size:14px;
            &::-webkit-scrollbar-button{
              display: none;
            }
            &::-webkit-scrollbar{
              width: 1px;
              background-color: #fff;
            }

            /*定义滚动条轨道 内阴影+圆角*/
            &::-webkit-scrollbar-track{
              background-color: #fff;
            }

            /*定义滑块 内阴影+圆角*/
            &::-webkit-scrollbar-thumb{
              border-radius: 10px;
              background: #fff;
            }
          }
        }
      }
      .submit{
        width:80px;
        height:40px;
        border-radius:15px;
        background-color :blue;
        color:white;
        font-size:18px;
        text-align :center;
        line-height 40px;
        margin:0 auto;
        cursor default
      }
    }
    /*.group-container{*/
      /*margin-top:80px;*/
      /*width:100%;*/
      /*.group-apply{*/
        /*width: 158px;*/
        /*height: 48px;*/
        /*-webkit-border-radius: 4px;*/
        /*-moz-border-radius: 4px;*/
        /*border-radius: 4px;*/
        /*line-height: 50px;*/
        /*font-size: 16px;*/
        /*margin:0 auto;*/
        /*padding:0 24px;*/
        /*font-weight: 700;*/
        /*color:#fff;*/
      /*}*/
      /*.beforeSuccess{*/
        /*background: rgb(255,109,13);*/
      /*}*/
      /*.success{*/
        /*background: rgb(35,178,0);*/
      /*}*/
      /*.group-success-title{*/
        /*font-size:28px;*/
        /*color:rgb(33,170,0);*/
        /*font-weight:700;*/
        /*margin-bottom: 18px;*/

      /*}*/
      /*.group-title{*/
        /*margin-top: 20px;*/
        /*padding:0 20px;*/
        /*font-size:14px;*/
        /*line-height: 24px;*/
        /*text-align: center;*/
        /*color:red;*/
      /*}*/
      /*.group-fail{*/
        /*font-size:18px;*/
        /*color:rgb(183,183,183);*/
        /*font-weight:600;*/
        /*padding:8px 30px 0 30px;*/
      /*}*/
    /*}*/
  }

</style>
