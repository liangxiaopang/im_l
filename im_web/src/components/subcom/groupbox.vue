<template>
  <transition name="slide-left">
    <div class="newsMessage">
      <div class="background" v-show="showraw" @click.stop="closerawimg">
        <span class="icon-close" @click="closerawimg"></span>
        <img class="img" :src="this.rawimg" width="80%" height="80%">
      </div>
      <transition name="memberboxtoggle">
        <div class="memberbox" v-show="!updown">
          <div class="add" v-show="isrow"  @click="addmembers"><div class="plus"></div></div>
          <div class="add" v-show="isrow"  @click="deletemember"><div class="minus"></div></div>
          <div class="member" v-show="isrow">
            <img :src="currentuser.u_h_img" :alt="currentuser.nickname" width="55" height="55">
            <div class="nickname">{{currentuser.nickname}}</div>
          </div>
          <div class="member" v-for="(member,index) in judgemember" v-show="isrow">
            <img :src="member.u_h_img" :alt="member.nickname" width="55" height="55">
            <div class="nickname">{{member.nickname}}</div>
            <div class="delete" v-show="candel" @click="deleteone(index)"><div class="de"></div></div>
          </div>
          <div class="member" v-for="(member,index) in members" v-show="!isrow">
            <img :src="member.u_h_img" :alt="member.nickname" width="55" height="55">
            <div class="nickname">{{member.nickname}}</div>
            <div class="delete" v-show="candel"><div class="de"></div></div>
          </div>
        </div>
      </transition>
      <transition name="creat">
        <div class="groupmemberbox" v-if="addmember" :style="{paddingTop:(windowinnerheight-600)/2+'px'}">
          <div class="addgroupmember" ref="setgroupmembertop">
            <div class="title">添加会话成员<span class="addonenotice">&nbsp;(选择一位好友)</span><span class="icon-close" @click="closeaddgroupmember"></span></div>
            <ul class="friendbody">
              <li v-for="(friend,index) in friends" class="friends-content">
                <img :src="friend.u_h_img" alt="" width="46" height="46">
                <div class="placename" @click="chosenonefriend(index)">{{friend.nickname}}</div>
                <div class="checkbox" @click="chosenonefriend(index)" :class="{chose:friend.chone}"><div class="right" v-show="friend.chone"></div></div>
              </li>
            </ul>
            <div class="addmemberbtn" :class="{addmemberchone:selectonearr.length}" @click="submittoaddone">确定<span v-show="selectonearr.length">({{selectonearr.length}})</span></div>
          </div>
        </div>
      </transition>
      <div class="head">
        <div class="back-box" @click="controlgroupbox">
          <span class="iconfont icon-zuobian"></span>
        </div>
        <div class="title"><div class="se" @click="change">{{currentsession.rooms_name}}({{members.length}})<div class="icon-down" v-show="updown"></div><div v-show="!updown" class="icon-up"></div></div></div>
        <alerts :str="alerttext" v-if="alertshow"></alerts>
      </div>
      <div class="message"  ref="groupmessagelist" @click.stop.prevent="clickbody">
        <ul>
          <li v-for="(msg,index) in groups[groupindex].group_hismsg">
            <p>{{ msg.time}}</p>
            <div class="msg" v-bind:class="msg.user.uid === currentuser.uid ? 'self' : ''">
              <img :src="msg.user.u_h_img" :alt="msg.user.nickname" :title="msg.user.nickname">
              <div class="text" v-show="msg.msgtype==='text'" v-html="replaceemoji(msg.msg)"></div>
              <div class="voice" v-show="msg.msgtype==='voice'"  @click="toggle(msg.msgid)">
                <voice :isanimate=msg.isanimate ></voice><span class="time">{{msg.timelen}}''</span>
              </div>
              <img @click="showrawimg(msg.msg)" :src="msg.msg" class="canvas" ref="canva" width="120" height="160" v-show="msg.msgtype==='img'"></img>
              <div class="video" v-show="msg.msgtype==='video'" @click="playvideo(msg.msg)">
                <video><source :src="msg.msg" type="video/mp4" /></video>
                <div class="circle"></div>
                <div class="triangle"></div>
              </div>

            </div>
          </li>
        </ul>
        <audio ref="audi"><source type="audio/mpeg"></audio>
      </div>
      <div class="user-text">
        <transition name="slide-bottom">
          <div v-show="isShowEmoji" class="emoji-display" ref="emojilist">
            <div class="qq_face" @click.stop="insertText($event)">
              <a title="微笑" type="qq" class="qq qq-smile">smile</a>
              <a title="焦虑" type="qq" class="qq qq-worried">worried</a>
              <a title="眨眼" type="qq" class="qq qq-wink">wink</a>
              <a title="无话可说" type="qq" class="qq qq-neutral">neutral</a>
              <a title="哭泣" type="qq" class="qq qq-sob">sob</a>
              <a title="太棒了" type="qq" class="qq qq-yum">yum</a>
              <a title="咧嘴笑" type="qq" class="qq qq-grin">grin</a>
              <a title="大怒" type="qq" class="qq qq-rage">rage</a>
              <a title="哈欠" type="qq" class="qq qq-weary">weary</a>
              <a title="墨镜" type="qq" class="qq qq-sung">sung</a>
              <a title="滴汗" type="qq" class="qq qq-sweat">sweat</a>
              <a title="严肃" type="qq" class="qq qq-unamused">unamused</a>
              <a title="口罩" type="qq" class="qq qq-mask">mask</a>
              <a title="轻松" type="qq" class="qq qq-relieved">relieved</a>
              <a title="开心" type="qq" class="qq qq-relaxed">relaxed</a>
              <a title="累" type="qq" class="qq qq-pensive">pensive</a>
              <a title="憨厚" type="qq" class="qq qq-blush">blush</a>
              <a title="惊讶" type="qq" class="qq qq-open">open</a>
              <a title="生气" type="qq" class="qq qq-angry">angry</a>
              <a title="吃惊" type="qq" class="qq qq-anguished">anguished</a>
              <a title="尴尬" type="qq" class="qq qq-persevere">persevere</a>
              <a title="大笑" type="qq" class="qq qq-grinning">grinning</a>
              <a title="绅士" type="qq" class="qq qq-bowtie">bowtie</a>
              <a title="卖萌" type="qq" class="qq qq-dizzy">dizzy</a>
              <a title="震惊" type="qq" class="qq qq-fearful">fearful</a>
              <a title="色" type="qq" class="qq qq-heart">heart</a>
              <a title="流鼻涕" type="qq" class="qq qq-cry">cry</a>
              <a title="长者的关注" type="qq" class="qq qq-flushed">flushed</a>
              <a title="胆小" type="qq" class="qq qq-frowning">frowning</a>
              <a title="天使" type="qq" class="qq qq-innocent">innocent</a>
              <a title="笑着哭" type="qq" class="qq qq-joy">joy</a>
              <a title="嘟嘴" type="qq" class="qq qq-hushed">hushed</a>
              <a title="亲" type="qq" class="qq qq-kissing">kissing</a>
              <a title="亲亲" type="qq" class="qq qq-kissing_closed_eyes">kissing_closed_eyes</a>
              <a title="亲不到" type="qq" class="qq qq-kissingface">kissingface</a>
              <a title="飞吻" type="qq" class="qq qq-kissingheart">kissingheart</a>
              <a title="满意" type="qq" class="qq qq-satisfied">satisfied</a>
              <a title="睡觉" type="qq" class="qq qq-sleeping">sleeping</a>
              <a title="夸张的笑" type="qq" class="qq qq-smiley">smiley</a>
              <a title="不屑" type="qq" class="qq qq-smirk">smirk</a>
              <a title="特开心" type="qq" class="qq qq-smile">smile</a>
              <a title="尴尬的笑" type="qq" class="qq qq-laughing">laughing</a>
              <a title="吐舌" type="qq" class="qq qq-stuck">stuck</a>
              <a title="生无可恋" type="qq" class="qq qq-tired">tired</a>
              <a title="祈祷" type="qq" class="qq qq-pray">pray</a>
              <a title="强" type="qq" class="qq qq-plus">plus</a>
              <a title="差劲" type="qq" class="qq qq-refuse">refuse</a>
              <a title="耶" type="qq" class="qq qq-v">v</a>
              <a title="鄙视" type="qq" class="qq qq-metal">metal</a>
              <a title="拳头" type="qq" class="qq qq-facepun">facepun</a>
              <a title="打巴掌" type="qq" class="qq qq-wave">wave</a>
              <a title="ok" type="qq" class="qq qq-ok">ok</a>
              <a title="队的" type="qq" class="qq qq-white">white</a>
              <a title="错的" type="qq" class="qq qq-x">x</a>
              <a title="红酒" type="qq" class="qq qq-wine">wine</a>
              <a title="咖啡" type="qq" class="qq qq-coffee">coffee</a>
              <a title="果汁" type="qq" class="qq qq-trop">trop</a>
              <a title="西瓜" type="qq" class="qq qq-water">water</a>
              <a title="香蕉" type="qq" class="qq qq-banana">banana</a>
              <a title="柿子" type="qq" class="qq qq-tanger">tanger</a>
              <a title="樱桃" type="qq" class="qq qq-cherr">cherr</a>
              <a title="柠檬" type="qq" class="qq qq-lemon">lemon</a>
              <a title="葡萄" type="qq" class="qq qq-grapes">grapes</a>
              <a title="草莓" type="qq" class="qq qq-straw">straw</a>
              <a title="桃子" type="qq" class="qq qq-peach">peach</a>
              <a title="青梨" type="qq" class="qq qq-green">green</a>
              <a title="苹果" type="qq" class="qq qq-apple">apple</a>
              <a title="兔子" type="qq" class="qq qq-rabbit2">rabbit2</a>
              <a title="乌龟" type="qq" class="qq qq-turtle">turtle</a>
              <a title="狼" type="qq" class="qq qq-wolf">wolf</a>
              <a title="老虎" type="qq" class="qq qq-tiger">tiger</a>
              <a title="鲸鱼" type="qq" class="qq qq-whale">whale</a>
              <a title="狮子" type="qq" class="qq qq-tiger2">tiger2</a>
              <a title="公鸡" type="qq" class="qq qq-rooster">rooster</a>
              <a title="骑车" type="qq" class="qq qq-bicy">bicy</a>
              <a title="划船" type="qq" class="qq qq-rowboat">rowboat</a>
              <a title="自行车" type="qq" class="qq qq-bike">bike</a>
              <a title="书" type="qq" class="qq qq-book">book</a>
              <a title="鞠躬" type="qq" class="qq qq-bow">bow</a>
              <a title="警察" type="qq" class="qq qq-cop">cop</a>
              <a title="一箭穿心" type="qq" class="qq qq-cupid">cupid</a>
              <a title="火" type="qq" class="qq qq-fire">fire</a>
              <a title="玩游戏" type="qq" class="qq qq-game">game</a>
              <a title="雨伞" type="qq" class="qq qq-closed">closed</a>
              <a title="手枪" type="qq" class="qq qq-gun">gun</a>
              <a title="锤子" type="qq" class="qq qq-hammer">hammer</a>
              <a title="帽子" type="qq" class="qq qq-hat">hat</a>
              <a title="匕首" type="qq" class="qq qq-hocho">hocho</a>
              <a title="加热" type="qq" class="qq qq-hots">hots</a>
              <a title="爱心" type="qq" class="qq qq-yellow">yellow</a>
              <a title="爱" type="qq" class="qq qq-love">love</a>
              <a title="太阳" type="qq" class="qq qq-sunny">sunny</a>
              <a title="月亮" type="qq" class="qq qq-moon">moon</a>
              <a title="圆圈" type="qq" class="qq qq-o">o</a>
              <a title="药丸" type="qq" class="qq qq-pill">pill</a>
              <a title="戒指" type="qq" class="qq qq-ring">ring</a>
              <a title="尺子" type="qq" class="qq qq-ruler">ruler</a>
              <a title="闪闪的爱" type="qq" class="qq qq-spark">spark</a>
              <a title="星星" type="qq" class="qq qq-star">star</a>
              <a title="闪亮的星星" type="qq" class="qq qq-star2">star2</a>
              <a title="向日葵" type="qq" class="qq qq-sun">sun</a>
              <a title="游泳" type="qq" class="qq qq-swim">swim</a>
              <a title="打针" type="qq" class="qq qq-syringe">syringe</a>
              <a title="圣诞节" type="qq" class="qq qq-tada">tada</a>
              <a title="屋子" type="qq" class="qq qq-tent">tent</a>
              <a title="树" type="qq" class="qq qq-tree">tree</a>
              <a title="闪电" type="qq" class="qq qq-zap">zap</a>
              <a title="篮球" type="qq" class="qq qq-basket">basket</a>
              <a title="跑步" type="qq" class="qq qq-runner">runner</a>
              <a title="圣诞老人" type="qq" class="qq qq-santa">santa</a>
              <a title="好基友" type="qq" class="qq qq-twomen">twomen</a>
              <a title="散步" type="qq" class="qq qq-walking">walking</a>
              <a title="好闺密" type="qq" class="qq qq-twowo">twowo</a>
              <a title="下雨" type="qq" class="qq qq-umbre">umbre</a>
              <a title="红绿灯" type="qq" class="qq qq-vertical">vertical</a>
              <a title="手表" type="qq" class="qq qq-watch">watch</a>
              <a title="wc" type="qq" class="qq qq-wc">wc</a>
              <a title="婚礼" type="qq" class="qq qq-wedd">wedd</a>
              <a title="裙子" type="qq" class="qq qq-woman">woman</a>
              <a title="裤子" type="qq" class="qq qq-jeans">jeans</a>
            </div>
          </div>
        </transition>
        <div class="banner">
          <div class="emoji" @click="showEmoji(isShowEmoji=!isShowEmoji)"></div>
          <div class="addimg" title="发送图片">+
            <input type="file" accept="image/png,image/jpg,image/jpeg,image/gif" @change="sendimg($event)" multiple>
          </div>
        </div>
        <pre contenteditable="true" class="inp" @keyup.enter="send" @input="newLine" ref="textarea"></pre>
        <div @click="send" class="btn">发送</div>
      </div>
      <div class="playvideo" v-show="showvideo">
        <div class="lay" @click="test"></div>
        <video class="rawvideo" width="560" style="margin-top:15px;" ref="videoplay" @ended="playagain">
          <source ref='videocontrol' type="video/mp4" />
        </video>
        <div class="circle" v-show="playagains" @click="playvideo(videosrc)"></div>
        <div class="triangle" v-show="playagains" @click="playvideo(videosrc)"></div>
      </div>
    </div>
  </transition >
</template>
<script>
  import vue from 'vue'
  import voice from './voice.vue'
  import axios from 'axios'
  import qs from 'querystring'
  import alerts from './alert.vue'
  import {getNowFormatDate,randomString} from '../../utils/util.js'
  import config from '../../utils/config.js'
  const CryptoJS = require("crypto-js")
  import {mapState} from 'vuex'
  import '../../assets/emoji/28px/qq.css'
  import '../../assets/emoji/19px/faces.css'
	export default {
    data() {
      return {
        windowinnerheight:document.body.clientHeight,
        msg:'',
        content:'',
        index:0,
        count:0,
        candel:false,
        addmember:false,
        roleindex:0,
        oTextarea: {},
        isShowEmoji: false,
        alerttext:'',
        alertshow:false,
        uploadimgarr:[],
        rawimg:'',
        videosrc:'',
        showraw:false,
        showvideo:false,
        playagains:false,
        updown:true,
        lasteditrange:{}
      }
    },
    props:{
      groupname:{
        type:Array
      }
    },
    computed:{
      ...mapState(['groups','currentsession', 'currentuser', 'connection','dialogboxshow','voice','friends','selectonearr','groupindex']),
      key(){
        return this.$store.getters.getkey
      },
      group(){
        for(let i=0,len=this.groups.length;i<len;i++){
          if(this.groups[i].rooms_id===this.currentsession.rooms_id){
            return this.groups[i]
          }
        }
      },
      members(){
        return this.currentsession.userinfolist
      },
      judgemember(){
        return this.members.filter(member=>member.role==0&&member.uid!=this.currentuser.uid)
      },
      isrow(){
        for(let i=0,len=this.members.length;i<len;i++){
          if(this.members[i].role==2&&this.members[i].uid==this.currentuser.uid){
            return true
          }
        }
      },
      opinion(){
        return this.$store.getters.getopinion
      },
      groupcounts(){
        return this.$store.getters.groupcounts
      }
    },
    mounted(){
      let _this=this
      window.onresize=()=>{
        return _this.windowinnerheight = document.body.clientHeight
      }
      _this.$nextTick(()=>{
        _this.$refs.groupmessagelist.scrollTop=_this.$refs.groupmessagelist.scrollHeight
        _this.$refs.textarea.focus()
        _this.getCurrentRange()
        _this.$refs.groupmessagelist.addEventListener('scroll',function(){
          if(_this.$refs.groupmessagelist.scrollTop==0){
              _this.getmorechathistory()
          }
        })
        _this.$refs.textarea.addEventListener('click',function(){
          _this.count+=1
          _this.getCurrentRange()
          _this.isShowEmoji=false
        })
        _this.$refs.textarea.addEventListener('keyup',_this.debounce(_this.getCurrentRange,500))
      })
    },
    watch:{
      count(){
        let _this =this
        _this.$nextTick(()=>{
          _this.$refs.groupmessagelist.scrollTop=_this.$refs.groupmessagelist.scrollHeight
        })
      },
      groupcounts(){
        let _this =this
        _this.$nextTick(()=>{
          _this.$refs.groupmessagelist.scrollTop=_this.$refs.groupmessagelist.scrollHeight
        })
      },
      windowinnerheight(val){
        this.windowinnerheight=val
      }
    },
    methods: {
      test(){
        this.showvideo=false
        let els = this.$refs.videoplay
        els.pause()
      },
      controlgroupbox(){
        this.$store.dispatch('controlgroupbox', false)
      },
      change(){
        this.updown=!this.updown
      },
      clickbody(){
        this.isShowEmoji=false
      },
      showalert(str){
        let _this = this;
        _this.alerttext=str;
        _this.alertshow=true;
        setTimeout(function(){
          _this.alertshow=false;
          _this.alerttext=''
        },4000)
      },
      readFile(f){//type 是通过File.getType(file)获得的对象
        let _this=this
        let reader = new FileReader();//用来把文件读入内存
        reader.readAsBinaryString(f);
        reader.onload = function(){
          _this.uploadFile(f);
        }
      },
      uploadFile(f){
        let _this=this
        if(window.FormData){
        let formdata = new FormData();
        let cfg={'headers':{'Content-Type':'application/x-www-form-urlencoded'}}
        formdata.append("file",f,encodeURIComponent(f.name))
        formdata.append("appid",config.appid)
        let url=config.httpServer+'dialog/encryptionFile'
        axios.post(url,formdata,cfg).then((response)=>{
          response = response.data
          if(response.error_code===0){
            let imgurl=response.data.resource_path
            _this.uploadimgarr.push(imgurl)
            _this.send(imgurl,'img')
          }
          })
        }
      },
      toggle(msgids){
        let msgarr = this.group.group_hismsg
        let len = msgarr.length;
        for(let i=0;i<len;i++){
          if(msgarr[i].msgtype =='voice'){
            if(parseInt(msgarr[i].msgid)!==parseInt(msgids)){
              msgarr[i].isanimate=true;
            }
            else{
              let timelen=msgarr[i].timelen
              let el=this.$refs.audi
              if(!msgarr[i].isanimate){
                el.src=msgarr[i].msg
                msgarr[i].isanimate=true
                return
              }
              msgarr[i].isanimate=!msgarr[i].isanimate;
              el.src=msgarr[i].msg
              el.play()
              let timer=setTimeout(function(){
                msgarr[i].isanimate=true;
              },timelen*1000)
            }
          }
        }
      },
      sendimg(event){
        let _this=this
        let files=event.target.files
        let fd = new window.FormData();
        this.uploadimgarr=[]
        for(let i=0,len=files.length;i<len;i++){
         let f=files[i]
          if(!f){
           let str ='未选中任何文件'
            this.showalert(str)
            return
          }
          if(!(f.type.indexOf('image')==0 && f.type && /\.(?:jpg|png|gif|jpeg)$/.test(f.name))){
            let str="接受jpg,gif,png图片"
            _this.showalert(str)
            return
          }
          this.readFile(f)
        }
      },
      showrawimg(src){
        this.showraw=true
        this.rawimg=''
        this.rawimg=src
      },
      closerawimg(){
        this.showraw=false
      },
      playvideo(src) {
        this.videosrc=src
        this.showvideo = true
        this.playagains=false
        let el=this.$refs.audi
            el.pause()
        let els = this.$refs.videoplay
        els.src = src
        els.play()
      },
      playagain(){
        this.playagains=true
      },
      encrypt(app_id,word) {
        let RandomStr  = randomString(16);
        let appid = CryptoJS.MD5(app_id).toString();
        let str2 = RandomStr+word+appid;
        let encrypted =CryptoJS.AES.encrypt(str2, this.key, this.opinion);
        return encrypted.toString();
      },
      send(cont,type) {
        let _this = this;
        this.updown=true
        this.isShowEmoji=false
        let el=_this.$refs.textarea;
        let newstr=_this.replaceimg(el.innerHTML)
        let message;
        if(Object.prototype.toString.call(cont).slice(8,-1)!=='String'){
          message=newstr.replace(/<div><br><\/div>/g,'')
        } else{
          message=cont
        }
        type=type||'text'
        if (message !== '' ) {
          let appid = this.currentuser.app_sid;
          let timestamp = getNowFormatDate();
          let msg = {
            rooms_id:_this.currentsession.rooms_id,
            auth_token:_this.currentuser.auth_token,
            message_type:type,
            message_data:{
              atlist:[],
              data:message
            }
          };
          let isen=config.isencrypt;
          let en_data;
          if (isen) {
            let strdata = JSON.stringify(msg);
            en_data = _this.encrypt(appid,strdata);
          }
          let roomssendmessage = {
            app_id:appid,
            method: "rooms_send_message",
            version: "1.0",
            timestamp:timestamp,
            data:en_data
          };
          let jsonstr = JSON.stringify(roomssendmessage);
          let wordArray = CryptoJS.enc.Utf8.parse(jsonstr);
          let base64str =  CryptoJS.enc.Base64.stringify(wordArray);
          _this.connection.send(base64str);
          el.innerHTML = '';
          el.focus();
          msg.is_self = 1;
          msg.from=_this.currentuser.uid;
          msg.timestamp=timestamp;
          msg.to=0;
          msg.message_type=type
          msg.sessiontype='group'
          _this.$store.commit('addcurrentmessage',msg)
          _this.count+=1
        }else{
          let str = '没有消息需要发送';
          this.showalert(str)
        }
      },
      insertText(e) {
        let _this=this;
        let str =e.target.innerText ;
        let seccla='faces-'+str
        let trstr='['+str+']'
        let oTextarea = this.$refs.textarea;
        let selection , range;

        let img=document.createElement("img");
        img.setAttribute('src','https://wx.qq.com/zh_CN/htmledition/v2/images/spacer.gif')
        img.className='faces '
        img.className+=seccla
        let strimg='<img src="https://wx.qq.com/zh_CN/htmledition/v2/images/spacer.gif" class="faces '+seccla+'"'+' text="'+trstr+'">'
        if(!_this.lasteditrange){
          return
        }
        oTextarea.focus()
        if(window.getSelection){
          selection=window.getSelection()
          selection.removeAllRanges()
          selection.addRange(_this.lasteditrange)
          if(document.selection)
            _this.lasteditrange.pasteHTML(strimg);
          else
            document.execCommand("insertHTML", false,strimg);
          selection = window.getSelection();
          if (selection.getRangeAt && selection.rangeCount) {
            _this.lasteditrange = document.getSelection().getRangeAt(0);
          }
          _this.lasteditrange = selection.getRangeAt(0)
        }
        else{
          range = document.selection.createRange();
          range.setEndPoint('EndToEnd', _this.lasteditrange);
          if(currentRange.text.length === 0){
            range.collapse(false);
          }else{
            range.setEndPoint('StartToStart', _this.lasteditrange);
          }
          range.select();
        }
        this.newLine();
      },
      newLine(){
        setTimeout(() => this.oTextarea.scrollTop = this.oTextarea.scrollHeight, 0);
      },
      showEmoji(flag) {
        this.isShowEmoji = flag;
        this.updown=true
      },
      deletemember(){
        this.candel=!this.candel
      },
      deleteone(index){
        this.candel=false
        let _this=this
        let data={
          'appid':config.appid,
          'rooms_id': this.currentsession.rooms_id,
          'uid1': this.currentuser.uid,
          'uid2': this.judgemember[index].uid
        }
        let url=config.httpServer+'dialog/userMemberDel'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data
          if(response.error_code===0){
            _this.$store.dispatch('updategroup',_this.judgemember[index].uid)
          }
        })
      },
      addmembers(){
        this.updown=true
        this.addmember=true
      },
      closeaddgroupmember(){
        this.addmember=false
      },
      chosenonefriend(index){
        this.$store.commit('chosenonefriend',index)
      },
      submittoaddone(){
        let _this=this
        if(this.selectonearr.length!==1){
          let str='很抱歉,目前一次只支持添加一位好友'
          this.showalert(str)
          return
        }
        let member=this.currentsession.userinfolist
        let uid=this.selectonearr[0].uid
        for(let i=0,len=member.length;i<len;i++){
          if(member[i].uid==uid){
            let str =this.selectonearr[0].nickname+'已经是群'+'['+this.currentsession.rooms_name+']成员'
            this.showalert(str)
            return
          }
        }
        let data= {
          'appid': config.appid,
          'rooms_id': this.currentsession.rooms_id,
          'uid1': this.currentuser.uid,
          'uid2':uid
        }
        let url=config.httpServer+'dialog/groupMemberAdd'
        axios.post(url,qs.stringify(data)).then((response)=>{
          response=response.data
          if(response.error_code===0){
            _this.addmember=false
            _this.selectonearr[0].role=0
            _this.$store.dispatch('addonetogroup',_this.selectonearr[0])
          }
        })      },
      getmorechathistory(){
        let roomid=this.currentsession.rooms_id
        let appid = this.currentuser.app_sid;
        let timestamp = getNowFormatDate();
        let lastmsgid=this.groups[this.groupindex].group_hismsg[0].msgid
        let historymsg = {
          "auth_token": this.currentuser.auth_token,
          "rooms_id": roomid,
          //这里碰到个数据自动转换的坑,变成了字符串拼接了
//              1+parseInt(lastmsgid)
          "msgid": parseInt(lastmsgid)-1,
          "limit": 50
        }
        let hismsg = JSON.stringify(historymsg);
        let en_hismsg = this.encrypt(appid, hismsg);
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
        this.connection.send(base64s);
      },
      getCurrentRange(){
        let selection , range;
        if(window.getSelection){
          selection = window.getSelection();
          range=selection.getRangeAt(0)
        }
        else{
          range = document.selection.createRange();

        }
        this.lasteditrange=range
      },
      debounce(func,delay){
        let timer=null;
        return function(){
          let context= this,args=arguments;
          clearTimeout(timer)
          timer=setTimeout(function () {
            func.apply(context,args)
          },delay)
        }
      },
      replaceimg(str){
        let newstr=str.replace(/<img.*?(?:>|\/>)/g,function(match){
          let arr=match.match(/\[\w+.*\]/g)
          return arr[0]
        })
        return newstr
      },
      replaceemoji(str){
        let el=this.$refs.textmsg
        let laststr=str.replace(/\[\w+.*?\]/g,function(match){
          let qqface=match.slice(1,-1)
          let seccla='faces-'+qqface
          let qqimg='<img src="https://wx.qq.com/zh_CN/htmledition/v2/images/spacer.gif" class="faces '+seccla+'"'+' text="'+match+'">'
          return qqimg
        })
        return laststr
      }

    },
    components:{
      voice,
      alerts
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../../assets/stylus/mixin.styl"
	.newsMessage{
    z-index: 10;
    display: flex;
    flex-direction: column;
    width: 800px;
    height: 100%;
    background:#eee;
    position:fixed;
    margin-left -400px
    top:0;
    left:50%;
    @media screen and (max-width:700px){
      width 100%;
      font-size:14px;
      margin 0
      left 0
    }
    &.slide-left-enter-active,&.slide-left-leave-active{
      transition:all .3s linear;
    }
    &.slide-left-enter,&.slide-left-leave-active{
      transform:translate3d(-100%,0,0);
      /*opacity:0;*/
    }
    .background{
      position:absolute;
      top: 0;
      left:0;
      width:100%;
      height:100%;
      fliter:blur(70px);
      background-color rgba(0,0,0,.9)
      z-index:10;
      .img{
        position:absolute;
        top:10%;
        left:10%;
        display block
        z-index:12;
        @media screen and (max-width:700px){
          top:0;
          left:0;
          width: 100%;
          height:100%;
        }
      }
      .icon-close{
        position:absolute;
        top:35px;
        right:40px;
        color:white
        cursor :pointer;
        font-size:24px;
        @media screen and (max-width:700px){
          position:absolute;
          top: 12px;
          right:12px;
          font-size:30px;
          color:red;
          z-index:30;
        }
      }
    }
    .head{
      box-sizing:border-box;
      position: relative;
      font-size: 0;
      line-height: 40px;
      color:#000;
      width: 100%;
      height: 40px;
      background-color:#ccc;
      .back-box{
        position:absolute
        top 0
        left 0
        width:40px
        height: 40px;
        line-height:40px;
        text-align:center;
        &:hover{
          color: red;
        }
        .iconfont{
          display block
          margin-top 10px
          font-size: 20px;
          font-weight:bold;
        }
      }
      .title{
        width:100%
        font-size: 20px;
        text-align: center;
        /*color:white;*/
        /*letter-spacing: 2px;*/
        font-weight:700;
        .se{
          display:inline-block;
          height:40px;
          cursor:pointer
          .icon-down {
            /*cursor:pointer*/
            margin-left 15px
            display: inline-block;
            width: 7px;
            height: 1px;
            background: blue;
            line-height: 0;
            font-size: 0;
            vertical-align: middle;
            transform: rotate(-45deg);
          }
          .icon-down::after {
            content: '';
            cursor:pointer
            display: block;
            width: 7px;
            height: 1px;
            background: blue;
            transform: rotate(-90deg) translateY(-360%) translateX(45%);
          }
          .icon-up {
            /*cursor:pointer*/
            margin-left 15px
            display: inline-block;
            width: 7px;
            height: 1px;
            background: blue;
            line-height: 0;
            font-size: 0;
            vertical-align: middle;
            transform: rotate(45deg);
          }
          .icon-up::after {
            content: '';
            cursor:pointer
            display: block;
            width: 7px;
            height: 1px;
            background: blue;
            transform: rotate(-90deg) translateY(-360%) translateX(-45%);
          }
        }
      }
    }
    .memberbox{
      width:800px;
      min-height:100px;
      position:fixed
      z-index 200
      top: 40px
      left:50%;
      margin-left -400px;
      padding:10px 4px 8px 17px;
      background-color #fff
      display flex
      flex-wrap:wrap
      box-shadow 0 0 8px #333
      @media screen and (max-width:700px){
        display none
        width:100%;
        left 0
      }
      &.memberboxtoggle-enter-active,&.memberboxtoggle-leave-active{
        transition:all .6s ease-in;
      }
      &.memberboxtoggle-enter,&.memberboxtoggle-leave-active{
        transform:translate3d(0,-200%,0);
        opacity 0
        /*opacity:0;*/
      }
      .add{
        width: 55px
        height: 55px
        line-height 55px
        font-size 60px
        border 1px dotted grey
        text-align center
        cursor pointer
        color: #ccc
        margin-top:10px
        margin-right 4px
        margin-left 12px
        position relative
        .plus{
          display: inline-block;
          position absolute
          top: 27px
          left 12px
          width: 30px;
          height: 1px;
          background: grey;
          line-height: 0;
          font-size: 0;
        }
        .minus{
          display: inline-block;
          position absolute
          top: 27px
          left 12px
          width: 30px;
          height: 1px;
          background: grey;
          line-height: 0;
          font-size: 0;
        }
        .plus::after {
          content: '';
          cursor:pointer
          display: block;
          width: 30px;
          height: 1px;
          background: grey;
          transform: rotate(90deg) translateY(50%);
        }
      }
      .member{
        display inline-block
        position: relative;
        height: 95px;
        width:72px
        text-align center
        margin-right: 7px;
        margin-left: 7px;
        padding-top: 10px;
        &:hover{
          box-shadow  0 0 3px red
        }
        img{
          display inline-block
          width:55px;
          height:55px;
          cursor:pointer;
        }
        .nickname{
          height:30px;
          width:72px;
          line-height 30px;
          font-size  13px
          color grey
          text-align center;
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
          cursor:default
        }
        .delete{
          width 19px
          height 19px
          border-radius 50%
          background-color red
          position absolute
          top: 6px
          right 0px
          .de{
            width: 12px
            height 1px
            margin 9px auto
            background-color white
          }
        }
      }
    }

    .groupmemberbox{
      position fixed
      top 0
      left 0
      bottom  0
      right 0
      z-index 500
      background-color rgba(0,0,0,.4)
      .addgroupmember{
        position:relative;
        width:480px;
        height 600px;
        border-radius 4px
        font-size:16px;
        max-width 100%
        text-align center
        background-color :#fff;
        margin:0 auto
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
          position relative
          width 100%
          height 30px
          line-height: 30px;
          text-align center
          cursor: pointer;
          color: green;
          background-color: #f9f9f9;
          .addonenotice{
            font-size 10px
            color:#c9c9c9
          }
          .icon-close{
            position:absolute
            top 6px
            right: 6px
            font-size 18px
            color black
          }
        }
        .friendbody{
          width 100%
          height:450px
          overflow auto
          .friends-content {
              display: flex;
              padding: 4px;
              background-color: #fff;
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
                text-align left
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
        .addmemberbtn{
          display: inline-block;
          border: 1px solid #c1c1c1;
          background-color: #c9c9c9;
          font-size: 14px;
          width: 190px;
          text-align: center;
          line-height: 40px;
          color: #fff;
          cursor:pointer;
          text-decoration: none;
          border-radius: 4px;
          -moz-border-radius: 4px;
          -webkit-border-radius: 4px;
        }
        .addmemberchone{
          background-color green
        }
      }

    }
    .message{
      box-sizing:border-box;
      flex:1;
      width:100%;
      overflow-y: auto;
      background-color: rgba(0, 0, 0, .1);
      position relative
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
      li{
        display: flex;
        flex-direction: column;
        padding: 10px;
        p{
          align-self: center;
          padding: 0 18px;
          font-size: 12px;
          color: #888;
          border-radius: 2px;
          background-color: #eee;
          margin: 5px 0;
        }
        .msg{
          display: flex;
          flex-direction: row;
          img{
            width: 30px;
            height: 30px;
            margin-right: 10px;
            flex-shrink: 0;
            border-radius:20px;
          }
          .text{
            padding: 10px;
            min-height: 30px;
            font-size: 16px;
            text-align: left;
            word-break: break-all;
            background: #fafafa;
            border-radius: 4px;
            line-height: 1.4;
          }
          .voice{
            min-height: 30px;
            padding:6px 10px;
            background: #fafafa;
            border-radius: 4px;
          }
          .canvas{
            border-radius:10px;
            width:120px;
            height:160px;
            cursor:pointer;
          }
          .video{
            padding:0;
            position:relative;
            cursor:pointer;
            video{
              width:200px;
              @media screen and (max-width:700px){
                width:120px;
              }
            }
            .circle{
              position:absolute;
              top:45px;
              left:50%;
              margin-left:-30px;
              width:60px;
              height:60px;
              border:2px solid white;
              /*z-index:30;*/
              border-radius 50%
              @media screen and (max-width:700px){
                width:40px;
                height:40px;
                top:25px;
                left:50%;
                margin-left:-20px;
              }
              &:hover{
                border:2px solid #333;
              }
            }
            .triangle{
              position:absolute;
              left:50%;
              margin-left:-6px;
              top:60px;
              border-width 15px 0px 15px 20px
              border-color transparent transparent transparent #fff;
              border-style solid
              @media screen and (max-width:700px){
                border-width 10px 0px 10px 15px
                left:50%;
                margin-left:-4px;
                top:35px;
              }
            }

          }
        }
        .self{
          flex-direction: row-reverse;
          .text{
            background: #b2e281;
          }
          img{
            margin-right: 0;
            margin-left: 10px;
            border-radius:20px;
          }
        }
      }
    }
    .playvideo{
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height: 100%;
      background-color :rgba(0,0,0,.7)
      .circle{
        position:absolute;
        top:265px;
        left:50%;
        margin-left:-30px;
        width:60px;
        height:60px;
        border:2px solid white;
        /*z-index:30;*/
        border-radius 50%
        z-index 100
        @media screen and (max-width:700px){
          width:40px;
          height:40px;
          top:300px;
          left:50%;
          margin-left:-20px;
        }
        &:hover{
          border:2px solid #333;
        }
      }
      .triangle{
        position:absolute;
        left:50%;
        margin-left:-6px;
        top:280px;
        border-width 15px 0px 15px 20px
        border-color transparent transparent transparent #fff;
        border-style solid
        z-index 100
        @media screen and (max-width:700px){
          border-width 10px 0px 10px 15px
          left:50%;
          margin-left:-4px;
          top:310px;
        }
      }

      .lay{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height: 100%;
        background-color :rgba(0,0,0,.7)
      }
      .rawvideo{
        width:600px;
        /*height:400px;*/
        position absolute
        top: 40px
        left 50%
        margin-left -300px

        @media screen and (max-width:700px){
          position absolute
          height 100%
          border 1px solid red
          top 0
          right 0
        }
      }
    }
    .user-text{
      position:relative;
      display:flex;
      flex-direction :column;
      height: 120px;
      width:100%;
      background-color #fff
      .emoji-display {
        position: absolute;
        background-color: white;
        top: -272px;
        left: 0;
      }
      .banner{
        flex:0 0 26px;
        width:100%;
        .emoji {
          display: inline-block;
          height: 26px;
          width:26px;
          vertical-align top
          margin-left 10px
          background-color: #fff;
          background: url('../../assets/fonts/icon-emoji.svg') no-repeat;
          background-size: contain;
        }
        .addimg{
          position relative
          display inline-block
          height 26px
          vertical-align top
          line-height 26px
          width 26px
          margin-left 4px
          padding-top:3px
          font-size 30px
          font-weight:700
          text-align center
          cursor pointer
          color #444
          input {
            position absolute
            width 26px
            height 26px
            cursor pointer
            top 0
            left 0
            opacity 0
            font-size 0
            overflow hidden
          }
        }
      }
      .inp {
        flex: 1;
        width 100%
        white-space: pre-wrap;
        -webkit-user-modify: read-write;
        -webkit-line-break: after-white-space;
        margin:10px 0 0 0;
        font-size: 14px;
        background: #fff;
        word-break: normal;
        word-wrap: break-word;
        overflow-y: auto;
        overflow-x: hidden;
        padding-left: 20px;
        outline: none;
        border: 0;
        box-sizing: border-box;
        border none
        &:hover{
          outline none
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
      }
      .btn {
        position absolute
        right: 10px
        bottom 10px
        width: 50px;
        height: 25px;
        background-color: #fff;
        text-align: center;
        box-shadow 0 0 3px blue;
        border-radius 6px;
        line-height:25px;
        color: #454545;
        font-size: 16px;
        cursor:pointer;
        &:hover{
          color:green;
        }
      }
    }
	}
</style>
