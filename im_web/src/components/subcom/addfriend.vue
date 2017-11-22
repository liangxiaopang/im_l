<template>
  <transition name="movetop">
    <div class="addfriend" v-show="addfriendnow">
    <div class="title border-1px">
      <div class="search" @click="showsearchbox" :class="{'selected':searchfriend}">查找</div>
      <div class="search" @click="showfindbox" :class="{'selected':findfriend}">搜索</div>
      <div class="search" @click="showfindgroup" :class="{'selected':searchgroup}">找群</div>
      <div class="icon-close" @click="closeaddfriend"></div>
    </div>
    <transition name="result">
      <div class="searchfriend" v-show="searchfriend">
        <div class="searchfriendbody"><input ref="con" type="text" placeholder="对方帐号或昵称,搜id在隔壁" v-model="condition" @keyup.enter="search"></div>
        <div class="btns" @click="search">查找</div>
      </div>
    </transition>
    <transition name="result">
        <div class="searchfriend" v-show="searchgroup">
          <div class="searchfriendbody"><input ref="con" type="text" placeholder="群组名称" v-model="groupname" @keyup.enter="searchgroups"></div>
          <div class="btns" @click="searchgroups">搜群</div>
        </div>
    </transition>
    <transition name="result">
      <div class="findfriend" v-show="findfriend">
        <div class="input"><span class="titlel">对方账号：</span><div class="inputdiv"><input v-model="content" class="input01" placeholder="直接搜索对方id"/></div></div>
        <div class="input1"><span class="titlel1">验证信息：</span><div class="inputdiv"><textarea v-model="authmsg" class="input011" placeholder="我是..."></textarea></div></div>
        <div class="btn" @click="sendfriendrequest(content,authmsg)">添加</div>
      </div>
    </transition>
    <transition name="result">
      <div class="searchresult" v-show="resultbox">
        <div class="title1  border-1px">
          <div class="content">查找结果</div>
          <div class="icon-close" @click="closeresultbox"></div>
        </div>
        <ul class="list">
          <li v-for="(result,index) in searchresult" :class="{'extrainfo':result.hasclick}">
            <div class="searchinfo">
              <img :src="result.u_h_img" alt="" width="40" height="40">
              <div class="info">
                <div class="nick">帐  号:  {{result.account}}</div>
                <div class="nick">昵  称:  {{result.nickname}}</div>
              </div>
              <div class="add" v-show="!result.hasclick">
                <div class="button" @click="addfriends(result,index)" :class="{'isfriend':result.forbidden}"><span>添加</span></div>
              </div>
            </div>
              <div class="extra">
                <textarea placeholder="请输入验证信息..." v-model="extracontent"></textarea>
                <div class="next" @click="sendfriendrequest(result.uid,extracontent)">发送</div>
              </div>
          </li>
        </ul>
      </div>
    </transition>
    <transition name="result">
        <div class="searchresult" v-show="groupresultbox">
          <div class="title1  border-1px">
            <div class="content">查找结果</div>
            <div class="icon-close" @click="closeresultbox"></div>
          </div>
          <ul class="list">
            <li v-for="(result,index) in searchgroupresultarr" :class="{'extrainfo':result.hasclick}">
              <div class="searchinfo">
                <img :src="result.group_head" alt="" width="40" height="40" :alt="result.group_name" :title="result.group_name">
                <div class="info">
                  <div class="nick">群  名:  {{result.group_name}}</div>
                </div>
                <div class="add" v-show="!result.hasclick">
                  <div class="button" @click="addgroup(result,index)" :class="{'isfriend':result.forbidden}"><span>添加</span></div>
                </div>
              </div>
              <div class="extra">
                <textarea placeholder="请输入验证信息..." v-model="extracontent"></textarea>
                <div class="next" @click="sendaddgroup">发送</div>
              </div>
            </li>
          </ul>
        </div>
      </transition>
      <alerts :str="alerttext" v-if="alertshow"></alerts>
  </div>
  </transition>
</template>

<script>
  import axios from 'axios';
  import Vue from 'vue';
  import qs from 'querystring'
  import {mapState} from 'vuex';
  import config from '../../utils/config.js'
  import alerts from './alert.vue'
  const REG_SUCCESS_NO = 0;
  export default {
    data(){
      return{
        content:'',
        authmsg:'',
        searchfriend:true,
        findfriend:false,
        searchgroup:false,
        condition:'',
        groupname:'',
        resultbox:false,
        groupresultbox:false,
        isfriend:false,
        extracontent:'',
        alerttext:'',
        textarr:['请输入查找条件','发送成功','请输入搜索id',"填写不完整,请完善信息",'请用手机号码注册','帐号已存在,请重新填写或转到登陆','帐号已被注册'],
        alertshow:false
      };
    },
    computed:{
      ...mapState(['currentuser','friends','searchresult','choosecontent','addfriendnow','groups','searchgroupresultarr'])
    },
    components:{alerts},
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
      showsearchbox(){
        let searchel=this.$refs.search
        let findel=this.$refs.find
        let groupel=this.$refs.group
        this.searchfriend=true;
        this.findfriend=false;
        this.searchgroup=false
      },
      showfindbox(){
        this.searchfriend=false;
        this.findfriend=true;
        this.searchgroup=false;
      },
      showfindgroup(){
        this.searchfriend=false;
        this.findfriend=false;
        this.searchgroup=true;
      },
      closeaddfriend(){
        this.$store.commit('closeaddfriend')
        this.condition=''
      },
      closeresultbox(){
        this.resultbox=false;
        this.groupresultbox=false;
      },
      search(){
        let _this=this;
        _this.groupresultbox = false
        if(this.condition==''){
          let str = this.textarr[0];
          this.showalert(str)
          return
        }
        let data={
          'appid':config.appid,
          'uid':_this.currentuser.uid,
          'condition':_this.condition
        }
        let url=config.httpServer+'index/userSearch'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response= response.data;
          if(response.error_code === 0){
            _this.resultbox = true;
            let obj = response.data
            _this.$store.dispatch('searchfriendresult',obj)
          }
        })
      },
      searchgroups(){
        let _this=this;
        _this.resultbox = false;
        if(this.groupname==''){
          let str = this.textarr[0];
          this.showalert(str)
          return
        }
        let data={
          'appid':config.appid,
          "group_name": this.groupname.trim()
        }
        let url1=config.httpServer+'index/groupSearch'
        axios.post(url1,qs.stringify(data)).then((response)=>{
          response= response.data;
          if(response.error_code === 0){
            _this.groupresultbox = true
            let obj = response.data
            _this.$store.dispatch('searchgroupresult',obj)
          }
        })
      },
      sendfriendrequest(frienduid,info){
        let _this = this
        if(frienduid===''){
          let str = this.textarr[2];
          this.showalert(str)
          return
        }
        let len = _this.friends.length
        for(let i=0;i<len;i++){
          if(frienduid === _this.friends[i].uid){
            let str = frienduid+'已经是您的好友'
            _this.showalert(str)
            return 0;
          }
        }
        let data = {
          appid:config.appid,
          from_id:_this.currentuser.uid,
          to_id:frienduid,
          send_msg:info
        }
        let url2=config.httpServer+'index/addFriendRequest'
        axios.post(url2,qs.stringify(data)).then((response) => {
          response=response.data;
          console.log('response---'+JSON.stringify(response))
          if(response.error_code===REG_SUCCESS_NO){
            let str = '发送成功'
            _this.showalert(str)
            _this.$nextTick(function () {
              _this.searchresult.forEach(function (result) {
                Vue.set(result,'hasclick',false);
              });
            });
          }
        })
      },
      sendaddgroup(){
        let str='加群功能还未开通'
        this.showalert(str)
        return
      },
      addfriends(result,index){
        let _this=this
        if(_this.searchresult[index].is_friend){
          _this.$store.dispatch('forbiddenadd',index)
          let str = _this.searchresult[index].nickname+'已经是您的好友'
          _this.showalert(str)
          return
        }
        _this.$nextTick(function () {
          _this.searchresult.forEach(function (result) {
            Vue.set(result,'hasclick',false);
          });
          Vue.set(result,'hasclick',true);
        });
      },
      addgroup(result,index){
        let _this=this
        for(let i=0,len=this.groups.length;i<len;i++){
          if(result.rooms_id===this.groups[i].rooms_id){
            let str ='您已经在群'+'['+result.group_name+']中'
            _this.showalert(str)
            _this.$store.commit('forbiddenaddgroup',index)
            return
          }
        }
        _this.$nextTick(function () {
          _this.searchgroupresultarr.forEach(function (result) {
            Vue.set(result,'hasclick',false);
          });
          Vue.set(result,'hasclick',true);
        });
      }
    },
    mounted(){
      this.$refs.con.focus()
    },
  }
</script>

<style lang='stylus' scoped>
@import '../../assets/stylus/mixin.styl'
.addfriend{
  width:100%;
  position:absolute;
  left:0;
  top:145px;
  bottom:30px;
  z-index:150;
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
  .title{
    display: flex;
    width:100%;
    height:40px;
    position:relative;
    left:0;
    top:0;
    text-align: center;
    color:#111;
    line-height:40px;
    font-weight:600;
    letter-spacing: 10px;
    font-size:16px;
    border-1px(rgba(7,17,27,.2))
    .search{
      flex:1;
      text-align: center;
      cursor:pointer;
      &:hover{
        font-size:18px;
      }
    }
    .selected{
      color:red;
      font-size:18px
    }
    .icon-close{
      flex:0 0 40px;
      width:40px;
      height:40px;
      cursor:pointer;
      line-height:40px;
      font-size:20px;
      text-align: right;
    }
    .icon-close:hover{
      color:red;
      font-size: 26px;
      color:red;
      border-radius:50%;
    }
  }
  .searchfriend{
    width:100%;
    height:180px;
    position:absolute;
    top:40px;
    left:0;
    background-color:#f6f6f6;
    &.result-enter-active,&.result-leave-active{
      transition:all .3s linear;
    }
    &.result-enter,&.result-leave-active{
      transform:translate3d(-100%,0,0);
      opacity:0;
    }
    .searchfriendbody{
      position:relative;
      margin-top:40px;
      width:100%;
      height:40px;
      input{
        width:50%;
        height:40px;
        display :block;
        -moz-border-radius: 18px;
        -webkit-border-radius: 18px;
        border-radius: 18px;
        -moz-box-shadow: 0 0 3px #000;
        -webkit-box-shadow: 0 0 3px #000;
        box-shadow: 0 0 3px #000;
        padding-left:15px;
        font-size:14px;
        margin:0 auto;
      }
    }
    .btns{
      width:25%;
      height:25px;
      cursor:pointer;
      background: deepskyblue;
      border-radius: 30px;
      text-align:center;
      line-height:25px;
      font-size:16px;
      font-weight:600;
      color:white;
      letter-spacing: 2px;
      margin:20px auto 0;
      &:hover{
        -moz-box-shadow: 0 0 8px #000;
        -webkit-box-shadow: 0 0 8px #000;
        box-shadow: 0 0 8px #000;
      }
    }
  }
  .findfriend{
    //直接添加背景色居然就解决了乱局的问题
    background-color:#f6f6f6;
    width:100%;
    height:250px;
    position:absolute;
    top:40px;
    left:0;
    &.result-enter-active,&.result-leave-active{
      transition:all .3s linear;
    }
    &.result-enter,&.result-leave-active{
      transform:translate3d(-100%,0,0);
      /*opacity:0;*/
    }
    .input{
      display: flex;
      width:100%;
      height:40px;
      margin-top:40px;
      font-size:16px;
      font-weight:700;
      .titlel{
        display: block;
        flex-grow:1;
        height:40px;
        line-height:40px;
        text-align right;
      }
      .inputdiv{
        flex-grow:2;
        .input01{
          display: block;
          height:40px;
          width:60%;
          margin-left:10px;
          font-size: 12px;
          padding-left:20px;
          border:1px solid #999;
          -moz-border-radius: 20px;
          -webkit-border-radius: 20px;
          border-radius: 20px;
          -moz-box-shadow: 0 0 3px #000;
          -webkit-box-shadow: 0 0 3px #000;
          box-shadow: 0 0 3px #000;
        }
      }

    }
    .input1{
      display: flex;
      width:100%;
      height:80px;
      margin-top:25px;
      .titlel1{
        display:block;
        flex-grow:1;
        height: 40px;
        line-height:40px;
        text-align:right;
        font-size:16px;
        font-weight:700
      }
      .inputdiv{
        flex-grow:2;
        .input011{
          display:block;
          height:68px;
          box-sizing :border-box;
          margin-left:10px;
          width:60%;
          padding-top:6px;
          font-size:16px;
          resize:none;
          border:1px solid #999;
          -moz-border-radius: 10px;
          -webkit-border-radius: 10px;
          border-radius: 10px;
          -moz-box-shadow: 0 0 3px #000;
          -webkit-box-shadow: 0 0 3px #000;
          box-shadow: 0 0 3px #000;
          &::-webkit-scrollbar-button{
            display: none;
          }
          &::-webkit-scrollbar{
            width: 1px;
            background-color: #999;
          }

          /*定义滚动条轨道 内阴影+圆角*/
          &::-webkit-scrollbar-track{
            background-color: #999;
          }

          /*定义滑块 内阴影+圆角*/
          &::-webkit-scrollbar-thumb{
            border-radius: 10px;
            background: #999;
          }
        }
      }

    }
    .btn{
      width:120px;
      height:30px;
      cursor:pointer;
      background: deepskyblue;
      border-radius: 30px;
      text-align:center;
      line-height:30px;
      font-size:16px;
      font-weight:600;
      color:white;
      letter-spacing: 2px;
      margin:20px auto 0;
      &:hover{
        -moz-box-shadow: 0 0 8px #000;
        -webkit-box-shadow: 0 0 8px #000;
        box-shadow: 0 0 8px #000;
      }
    }
  }
  .searchresult{
    width:100%;
    background: #f6f6f6;
    position:absolute;
    top:180px;
    left:0;
    bottom:0;
    min-height:200px;
    &.result-enter-active,&.result-leave-active{
      transition:all .3s linear;
    }
    &.result-enter,&.result-leave-active{
      transform:translate3d(0,100%,0);
      /*opacity:0;*/
    }
    .title1{
      width:100%;
      height:20px;
      display: flex;
      border-1px(rgba(7,17,27,.2))
      .content{
        flex:1;
        text-align: center;
        font-size:14px;
        line-height: 20px;
        cursor:pointer;
        &:hover{
          font-size:16px;
        }
      }
      .icon-close{
        flex:0 0 20px;
        width:20px;
        font-size:16px;
        height:20px;
        &:hover{
          font-size:18px;
          color:red;
        }
      }
    }
    .list{
      width:100%;
      height:280px;
      position: absolute;
      left:0;
      top:20px;
      min-height :180px;
      overflow-y:scroll;
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
        border-radius: 3px;
        background: #ccc;
      }
      li{
        width: 100%;
        height:40px;
        overflow:hidden;
        transition:height 1s ease;
        -moz-transition:height 1s ease; /* Firefox 4 */
        -webkit-transition:height 1s ease; /* Safari and Chrome */
        .searchinfo{
          height:40px;
          width:100%;
          margin-top:5px;
          display: flex;
          &:hover{
            background-color:white;
          }
          img{
            display: block;
            flex:0 0 40px;
            border-radius:50%;
            cursor:pointer;
          }
          .info{
            flex:1;
            display:flex;
            flex-direction:column;
            margin-left:6px;
            padding-left:2px 10px;
            font-size:14px;
            color:#6f6f6f;
            cursor:default;
            .nick{
              flex:1;
              height:17px;
              line-height:17px;
            }
          }
          .add{
            flex:0 0 74px;
            padding:9px ;
            color:white;
            .button{
              background:deepskyblue;
              height:20px;
              width:54px;
              line-height:20px;
              border-radius: 8px;
              font-size:10px;
              text-align: center;
              margin:0 auto;
              cursor:pointer;
              &:hover{
                font-size:10px;
                -moz-box-shadow: 0 0 8px #000;
                -webkit-box-shadow: 0 0 8px #000;
                box-shadow: 0 0 8px #000;
              }
            }
            .isfriend{
              background-color:grey;
              pointer-events: none;
              cursor: default;
              opacity: 0.6;
              color:#ccc;
            }
          }
        }
        .extra{
          width:100%;
          height:60px;
          position:relative;
          textarea{
            width:100%;
            height:56px;
            border:none;
            padding-left:16px;
            padding-top: 10px;
          }
          .next{
            position: absolute;
            right:8px;
            bottom:16px;
            width:40px;
            height:18px;
            line-height:18px;
            text-align: center;
            font-size:6px;
            background-color: deepskyblue;
            color:#efefef;
            border-radius: 5px;
            cursor:pointer;
            &:hover{
              -moz-box-shadow: 0 0 8px #000;
              -webkit-box-shadow: 0 0 8px #000;
              box-shadow: 0 0 8px #000;
            }

          }
        }
      }
      .extrainfo{
        height:100px;
      }

    }
  }
}
</style>
