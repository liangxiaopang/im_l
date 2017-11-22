import Vue from 'vue';
import Router from 'vue-router';
import Recentchat from '../components/recentchat.vue';
import Personal from '../components/personal.vue';
import Friends from '../components/friends.vue';
import Group from '../components/group.vue';
import Strange from '../components/strange.vue';
import '../assets/css/icon.less'
import '../assets/stylus/index.styl'
import '../font-icon/iconfont.css'
Vue.use(Router);
export default new Router({
   // mode:'history',
  routes:[
    {path:'/',component:Recentchat},
    {path:"/recentchat", component:Recentchat},
    {path:"/personal", component:Personal},
    {path:"/friends", component:Friends},
    {path:"/group", component:Group},
    {path:"/strange", component:Strange}
  ]
});
