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
		<el-menu @select="addTab" background-color="#324157" text-color="#fff">
			<template v-for="c1 in navTree">
				<template v-if="c1.children">
					<el-submenu v-if="isShowMenuByPermission(c1.permissionId)" :index="c1.permissionId.toString()">
						<template slot="title">
							<i v-if="c1.icon" :class="c1.icon"></i>
							<span slot="title">{{ c1.name }}</span>
						</template>
						<el-menu-item v-for="(c2,j) in c1.children" :key="j"
							v-if="isShowMenuByPermission(c2.permissionId)"
							:index="c2.permissionId.toString()">
							<i v-if="c2.icon" :class="c2.icon"></i>
							<span slot="title">{{ c2.name }}</span>
						</el-menu-item>
					</el-submenu>
				</template>
				<template v-else="">
					<el-menu-item v-if="isShowMenuByPermission(c1.permissionId)" :index="c1.permissionId.toString()">
						<i v-if="c1.icon" :class="c1.icon"></i>
						<span slot="title">{{ c1.name }}</span>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
		
		<el-dialog title="修改用户信息"
			:visible.sync="updateManagerDialog"
			@close="close_updateManagerDialog"
			:close-on-click-modal="false"
			width="30%"
			:inline="true">
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
import permisTree from '@/components/PermissionTree';

export default {
	name: 'LeftNav',
	data() {
    	return {
    		navTree: [],
    		updateManagerDialog: false,
    		roleMap: {},
    		managerInfo: {
    			permissionIds: new Set(),
    			roleIds: new Set(),
    		},
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
    	http.get('/service-auth/index/role')
	    	.then((res) => {
	    		if(res.status != 0) {
	    			throw res.msg;
	    		}
	    		//初始化角色表
	    		res.data.forEach(role => {
					this.roleMap[role.roleId] = role;
				});
				//获取菜单
				return http.get('/service-auth/index/menu');
	    	})
	    	.then((res) => {
	    		if(res.status != 0) {
	    			throw res.msg;
	    		}
	    		let permissionList = res.data;
	    		//将权限表缓存到store
	    		let permissionMap = {};
	    		permissionList.forEach(permission => {
	    			permissionMap[permission.permissionId] = permission;
	    		});
	    		this.initPermissionMap(permissionMap);
	    		//渲染左导航
	    		this.navTree = permisTree.arrange(permissionList, false);
	    		return http.get('/service-auth/index/manager');
	    	})
	    	.then((res) => {
	    		if(res.status != 0) {
	    			throw res.msg;
	    		}
	    		//加载用户信息
	    		res.data.permissionIds = new Set(res.data.permissionIds);
	    		res.data.roleIds = new Set(res.data.roleIds);
	    		this.managerInfo = res.data;
	    	})
	    	.catch(msg => {
	    		Message.error(msg);
	    	});
	},
	methods: {
		//导入/store/navTabs.js中的addTab方法
		...mapMutations('navTabs', [
			'initPermissionMap','addTab',
		]),
		// 根据权限id判断菜单是否显示
		isShowMenuByPermission(permissionId) {
			// 超级管理员角色直接显示
			if(this.managerInfo.roleIds.has(1)) {
				return true;
			}
			return this.managerInfo.permissionIds.has(permissionId);
		},
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
				http.ajax('/service-auth/index/manager', {
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
