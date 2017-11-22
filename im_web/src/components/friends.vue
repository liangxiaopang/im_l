<template>
	<div class="friends">
    <div class="friend">
      <div class="bannel">
        <div class="left"  @click="clickfriend">
          <div class="triangle" :class="{rotate:isclickfriend}"></div>
        </div><div  @click="clickfriend">我的好友<span v-if="friends.length">(&nbsp;{{friends.length}}&nbsp;)</span></div>
      </div>
      <ul v-show="isclickfriend">
        <li v-for="(friend,index) in friends" class="friends-content border-1px" @click="dialog" @contextmenu.prevent="menushow($event,index)">
          <img :src="friend.u_h_img" alt="" width="46" height="46">
          <div class="placename">{{friend.nickname}}</div>
        </li>
      </ul>
    </div>
    <div class="friend">
      <div class="bannel">
        <div class="left"  @click="clickblacklist">
          <div class="triangle" :class="{rotate:isclickblacklist}"></div>
        </div><div @click="clickblacklist">黑名单<span v-if="blacklist.length">(&nbsp;{{blacklist.length}}&nbsp;)</span></div>
      </div>
      <ul v-show="isclickblacklist">
        <li v-for="(friend,index) in blacklist" class="friends-content" @click="clickblack" @contextmenu.prevent="showremove($event,index)">
          <img :src="friend.u_h_img" alt="" width="46" height="46">
          <div class="placename">{{friend.nickname}}</div>
        </li>
      </ul>
      <div class="removeblacklist" v-show="showremovebox" ref="removebox" @click="popreovebox">移出黑名单</div>
      <div class="confirm" v-show="confirmremoveblack">
        <div class="titl">确定要把[&nbsp;<div class="groupname" :title="chosenblack.nickname">{{chosenblack.nickname}}</div>&nbsp;]移出黑名单吗</div>
        <div class="opt">
          <div class="right" @click="removefromblack">确定</div><div class="right one" @click="giveup">取消</div>
        </div>
      </div>
    </div>
    <alerts :str="alerttext" v-if="alertshow"></alerts>
    <!--<dialogbox v-if="dialogboxshow"></dialogbox>-->
	</div>
</template>
<script>
  import {mapState} from 'vuex'
  import axios from 'axios'
  import qs from 'querystring'
  import dialogbox from './subcom/dialogbox'
  import config from '../utils/config.js'
  import alerts from './subcom/alert.vue'
	export default{
		data(){
			return{
			  isclickfriend:true,
        isclickblacklist:false,
        showremovebox:false,
        confirmremoveblack:false,
        alerttext:'',
        alertshow:false
      };
		},
    computed:mapState(['friends','dialogboxshow','blacklist','chosenblack','currentuser']),
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
      clickfriend(){
        this.isclickfriend=!this.isclickfriend
      },
      dialog(){
        this.$store.dispatch('controldialogbox', true)
      },
      clickblacklist(){
        this.isclickblacklist=!this.isclickblacklist
      },
      menushow($event,index){

      },
      clickblack(){
        this.showremovebox=false
      },
      showremove($event,index){
        this.showremovebox=true
        let top = $event.offsetY+50+48*index;
        let left=$event.offsetX;
        let el=this.$refs.removebox;
        el.style.left=(left+64)+'px';
        el.style.top=top+'px';
        this.$store.commit('getchoosenblack',index)
      },
      popreovebox(){
        this.confirmremoveblack=true
        this.showremovebox=false
      },
      giveup(){
        this.confirmremoveblack=false
      },
      removefromblack(){
        this.confirmremoveblack=false
        let _this=this
        let data = {
          appid:config.appid,
          uid1:this.currentuser.uid,
          uid2:this.chosenblack.uid
        }
        let url=config.httpServer+'index/delBlack'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response = response.data;
          if(response.error_code===0){
            let str =_this.chosenblack.nickname+ '已从黑名单移出';
            _this.showalert(str)
            _this.$store.dispatch('removefromblacklist')
          }

        })
      }
    },
    components:{
      dialogbox,alerts
    }
	};
</script>
<style lang="stylus" scoped>
	.friends {
    &::-webkit-scrollbar-button {
      display: none;
    }
    &::-webkit-scrollbar {
      width: 1px;
      background-color: #ccc;
    }

    /*定义滚动条轨道 内阴影+圆角*/
    &::-webkit-scrollbar-track {
      background-color: #ccc;
    }

    /*定义滑块 内阴影+圆角*/
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: #ccc;
    }
    position relative
    padding-left: 10px
    font-size 14px
    .friend {
      width: 100%
      position relative
      .bannel {
        display flex
        width: 100%
        height: 50px
        line-height 40px
        padding 5px 2px
        cursor default
        .left {
          flex 0 0 20px
          width: 20px
          height: 50px
          .triangle {
            display inline-block
            width: 0
            height: 0
            margin-right: 12px;
            margin-top: 14px
            border-width 5px 0 5px 8px
            border-style solid
            border-color: #fff #fff #fff #b7b7b7;
          }
          .rotate {
            transform: rotate(90deg)
          }
        }
        div {
          flex 1
          height: 50px
          line-height 50px
          span {
            font-size 12px
            margin-left 5px
          }
        }
      }
      .removeblacklist{
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
        background-color #ccc
        cursor default
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

      .friends-content {
        display: flex;
        padding: 4px;
        position: relative;
        &:hover{
          background-color #f6f6f6
        }
        img {
          flex: 0 0 46px;
          border-radius 50%
          margin-right 15px
        }
        .placename {
          flex: 1;
          height 50px
          line-height 50px
          cursor default
        }
      }
    }
  }
</style>
