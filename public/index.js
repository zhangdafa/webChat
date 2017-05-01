var socket = io();

Vue.component("new-message",{
	props:["content"],
	template:"<li :class='myMessage' v-if='showMessage'><b>{{content.name}}:</b><p>{{content.message}}</p></li>\
			  <li class='tip' v-else><b>{{content.name+content.message}}</b></li>\
	",
	computed:{
		myMessage:function(){
			return {"myMessage":this.content.name===app.name};
		},
		showMessage:function(){
			if(this.content.tip){
				return false;
			}else{
				return true;
			}
		}
	}
});

Vue.component("user",{
	props:["name"],
	template:"<li>{{name}}</li>"
});
var app=new Vue({
	el:"#chat",
	data:{
		message:null,				//聊天信息
		content:[],					//消息体（聊天信息与成员信息）
		defaultName:"greatFa",		//默认昵称
		name:null,					//当前客户端昵称
		nameList:[]					//成员列表
	},
	methods:{
		send:function(){
			var obj={name:this.name,message:this.message};
			socket.emit("send message",obj);
			this.message="";
		}
	},
	
});
//获取广播数据
socket.on("get message",function(msg){
	app.content.push(msg);
	
});
//获取成员列表的事件
socket.on("get nameList",function(msg){
	app.nameList=msg;
});
//首个昵称定义
var chatName=prompt("您的昵称：",app.defaultName)||app.defaultName;
app.name=chatName;
var userJoin={name:app.name,message:"加入了会话",tip:"这是一个提示消息"};
socket.emit("send tip",userJoin);