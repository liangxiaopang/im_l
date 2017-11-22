<template>
  <transition name="movedown">
    <div class="info" v-if="infoshow">
      <div class="avatar">
        <img :src=currentuser.u_h_img alt="" width="100%" height="" id="img" v-if="currentuser.u_h_img">
        <span class="noavatat"  v-if="!currentuser.u_h_img">暂无头像
      </span>
      </div>
      <!--<div class="person">-->
        <!--<div class="common short">-->
          <!--<div class="uid">ID&nbsp:<span class="text">{{currentuser.uid}}</span></div>-->
          <!--<div class="sex">性&nbsp;别:<span class="text">{{sex[currentuser.sex]}}</span></div>-->
        <!--</div>-->
        <!--<div class="account common"><span class="title">帐&nbsp;号:</span><span class="text">{{currentuser.telephone}}</span></div>-->
        <!--<div class="nickname common"><span class="title">昵&nbsp;称:</span><span class="text">{{currentuser.nickname}}</span></div>-->
      <!--</div>-->
      <span class="uploadimg">
        <span v-if="currentuser.u_h_img">更换</span><span v-if="!currentuser.u_h_img">上传</span>头像
        <input type="file" accept="image/png,image/jpg,image/jpeg,image/gif" @change="changeavatar($event)">
      </span>
      <div class="success" v-if="changavasucc">头像更新成功</div>
      <alerts :str="alerttext" v-if="alertshow"></alerts>
    </div>
  </transition>
</template>

<script>
  import {mapState} from 'vuex'
  import lrz from 'lrz'
  import axios from 'axios'
  import qs from 'querystring'
  import config from '../../utils/config.js'
  import alerts from './alert.vue'
  export default{
    data(){
      return {
        sex:['女','男'],
        alerttext:'',
        alertshow:false
      }
    },
    computed:{
      ...mapState(['currentuser','infoshow','changavasucc'])
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
      dataURItoBlob(base64Data) {
        let byteString;
        byteString = window.atob(base64Data.split(',')[1]);
        let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
//        let ab = new ArrayBuffer(byteString.length)
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
      },
      changeavatar(event){
        let _this=this;
        let file = event.target.files[0];
        lrz(file,{
          width:config.maxavatarwidth,
          height:config.maxavatarheight,
          quality:0.6
        }).then((rst)=>{
          let blob = _this.dataURItoBlob(rst.base64);
          let fd = new window.FormData();
          fd.append('appid',config.appid);
          fd.append('uid',_this.currentuser.uid);
          fd.append('image',blob,'logo.jpeg')
          if(rst.fileLen<40*1000){
            let cfg={'headers':{'Content-Type':'application/x-www-form-urlencoded'}}
            let url=config.httpServer+'index/updateHeadUrl'
            axios.post(url,fd,cfg).then((response)=>{
              response = response.data
              let avatar = response.data.u_h_img
              _this.$store.dispatch('avatarsuccess')
              _this.$store.dispatch('updatavatar',avatar)
            })
          }else{
            let str = "头像需要小于40Kb";
            this.showalert(str)
          }

        }).always(()=>{
          event.target.value = ''
        })
      }
    },
    components:{alerts}

  }
</script>

<style lang="less" scoped>
  .info{
    width:192px;
    height:320px;
    position:absolute;
    top:20px;
    left:50%;
    z-index:5;
    margin-left:-96px;
    border-top-left-radius:40px;
    border-top-right-radius:40px;
    border-bottom-left-radius:10px;
    border-bottom-right-radius:10px;
    background:#f6f6f6;
    &.movedown-enter-active,&.movedown-leave-active{
      transition:all .5s linear;
    }
    &.movedown-enter,&.movedown-leave-active{
      transform:translate3d(0,100%,0);
      opacity:0;
    }
    .avatar{
      position:relative;
      width:100%;
      height: 0;
      padding-top: 100%;
      .noavatat{
        position:absolute;
        left:60px;
        top:80px;
        color:red;
      }
      img{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        border-top-left-radius:40px;
        border-top-right-radius:40px;
        border-bottom-left-radius:10px;
        border-bottom-right-radius:10px;
      }
    }
    .person{
      padding:4px 6px;
      .common {
        margin-bottom:12px;
        cursor:default;
      }
      .short{
        display: flex;
        .uid{
          flex:1;
        }
        .sex{
          flex:1;
        }
      }
      .account{
        width:100%;
        .text{
          margin-left:5px;
        }
      }
      .nickname{
        width:100%;
        display:flex;
        .title{
          flex:0 0 30px;
        }
        .text{
          margin-left:5px;
        }
      }
    }
    .uploadimg {
      position: relative;
      width:80px;
      display: block;
      background: #D0EEFF;
      border: 1px solid #99D3F5;
      border-radius: 4px;
      padding: 4px 12px;
      overflow: hidden;
      color: #1E88C7;
      text-align:center;
      text-decoration: none;
      text-indent: 0;
      line-height: 20px;
      margin:60px auto 0;
      input {
        position: absolute;
        font-size: 10px;
        right: 0;
        top: 0;
        opacity: 0;
      }
      &:hover{
        background: #AADFFD;
        border-color: #78C3F3;
        color: #004974;
        text-decoration: none;
      }
    }
    .success{
      position:absolute;
      width:80px;
      height:20px;
      bottom:30px;
      left:54px;
      font-size:10px;
      color:blue;
    }
  }
</style>
