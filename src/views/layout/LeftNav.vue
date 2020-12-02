<style scoped>
	.logo {
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		height: 3.5rem;
		border-bottom: solid 0.01rem #48576a;
	}
	i {
		margin-right: 0.5rem;
	}
	.left-nav {
		padding-right: 0.3rem;
	}
	.header-aside {
		padding: 2rem;
		background-color: #233645;
		color: white;
	}
	a {
		cursor: pointer;
	}
	.a-control {
		font-size: 0.8rem;
	}
</style>


<template>
	<div class="left-nav">
		<div class="header-aside">
			<div>
				<img class="img-circle" src="/static/img/manager_head.png" />
			</div>
			<div class="text-white">
				<div>
					<span>{{ managerInfo.username }}</span>
					-
					<span>
						<template v-for="roleId in managerInfo.roleIds">
							{{ roleMap[roleId].name }} 
						</template>
					</span>
				</div>
				<div class="a-control">
					<a @click="open_updateManagerDialog">[修改资料]</a>
					<a @click="logout">[退出登录]</a>
				</div>
			</div>
		</div>
		<el-menu @select="addTab" default-active="User" background-color="#324157" text-color="#fff">
			<el-menu-item index="Manager">
				<i class="el-icon-s-custom"></i>
				<span slot="title">管理员管理</span>
			</el-menu-item>
			<el-menu-item index="Role">
				<i class="el-icon-s-custom"></i>
				<span slot="title">角色管理</span>
			</el-menu-item>
			<el-menu-item index="Permission">
				<i class="el-icon-s-custom"></i>
				<span slot="title">菜单与权限管理</span>
			</el-menu-item>
			<el-submenu index="nav1">
				<template slot="title">
					<i class="el-icon-edit"></i>
					<span slot="title">导航一</span>
				</template>
				<el-menu-item index="User">
					<i class="el-icon-view"></i>
					<span slot="title">用户管理</span>
				</el-menu-item>
			</el-submenu>
		</el-menu>
		
		<el-dialog title="修改用户信息" :visible.sync="updateManagerDialog" @close="close_updateManagerDialog" :close-on-click-modal="false" width="30%" :inline="true">
    		<el-form :model="managerDTO" :rules="managerUpdateRules" ref="updateManagerForm" label-width="auto">
    			<el-form-item label="密码" prop="password">
					<el-input type="password" v-model="managerDTO.password"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="confirmPassword">
					<el-input type="password" v-model="managerDTO.confirmPassword"></el-input>
				</el-form-item>
    		</el-form>
    		<span slot="footer">
    			<el-button type="success" @click="updateManager">保存</el-button>
    		</span>
		</el-dialog>
	</div>
</template>


<script>
import { mapMutations } from 'vuex'
import { Message } from "element-ui";
import http from '@/components/Http';

export default {
	name: 'LeftNav',
	data() {
    	return {
    		updateManagerDialog: false,
    		roleMap: {},
    		managerInfo: {},
    		managerDTO: {
    			password: '',
    			confirmPassword: '',
    		},
    		managerUpdateRules: {
    			password: [
    				{required: true, message: '请输入密码'},
    				{min: 8, max:20, message: '长度在8-20之间'},
    			],
    			confirmPassword: [
    				{required: true, message: '请确认密码'},
    				{min: 8, max:20, message: '长度在8-20之间'},
    				{
    					required: true,
    					validator: (rule, value, callback) => {
	    					if (value !== this.managerDTO.password) {
								callback(new Error('两次输入密码不一致!'))
							} else {
								callback();
							}
	    				},
	    			},
    			],
    		},
    	}
    },
    mounted() {
    	//初始化角色表
		http.ajax('/service-auth/role', {
			truefun: res => {
				res.forEach(role => {
					this.roleMap[role.roleId] = role;
				});
			},
		});
    	//加载用户信息
		http.ajax('/service-auth/manager/self', {
			truefun: (resData) => {
				this.managerInfo = resData;
			},
		});
	},
	methods: {
		//导入/store/navTabs.js中的addTab方法
		...mapMutations('navTabs', [
			'addTab',
		]),
		open_updateManagerDialog() {
			this.updateManagerDialog = true;
		},
		close_updateManagerDialog() {
			this.$refs['updateManagerForm'].resetFields();
		},
		updateManager() {
			this.$refs['updateManagerForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				http.ajax('/service-auth/manager/self', {
					method: 'put',
					data: this.managerDTO,
					truefun: (resData) => {
						this.updateManagerDialog = false;
					},
				});
			});
		},
		logout() {
			http.logout();
			this.$router.push('/login');
		},
	}
}
</script>
