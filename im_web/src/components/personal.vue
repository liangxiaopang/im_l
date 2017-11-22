<template>
	<div class="personal" @click="hideavatar">
    <div class="person">
      <div class="confirm" v-show="showconfirm">
        <p>确认放弃更改吗?</p>
        <div class="opt">
          <div class="right" @click="giveup">放弃</div>
          <div class="wrong" @click="conti">点错了</div>
        </div>
      </div>
      <personalinfo></personalinfo>
      <img :src="currentuser.u_h_img" width="128" height="128" class="avatar" @click.stop.prevent="showinfo">
      <div class="content">
        <div class="uid">
          <div class="title">ID:</div><div class="num">{{currentuser.uid}}</div>
        </div>
        <div class="uid">
          <div class="title">帐号:</div><div class="num">{{currentuser.telephone}}</div>
        </div>
        <div class="uid">
          <div class="title">昵称:</div>
          <div class="num">
            <div class="before" ref="nicknamebefore">{{currentuser.nickname}}</div>
            <input class="after" v-show="!sel" v-model="nickname" ref="inps" @focus="cleartext">
          </div>
        </div>
        <div class="uid">
          <div class="title">性别:</div>
          <div class="num" v-show="sel">{{sex[currentuser.sex]}}</div>
          <div class="num" ref="sex" v-show="!sel">
            <select v-model="sele" class="select">
              <!--<option disabled value="">请选择</option>-->
              <option value="1">男</option>
              <option value="0">女</option>
            </select>
          </div>
        </div>
        <div class="uid">
          <div class="title">签名:</div>
          <div class="num">
            <div class="before" ref="signbefore">{{currentuser.ext_user_info}}</div>
            <textarea class="textarea" v-show="!sel" v-model="sign"  ref="inp" @focus="clearsign"></textarea>
          </div>
        </div>
        <div class="change">
          <alerts :str="alerttext" v-if="alertshow"></alerts>
          <div class="edit" v-show="sel" @click="change">编辑资料</div>
          <div class="submit " v-show="!sel">
            <div class="yes" @click="submit">提交</div>
            <div class="no" @click="popupconfirm">取消</div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>
<script>
import {mapState} from 'vuex'
import axios from 'axios'
import qs from 'querystring'
import alerts from './subcom/alert.vue'
import personalinfo from './subcom/personalinfo.vue'
import config from '../utils/config.js'
  export default{
    data(){
    return{
      sex:['女','男'],
      sexrev:{'女':0, '男':1},
      sel:true,
      showconfirm:false,
      sele:'',
      nickname:'',
      sign:'',
      alerttext:'',
      alertshow:false
    }
  },
    computed:{
      ...mapState(['currentuser'])
//      showsign(){
//        let str=this.currentuser.ext_user_info
//        let len=str.length
//        if(str.length === 2) return this.signature;
//        else if(str.slice(0,1)=="'"||str.slice(0,1)=='"'){
//          return str.slice(1,len-1)
//        }
//        else{
//          return str
//        }
//      }
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
      showinfo(){
        this.$store.commit('infoboxshow')
      },
      hideavatar(){
        this.$store.commit('infoboxhide')
      },
      change(){
        let el=this.$refs.inp
        let els=this.$refs.inps
        let sex=this.$refs.sex
        el.style.border='2px solid #c9c9c9'
        els.style.border='2px solid #c9c9c9'
        this.sel=!this.sel
      },
      popupconfirm(){
        this.showconfirm=true
      },
      submit(){
        let _this=this;
        let data={
          "appid": config.appid,
          "uid": this.currentuser.uid,
          "nickname": this.nickname,
          "sex":this.sexrev[this.sele],
          "ext_user_info": "{'sign':"+this.sign+"}"
        }
        let url=config.httpServer+'index/updateMessage'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response= response.data
          if(response.error_code === 0){
            let str='更新成功'
            _this.showalert(str)
            _this.$store.dispatch('updatepersonalinfo',response.data)
            let el=this.$refs.inp
            let els=this.$refs.inps
            el.style.border='none'
            els.style.border='none'
            this.sel=!this.sel
            this.$refs.nicknamebefore.style.display="block";
            this.nickname=''
            this.$refs.signbefore.style.display="block";
            this.sign=''
          }
        })
      },
      cleartext(){
        this.$refs.nicknamebefore.style.display="none";
      },
      clearsign(){
        this.$refs.signbefore.style.display='none';
      },
      giveup(){
        let el=this.$refs.inp
        let els=this.$refs.inps
        el.style.border='none'
        els.style.border='none'
        this.sel=!this.sel
        this.$refs.nicknamebefore.style.display="block";
        this.nickname=''
        this.$refs.signbefore.style.display="block";
        this.sign=''
        this.showconfirm=false
      },
      conti(){
        this.showconfirm=false
      }
    },
    components:{
      alerts,
      personalinfo
    }
  }
</script>
<style lang="stylus" scoped>
  .person{
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
    overflow hidden
    @media screen and (max-width:700px){
      width:100%;
      left:0;
      margin:0;
      overflow-y:scroll;
    }
    .confirm{
      position:absolute;
      z-index:2;
      left:0;
      width:100%;
      top:300px;
      height:150px;
      border-radius :10px;
      text-align :center;
      background-color :#eee;
      p{
        margin-top:30px;
      }
      .opt{
        display:flex;
        width:100%;
        height:30px;
        line-height :30px;
        margin-top:50px;
        cursor:pointer;
        .right{
          flex:1;
          color:red;
          border-right:1px solid #f6f6f6;
          &:hover{
            background-color :#f6f6f6;
            border-radius :40px;
          }
        }
        .wrong{
          flex:1;
          color:#ccc;
          &:hover{
            background-color :#f6f6f6;
            color:black;
            border-radius :40px;
          }
        }
      }
    }
    .avatar{
      flex:0 0 128px;
      height:128px;
      margin:30px auto 0;
      border-radius :50%;
      cursor:pointer;
      &:hover{
        -moz-box-shadow: 0 0 8px #333;
        -webkit-box-shadow: 0 0 8px #333;
        box-shadow: 0 0 8px #333;
        cursor:pointer;
      }
    }
    .content{
      flex:1;
      padding:10px 6px;
      display :flex;
      flex-direction :column;
      .uid{
        flex:0 0 25px;
        display:flex;
        width:100%;
        height:25px;
        cursor:pointer;
        line-height:25px;
        margin-bottom:5px;
        .title{
          flex:0 0 250px;
          text-align:right;
          padding-right:5px;
          @media screen and (max-width:700px){
            flex:0 0 50%;
          }
        }
        .num{
          flex:0 0 200px;
          font-size:16px;
          font-weight:300;
          color:#333;
          text-align:left;
          padding-left:5px;
          position:relative;
          /*overflow :hidden;*/
          .before{
            position:absolute;
            padding-left:5px;
            top:0;
            left:0;
            right:0;
          }
          .after{
            display :block;
            position:absolute;
            top:0;
            left:-2px;
            width:100%;
            color:red;
            height:25px;
            font-size:18px;
            font-weight :300;
            background-color :transparent;
          }
          .select{
            display :block;
            margin-top:1px;
            background:white;
          }
          .textarea{
            display :block;
            position:absolute;
            top:0;
            left:0px;
            width:100%;
            box-sizing :border-box;
            border:none;
            min-height:50px;
            padding-left:0px;
            font-size:16px;
            font-weight:300;
            color:red;
            background-color :transparent;
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
              background: #ccc;
            }
          }
        }
      }
      .change{
        flex:0 0 140px;
        margin-top:60px;
        position: relative;
        .edit{
          text-align :center;
          color:red;
          border:1px solid #f6f6f6;
          width:80px;
          heihgt:40px;
          line-height :40px;
          border-radius :40px;
          margin :0 auto;
          cursor:pointer;
          &:hover{
            box-shadow :0 0 4px #333;
          }
        }
        .submit{
          width:120px;
          height:40px;
          line-height :40px;
          text-align :center;
          border-radius :40px;
          border:1px solid #f6f6f6;
          display:flex;
          cursor:pointer;
          margin:0 auto;
          .yes{
            flex:1;
            color:red;
            border-right:1px solid #f6f6f6;
            &:hover{
              background-color :#f6f6f6;
              border-radius :40px;
            }
          }
          .no{
            flex:1;
            color:#ccc;
            &:hover{
              background-color :#f6f6f6;
              color:black;
              border-radius :40px;
            }
          }
        }
      }
    }
  }

</style>
