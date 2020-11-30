<style>
.bg-gray {
	background-color: #f5f5f5!important;
}
</style>


<template>
	<div>
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="username">
				<el-input type="text" v-model="queryParams.username" placeholder="用户名"></el-input>
			</el-form-item>
			<el-form-item prop="roleId">
				<el-select v-model="queryParams.roleId" clearable="" placeholder="等级">
					<el-option label="超级管理员" value="1"></el-option>
					<el-option label="普通管理员" value="2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="search(true)" icon="el-icon-search">搜索</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="managerId" label="managerId" align="center"></el-table-column>
			<el-table-column prop="username" label="管理员名" align="center"></el-table-column>
			<el-table-column prop="authorities[0].authname" label="等级" align="center"></el-table-column>
			<el-table-column prop="accountNonExpired" label="账户是否没有过期" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="accountNonLocked" label="账户是否没有被锁定" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="credentialsNonExpired" label="密码是否没有过期" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="enabled" label="账户是否可用" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<template slot-scope="scope" v-if="scope.row.roleId != 1">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.managerId)" icon="el-icon-edit-outline">编辑</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.managerId)" icon="el-icon-delete">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination style="margin: 8px 0; text-align: right"
			background=""
			layout="total,prev,pager,next,sizes"
			:total="queryResult.total"
			:current-page="queryParams.page"
			:page-size="queryParams.limit"
			@size-change="sizeChange"
			@current-change="currentChange">
		</el-pagination>

		<el-dialog title="编辑管理员信息"
			:visible.sync="updateManagerDialog"
			:close-on-click-modal="false"
			@close="resetForm('updateManagerForm')"
			width="30%">
			<el-form :model="managerDTO" :rules="managerUpdateRules" ref="updateManagerForm" label-width="auto">
				<el-form-item prop="managerId" v-show="false">
					<el-input type="number" v-model="managerDTO.managerId"></el-input>
				</el-form-item>
				<el-form-item label="用户名" prop="username">
					<el-input type="text" v-model="managerDTO.username"></el-input>
				</el-form-item>
				<el-form-item label="等级" prop="roleId">
					<el-select v-model="managerDTO.roleId">
						<el-option label="超级管理员" :value="1" disabled=""></el-option>
						<el-option label="普通管理员" :value="2"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input type="password" v-model="managerDTO.password"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="confirmPassword">
					<el-input type="password" v-model="managerDTO.confirmPassword"></el-input>
				</el-form-item>
				<el-form-item label="账户是否没有过期" prop="accountNonExpired">
					<el-switch v-model="managerDTO.accountNonExpired"></el-switch>
				</el-form-item>
				<el-form-item label="账户是否没有被锁定" prop="accountNonLocked">
					<el-switch v-model="managerDTO.accountNonLocked"></el-switch>
				</el-form-item>
				<el-form-item label="密码是否没有过期" prop="credentialsNonExpired">
					<el-switch v-model="managerDTO.credentialsNonExpired"></el-switch>
				</el-form-item>
				<el-form-item label="账户是否可用" prop="enabled">
					<el-switch v-model="managerDTO.enabled"></el-switch>
				</el-form-item>
			</el-form>
			<span slot="footer">
			<el-button type="success" @click="saveData()">保存</el-button>
		</span>
		</el-dialog>

	</div>
</template>


<script>
import http from '@/components/Http';
import { Message } from "element-ui";

export default {
	data() {
	  return {
		queryParams: {
			username: "",
			roleId: "",
			page: 1,
			limit: 10,
		},
		queryResult: {
			rows: [],
			total: 0,
		},
	  	managerDTO: {},
	  	managerUpdateRules: {
	  		username: [
				{required: true, message: "请输入账户名称"},
				{min: 2, max:20, message: "长度在2-20之间"},
			],
			roleId: [
				{required: true, message: "请选择管理员等级"},
			],
			password: [
				{required: false, message: "请输入密码"},
				{min: 8, max:20, message: "长度在8-20之间"},
			],
			confirmPassword: [
				{required: true, message: "请确认密码"},
				{min: 8, max:20, message: "长度在8-20之间"},
				{
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
	  	updateManagerDialog: false,
	  }
	},
	mounted() {
		this.search(true);
	},
	methods: {
		search(isPage1 = false) {
			if(isPage1) {
				this.queryParams.page = 1;
			}
			http.ajax('/service-auth/manager', {
				data: this.queryParams,
				truefun: res => {
					this.queryResult = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		sizeChange(limit) {
			this.queryParams.limit = limit;
			this.search();
		},
		currentChange(page) {
			this.queryParams.page = page;
			this.search();
		},
		openDialog(managerId) {
			if(managerId != undefined) {
				http.ajax('/service-auth/manager/' + managerId, {
					truefun: resData => {
						this.managerDTO = resData;
					},
				});
				//修改时候的规则
				this.managerUpdateRules.password[0].required = false;
				this.managerUpdateRules.confirmPassword[0].required = false;
			} else {
				//新增时候的规则
				this.managerUpdateRules.password[0].required = true;
				this.managerUpdateRules.confirmPassword[0].required = true;
			}
			this.updateManagerDialog = true;
		},
		saveData() {
			this.$refs['updateManagerForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				http.ajax('/service-auth/manager', {
					method: this.managerDTO.managerId ? 'put' : 'post',
					data: this.managerDTO,
					truefun: resData => {
						this.updateManagerDialog = false;
						this.search(true);
					},
				});
			});
		},
		deleteData(v1) {
			console.log(v1)
			this.search(true);
		},
		formatBoolean(row, column, value) {
			return value ? '是' : '否';
		},
	},
}
</script>
