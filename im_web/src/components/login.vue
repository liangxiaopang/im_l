<template>
<div class="loginmask" v-if="showloginmask">
  <div class="loginpannel">
    <div class="icon-close"></div>
    <div class="inputs">
      <div class="sign-input"><span>帐　号：</span><input ref="account" v-model="tele" autocomplete="on" type="text" style="ime-mode: disabled" class="input01" tabindex="1" placeholder="您的帐号" onBlur="if (value ==''){placeholder='您的帐号';}" /></div>
      <div class="sign-input"><span>密　码：</span><input v-model="pws" maxlength="16" type="password" class="input01" tabindex="2" placeholder="登陆密码" @keyup.enter="logins"/></div>
    </div>
    <div class="loginbtn">
      <div class="btn left" @click="logins">登录</div>
      <div class="btn right" @click="registerpannel">注册</div>
    </div>
    <!--<div>-->
      <alerts :str="alerttext" v-if="alertshow"></alerts>
    <!--</div>-->
  </div>
  <transition name="register">
    <div class="register" v-if="showregister">
      <div class="icon-close" @click="showlogin"></div>
      <div class="inputss">
        <div class="sign-input"><div class="title short">帐  号：</div><input v-model="tele" maxlength="11" autocomplete="on" name="u" id="u" type="text" style="ime-mode: disabled" class="input01" tabindex="1" placeholder="输入帐号" onFocus="if (placeholder =='输入帐号'){placeholder =''}" onBlur="if (value ==''){placeholder='输入帐号';}" /></div>
        <div class="sign-input"><div class="title">登 陆 密  码：</div><input v-model="pws" name="p" id="p" maxlength="16" type="password" class="input01" tabindex="2" placeholder="设置登陆密码" /></div>
        <div class="sign-input">
          <div class="title">确 认 密  码：<div class="checkpws" v-if="pwserror">密码不一致</div></div>
          <input v-debounce="delays"  v-model.lazy="repws" name="p" id="p" maxlength="16" type="password" class="input01" tabindex="2" placeholder="确认登陆密码" />
        </div>
        <div class="sign-input"><div class="title short">昵  称：</div><input v-model="nickname" name="q" id="q" maxlength="16" type="text" class="input01" tabindex="3" placeholder="16个字符以内" /></div>
        <div class="sign-input"><div class="title short">性  别：</div><input type="radio" value="1" class="sex"  id="man" v-model="picked"><label for="man">男</label><input type="radio" value="0" class="sex" id="women" v-model="picked"><label for="women">女</label></div>
        <div class="sign-input"><div class="title short">签  名：</div><input v-model="exact" maxlength="40" type="text" class="input01" tabindex="4" placeholder="说出你的秘密"/></div>
      </div>
      <div class="btnwrap">
        <button class="btn" @click="register">注册</button>
      </div>
      <alerts :str="alerttext" v-if="alertshow"></alerts>
    </div>
  </transition>

</div>
</template>

<script>
  import axios from 'axios'
  import {randomString,checkaccount,getNowFormatDate} from '../utils/util.js'
  import config from '../utils/config.js'
  import {test} from '../utils/util.js'
  import {mapState} from 'vuex'
  import qs from 'querystring'
  import alerts from './subcom/alert.vue'
  import debounce from '../utils/index.js'
  const REG_SUCCESS_NO = 0;
  const CryptoJS = require("crypto-js");
  export default{
    data() {
      return {
        tele: '',
        pws:'',
        repws:'',
        nickname:'',
        picked:'',
        exact:'',
        showregister:false,
        pwserror:false,
        delays:1000,
        alerttext:'',
        textarr:['密码或帐号不能为空','信息填写不完整','帐号不存在或密码错误',"填写不完整,请完善信息",'请用手机号码注册','帐号已存在,请重新填写或转到登陆','帐号已被注册'],
        alertshow:false,
      }
    },
    mounted(){
      this.$refs.account.focus()
    },
    components: {
      alerts
    },
    computed: {
      ...mapState(['currentuser', 'notices', 'friends', 'showloginmask','sessionlist']),
      key(){
        return this.$store.getters.getkey
      },
      opinion(){
        return this.$store.getters.getopinion
      }
    },
    watch:{
      repws:function(){
        if(this.pws!==this.repws){
          this.pwserror = true;
          return
        }else{
          this.pwserror = false;
        }
      },
      pws:function(){
        if(this.pws!==this.repws){
          this.pwserror = true;
          return
        }else{
          this.pwserror = false;
        }
      }
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
      logins(){
        let _this=this;
        if(this.tele==''||this.pws==''){
          let str = this.textarr[0];
          this.showalert(str)
          return
        }
        let data={
          appid:config.appid,
          account:_this.tele,
          password:CryptoJS.MD5(_this.pws).toString()
        };
        let url=config.httpServer+'index/checkAccount'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          if(response.error_code===0){
            let avatarurl = response.data.u_h_img
            _this.$store.dispatch('setavatat',avatarurl)
            this.clientlogin(this.tele,this.pws);
            this.$nextTick(()=>{
              setTimeout(_this.roomselectlist,600)
              setTimeout(_this.getdownfriends,500)
              setTimeout(_this.getFriendRequest,700)
              setTimeout(_this.getdownblacklist,800)
              setTimeout(function(){
                let sessionObj = JSON.parse(window.localStorage.msg_room_id)[_this.currentuser.uid]
                let len = _this.sessionlist.length
                for(let i=0;i<len;i++){
                  let got=false;
                  if(_this.sessionlist[i].rooms_type==='single'){
                    let roomid=_this.sessionlist[i].rooms_id
                    for(let key in sessionObj){
                      if(sessionObj[key].roomid===roomid){
                        got=true
                        for(let j=0,leng=_this.friends.length;j<leng;j++){
                          if(_this.friends[j].uid==key){
                            _this.friends[j].unread = _this.sessionlist[i].unread
                          }
                        }
                      }
                    }
                    if(!got){
                      _this.getsessionid(roomid)
                    }
                  }
                }
              },1000)
            })
          }
          else{
            let str = this.textarr[2];
            this.showalert(str)
            return
          }
        })
      },
      encrypt(app_id,word) {
        let srcs = word;
        let RandomStr  = randomString(16);
        let appid = CryptoJS.MD5(app_id).toString();
        let str2 = RandomStr+srcs+appid;
        let encrypted =CryptoJS.AES.encrypt(str2, this.key, this.opinion);
        return encrypted.toString();
      },
      Send_Data(app_id, method, data){
        let en_data = data;
        let isen=config.isencrypt;
        if (isen) {
          let strdata = JSON.stringify(data);
          en_data = this.encrypt(app_id,strdata);
        }
        let timestamp = getNowFormatDate();
        let jsonstrObj = {
          "app_id": app_id,
          "method": method,
          "version": "1.0",
          'timestamp': timestamp,
          "data": en_data
        };
        let jsonstr = JSON.stringify(jsonstrObj);
        let wordArray = CryptoJS.enc.Utf8.parse(jsonstr);//不一定需要这一段
        let base64str =  CryptoJS.enc.Base64.stringify(wordArray);
        this.$store.state.connection.send(base64str);
    },
      getFriendRequest(){
        let _this=this;
        let data={
          "uid":this.currentuser.uid
        };
        let url=config.httpServer+'index/getFriendRequest'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data.data;
          _this.$store.dispatch('addfriendrequest',response)
        })
      },
      getdownfriends(){
        let _this=this;
        let data = {
          "uid":this.currentuser.uid
        }
        let url=config.httpServer+'index/getDownFriends'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data.data;
          _this.$store.dispatch('getdownfriends',response)
        })
      },
      getdownblacklist(){
        let _this=this;
        let data = {
          "uid":this.currentuser.uid
        }
        let url=config.httpServer+'index/getMyBlack'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data.data;
          _this.$store.dispatch('getdownblacklist',response)
        })
      },
      clientlogin(acc,pwd){
        let fmd5password = CryptoJS.MD5(pwd).toString();
        let md5password = CryptoJS.MD5(fmd5password).toString()
        let data = {
          "uaccount": acc,
          "upassword": md5password
        };
        this.Send_Data(this.currentuser.app_sid,'clientlogin',data);
      },
      getsessionid(roomid){
        let data={
          auth_token:this.currentuser.auth_token,
          rooms_id:roomid
        }
        this.Send_Data(this.currentuser.app_sid,'rooms_select_userlist',data)
      },
      roomselectlist(){
        let data1={
          "auth_token":this.currentuser.auth_token
        }
        this.Send_Data(this.currentuser.app_sid,'rooms_select_list',data1);
      },
      registerpannel(){
        this.showregister=true;
      },
      register(){
//          if(checkaccount(this.telephone)){
//            let str = this.textarr[4];
//            this.showalert(str)
//            return;
//          }
//          if(this.telephone===''||this.pwd===''||this.nickname===''||this.picked===''){
//            let str = this.textarr[3];
//            this.showalert(str)
//            return;
//          }
        let _this=this;
        if(_this.tele==''||_this.pws==''||_this.nickname==''){
          let str = this.textarr[1];
          this.showalert(str)
          return
        }
        let data = {
          'appid': config.appid,
          'account': this.tele,
          'password':CryptoJS.MD5(this.pws).toString(),
          'nickname': this.nickname,
          'u_h_img': "",
          'sex': this.picked,
          'ext_user_info':"{'sign':"+this.exact+"}"
        };
        let url=config.httpServer+'index/userRegister'
        axios.post(url,qs.stringify(data)).then((response) => {
          response=response.data;
          if(response.error_code===REG_SUCCESS_NO){
            let avatarurl = response.data.u_h_img
            _this.$store.dispatch('setavatat',avatarurl)
            _this.$nextTick(()=>{
              _this.clientlogin(_this.tele,_this.pws);
            })
          }else if(JSON.stringify(response.error_code).slice(0,1)!=='0'){
            let str = '帐号已经被注册'
            _this.showalert(str)
            return
          }
          setTimeout(_this.roomselectlist,600)
          setTimeout(_this.getdownfriends,500)
          setTimeout(_this.getFriendRequest,700)
        })
      },
      showlogin(){
        this.showregister=false;
      }
    },
    directives:{debounce}
  }
</script>
<style lang='less' scoped>
.loginmask{
  width:100%;
  /*background: #fff;*/
  background: red;
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  min-height:100%;
  z-index:50;
  overflow:auto;
  .loginpannel{
    width:100%;
    z-index: 50;
    background: #f6f6f6;
    /*background: green;*/
    position:absolute;
    overflow: auto;
    top:0;
    left:0;
    bottom:0;
    display:flex;
    flex-direction: column;
    .icon-close{
      flex:0 0 30px;
      height:30px;
      text-align:right;
      font-size:30px;
      &:hover{
        color:red;
      }
    }
    .inputs {
      font: bold 15px arial;
      flex:0 0 240px;
      width:100%;
      height:240px;
      padding-top:150px;
      display:flex;
      flex-direction: column;
      .sign-input {
        flex:1;
        width:100%;
        position: relative;
        span{
          display:inline-block;
          width:10%;
          text-align:center;
          margin-left:25%;
          @media screen and (max-width:700px){
            font-size:12px;
            width:50px;
          }
        }
        .input01 {
          display: inline-block;
          width: 40%;
          border: 1px #ccc solid;
          color: #111;
          font-size: 16px;
          padding: 2px;
          -moz-border-radius: 10px;
          -webkit-border-radius: 10px;
          border-radius: 10px;
          outline: none;
          &:focus{
            -moz-box-shadow: 0 0 8px #000;
            -webkit-box-shadow: 0 0 8px #000;
            box-shadow: 0 0 8px #000;
          }
        }
      }
    }
    .loginbtn{
      width: 100%;
      flex:0 0 80px;
      height: 80px;
      font-size:20px;
      font-weight:700;
      text-align: center;
      .btn{
        display: inline-block;
        width:30%;
        height:30px;
        background: dodgerblue;
        margin:25px auto;
        color:#fff;
        line-height: 30px;
        border-radius: 8px;
        &:hover{
          -moz-box-shadow: 0 0 8px #000;
          -webkit-box-shadow: 0 0 8px #000;
          box-shadow: 0 0 8px #000;
        }
      }
      .left{
      }
      .right{
        background-color: deepskyblue;
      }
    }
  }
  .register{
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:100%;
    min-height: 100%;
    display:flex;
    overflow:auto;
    /*border:4px solid red;*/
    flex-direction: column;
    background:#eee;
    z-index: 50;
    &.register-enter-active,&.register-leave-active{
      transition:all .3s linear;
    }
    &.register-enter,&.register-leave-active{
      transform:translate3d(100%,0,0);
      /*opacity:0;*/
    }
    .icon-close{
      flex:0 0 30px;
      height:30px;
      font-size:30px;
      text-align: right;
    }
    .icon-close:hover{
      color:red;
    }
    .inputss{
      flex:0 0 400px;
      font: bold 15px arial;
      width:100%;
      height:400px;
      top: 28px;
      padding:70px 0 0 0;
      display: flex;
      flex-direction: column;
      .sign-input {
        flex:1;
        width:100%;
        .title{
          position:relative;
          display: inline-block;
          width:20%;
          margin-left:10%;
          line-height: 50px;
          .checkpws{
            position:absolute;
            bottom:-26px;
            left:60px;
            font-size:8px;
            width:60px;
            color:red;
            text-align: center;
          }
          @media screen and (max-width:700px){
            font-size:14px;
            width:85px;
          }
        }
        .input01 {
          /*width: 170px;*/
          display: inline-block;
          height: 34px;
          width:50%;
          margin-top: 8px;
          border: 1px #ccc solid;
          color: #111;
          font-size: 16px;
          padding-left: 12px;
          border-radius: 20px;
          outline: none;
          @media screen and (max-width:700px){
            font-size:12px;
          }
          &:focus{
            -moz-box-shadow: 0 0 8px #000;
            -webkit-box-shadow: 0 0 8px #000;
            box-shadow: 0 0 8px #000;
          }
        }
        .sex{
          display: inline-block;
          margin-left:20px;
        }
        label{
          display:inline-block;
          margin-left:4px;
          height:34px;
          line-height:34px;
          text-align: center;
        }
      }
    }
    .btnwrap{
      flex:0 0 100px;
      width:100%;
      .btn {
        display: block;
        background: deepskyblue;
        color: #eee;
        width: 40%;
        margin:30px auto;
        height: 40px;
        border: none;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        font-weight:700;
        font-size:20px;
        text-align: center;
        letter-spacing: 15px;
        &:hover{
          -moz-box-shadow: 0 0 8px #000;
          -webkit-box-shadow: 0 0 8px #000;
          box-shadow: 0 0 8px #000;
        }
      }
    }

  }
}
</style>
