<style scoped>
	@import '/static/plugins/verifyImage/verifyImage.css';
	#login-form {
		background-color: aliceblue;
		z-index: 1;
	}
	.full-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	#login-form h1 {
		margin-bottom: 5rem;
		text-align: center;
	}
	#login-form form {
		width: 20rem;
		margin: 0 auto;
	}
	#login-form button {
		width: 100%;
	}
	#verify-modal {
		background-color: rgba(0,0,0,0.5);
		user-select: none;
		z-index: 2;
	}
</style>


<template>
<div>
	<div id="login-form" class="full-screen">
		<div>
			<h1>系统登录</h1>
			<el-form :model="loginDTO" :rules="loginRules" ref="loginForm" @submit.native.prevent="">
				<el-form-item prop="username">
					<el-input type="text" v-model="loginDTO.username" autofocus="">
						<template slot="prepend">账户：</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input type="password" v-model="loginDTO.password">
						<template slot="prepend">密码：</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" native-type="submit" @click="login(0)">登录</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
	<!-- 滑块验证码模态框 -->
	<div id="verify-modal" class="full-screen" v-show="openVerifyModal">
		<div id="verifyImg-box">
			<h3 class="title">拖动图片完成验证</h3>
			<div class="img-box">
				<img class="bg-img">
				<div class="defectImage">
					<img src="" />
				</div>
			</div>
			<div class="slider-bar">
				<div class="bar-light"></div>
				<button type="button" class="slider-btn"></button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
	import { Message } from "element-ui";
	import http from '@/components/Http';

	export default {
		mounted() {
			const script = document.createElement('script');
			script.src = '/static/plugins/verifyImage/verifyImage.js';
			script.onload = () => {
				verify('#verifyImg-box', this.login);
			}
			document.body.appendChild(script);
		},
		data() {
			return {
				openVerifyModal: false,
				loginDTO: {
					username: 'admin',
					password: 'q12345678',
					verifyXValue: 0,
				},
				loginRules: {
					username: [
						{required: true, message: "请输入账户名称"},
						{min: 2, max:20, message: "长度在2-20之间"},
					],
					password: [
						{required: true, message: "请输入密码"},
						{min: 8, max:20, message: "长度在8-20之间"},
					],
				}
			};
		},
		methods: {
			login(verifyXValue) {
				this.$refs['loginForm'].validate(valid => {
					if(!valid) {
						Message.error('登录信息不完整');
						return;
					}
					this.loginDTO.verifyXValue = verifyXValue;
					http.ajax('/service-auth/login/manager', {
						method: 'post',
						data: this.loginDTO,
						truefun: (resData) => {
							//登录成功，存储token
							http.loginSuccess(resData.accessToken);
							//跳转到首页
							this.$router.push('/');
						},
						falsefun: (res) => {
							if(res.status == -2) {
								this.loadVerifyImg(this.loginDTO.username);
							} else {
								this.openVerifyModal = false;
							}
						},
					});
				});
			},
			loadVerifyImg(username) {
				this.openVerifyModal = true;
				http.ajax('/service-auth/login/manager/verifyImg', {
					data: {
						username: username,
					},
					truefun: res => {
						var box = document.getElementById('verifyImg-box');
						box.querySelector('.bg-img').src = res.backgroundImage;
						box.querySelector('.defectImage img').src = res.defectImage;
						box.querySelector('.defectImage').style.top = res.offsetHeight + 'px';
					},
				});
			},
		}
	};
</script>