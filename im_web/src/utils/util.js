// import {aes} from 'crypto-js/aes';
// import {base64} from 'crypto-js/enc-base64'
import config from './config.js';
import axios  from 'axios'
let CryptoJS = require("crypto-js");
// import {md5} from 'crypto-js/md5';
//生成指定长度的随即字符串
export function randomString(len) {
  len = len || 32;
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
//生成当前时间戳,格式:2017-08-03 15:24:31
export function getNowFormatDate(cuo) {
  let date;
  if(cuo!=null){
    date = new Date(cuo)
  }else{
    date =new Date();
  }
  let seperator1 = "-";
  let seperator2 = ":";
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  let strHour=date.getHours();
  let strMin=date.getMinutes();
  let strSec=date.getSeconds();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (strHour >= 0 && strHour <= 9) {
    strHour = "0" + strHour;
  }
  if (strMin >= 0 && strMin <= 9) {
    strMin = "0" + strMin;
  }
  if (strSec >= 0 && strSec <= 9) {
    strSec = "0" + strSec;
  }
  let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + strHour + seperator2 + strMin
    + seperator2 + strSec;
  return currentdate;
}

let appid=config.appid;
let strkey=config.strKey;
let strvi=config.strVi;
let isen=config.isencrypt;
let MD5Key = CryptoJS.MD5(strkey).toString();
let MD5vi = CryptoJS.MD5(strvi).toString().substring(0,16);
let key = CryptoJS.enc.Utf8.parse(MD5Key);
let iv = CryptoJS.enc.Utf8.parse(MD5vi);
let opinion = {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding};
//加密模块
export function encrypt(app_id,word) {
  let srcs = word;
  let RandomStr  = randomString(16);
  let appid = CryptoJS.MD5(app_id).toString();
  let str2 = RandomStr+srcs+appid;
  let encrypted =CryptoJS.AES.encrypt(str2, key, opinion);
  return encrypted.toString();
}
//解密模块
export function decrypt(word) {
  let decrypt = CryptoJS.AES.decrypt(word, key, opinion);
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);

  return decryptedStr;
}
//发送数据模块
function Send_Data(app_id, method, data)
{
  let en_data = data;
  if (isen)
  {
    let strdata = JSON.stringify(data);
    en_data = encrypt(app_id,strdata);
  }
  let timestamp = getNowFormatDate();
  let jsonstrObj = {
    "app_id": app_id,
    "method": method,
    "version": "1.0",
    "timestamp": timestamp,
    "data": en_data
  };
  let jsonstr = JSON.stringify(jsonstrObj);
  let wordArray = CryptoJS.enc.Utf8.parse(jsonstr);//不一定需要这一段
  let base64str =  CryptoJS.enc.Base64.stringify(wordArray);
  this.$store.state.connection.send(base64str);
}
//用户登录
export function clientlogin(acc,pwd){
  let md5password = CryptoJS.MD5(pwd).toString();
  let data = {
    "uaccount": acc,
    "upassword": md5password
  };
  Send_Data(appid, "clientlogin", data);
}
export function checkaccount(input){
  if(!(/^1(3|4|5|7|8)\d{9}$/.test(input))){
    alert("手机号码有误，请重填");
    return false;
  }
}
export function formaturl(url) {
  return url.slice(0,4)==='http'?url:'http://'+url
}
export function readFile(f){//type 是通过File.getType(file)获得的对象
  let reader = new FileReader();//用来把文件读入内存
      reader.readAsBinaryString(f);
      // reader.readAsDataURL(f);
        reader.onload = function(){
          uploadFile(f);
        }
}
function uploadFile(f){
  if(window.FormData){
    let formdata = new FormData();
    let cfg={'headers':{'Content-Type':'application/x-www-form-urlencoded'}}
    formdata.append("file",f,encodeURIComponent(f.name))
    formdata.append("appid",config.appid)
    let url=config.httpServer+'dialog/encryptionFile'
    axios.post(url,formdata,cfg).then((response)=>{
      response = response.data
    })
  }
}
