<template>
<div class="dropdown" v-bind:style="{ top: mousepos.top + 'px', left: mousepos.left + 'px' }">
  <alerts :str="alerttext" v-if="alertshow"></alerts>
  <ul class="list">

    <li @click="optdelete">{{option[0]}}</li>
    <li @click="optblacklist">{{option[1]}}</li>
  </ul>

</div>
</template>

<script>
  import {mapState} from 'vuex'
  import alerts from './alert.vue'
  import config from '../../utils/config.js'
  import qs from 'querystring'
  import axios from 'axios'
  export default {
    data() {
      return {
        alerttext:'',
        alertshow:false
      }
    },
    props:{
      option:{
        type:Array
      }
    },
    computed:{
      ...mapState(['mousepos','currentuser','friends'])
    },
    methods:{
      optdelete(){
        this.$store.commit('dropdownhide')
        this.$store.commit('confirmdelfriend',true)
      },
      optblacklist(){
        this.$store.commit('dropdownhide')
        this.$store.commit('confirmaddblacklist',true)
      }
    },
    components: {alerts}
  }
</script>

<style lang='stylus' scoped>
.dropdown{
  background-color: white;
  width:70px;
  border:1px solid #ccc;
  padding:3px 6px 3px 6px;
  border-radius:4px;
  font-size:10px;
  text-align: left;
  li{
    margin-bottom:3px;
    width:66px;
    cursor:pointer;
    &:last-child{
      padding-bottom:0;
    }
    &:hover{
      color:red;
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

}
</style>
