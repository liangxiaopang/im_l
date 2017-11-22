<template>
  <div id="header" @click.stop.prevent="clickhead">
    <!--<img width="48" height="22" src="../../assets/image/cai.jpg" alt="" class="cai-jpg">-->
    <div class="content-wrapper">
    	<div class="avatar">wozaina
        <img width="64" height="64" :src="currentuser.u_h_img" alt="">
      </div>
      <div class="content">
        <p class="title">{{greet}}&nbsp;&nbsp;{{currentuser.nickname}}</p>
        <p class="place sign" :title=currentuser.ext_user_info>{{currentuser.ext_user_info}}</p>
        <p class="place"><span class="iconfont icon-ditu"></span>本次登录地点：{{pos}}</p>
      </div>
      <i class="iconfonts icon-remove_circle_outline"></i>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  const jsonp=require('jsonp')
	export default{
		data(){
      return{
        loginplace:{nowCity:"南昌"},
        timearr:['上午好','下午好','晚上好'],
        signature:'今天有什么段子吗?',
        pos:''
      };
    },
    computed:{
      ...mapState(['currentuser']),
      greet(){
		    let date= new Date();
		    let hour=date.getHours();
		    if(hour>=5&&hour<12) return this.timearr[0];
		    else if(hour>=12&&hour<18) return this.timearr[1];
		    else return this.timearr[2];
      }
    },
    methods:{
		  clickhead(){
        this.$store.commit('dropdownhide')
        this.$store.commit('infoboxhide')
        this.$store.commit('canceltogroup')
        this.$store.commit('quiteboxshow',false)
      },
      showinfo(){
        this.$store.commit('infoboxshow')
      }
    },
    mounted(){
		  let _this=this
      let url="http://api.map.baidu.com/location/ip?ak=QYXmlTQ8VyRXxrrCdkWjdyx54BpiOr0I&coor=bd09ll"
      jsonp(url,null,function(err,data){
        if(err){
          _this.pos='未知'
        }else{
          _this.pos=data.content.address
        }
      })
    }
	};
</script>
<style lang="less" scoped>
  #header{
    background: #12b7b4;
    overflow: hidden;
    color: #eee;
    position: relative;
    .content-wrapper{
      display: flex;
      height: 105px;
      font-size:0px;
      position:relative;
      .avatar{
        flex:0 0 105px;
        width:105px;
        cursor:pointer;
        img{
          border-radius:50%;
          position:absolute;
          top:21px;
          left:21px;
        }
      }
      .content{
        flex:1;
        display: flex;
        flex-direction: column;
        padding-top:25px;
        .title{
          flex:1;
          font-size:15px;
          font-weight: 700;
        }
        .sign{
          width:86%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .place{
          flex:1;
          font-size:12px;
          color:#ecf4f6;
          span{
            margin-right: 2px;
          }
          .iconfont{
            font-weight: 700px;
            font-size: 14px;
          }
        }
      }
    }
  }
</style>
