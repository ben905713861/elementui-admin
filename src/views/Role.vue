<style>

</style>


<template>
	<div>
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="username">
				<el-input type="text" v-model="queryParams.name" placeholder="角色名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="search(true)" icon="el-icon-search">搜索</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="roleId" label="roleId" align="center"></el-table-column>
			<el-table-column prop="name" label="角色名" align="center"></el-table-column>
			<el-table-column prop="authority" label="角色标识" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="300">
				<template slot-scope="scope" v-if="scope.row.roleId != 1">
					<el-button size="mini" type="default" @click="openRolePermissionDialog(scope.row.managerId)" icon="el-icon-edit-outline">分配权限</el-button>
					<el-button size="mini" type="warning" @click="openDialog(scope.row.roleId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.roleId)" icon="el-icon-delete">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog title="编辑管理员信息"
			:visible.sync="updateRoleDialog"
			:close-on-click-modal="false"
			@close="resetForm('updateRoleForm')"
			width="30%">
			<el-form :model="roleDTO" :rules="roleUpdateRules" ref="updateRoleForm" label-width="auto">
				<el-form-item prop="roleId" v-show="false">
					<el-input type="number" v-model="roleDTO.roleId"></el-input>
				</el-form-item>
				<el-form-item label="角色名" prop="name">
					<el-input type="text" v-model="roleDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="角色标识" prop="authority">
					<el-input type="text" v-model="roleDTO.authority"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="success" @click="saveData()">保存</el-button>
			</span>
		</el-dialog>
		
		<el-dialog title="分配权限"
			:visible.sync="updateRolePermissionDialog"
			:close-on-click-modal="false"
			@close="resetForm('updateRolePermissionForm')"
			width="30%">
			<el-tree :data="permissionList"
				show-checkbox=""
				default-expand-all=""
				node-key="permissionId"
				ref="permissionTree"
				:props="{children: 'children', label: 'name'}">
			</el-tree>
			<span slot="footer">
				<el-button type="success" @click="saveRolePermission()">保存</el-button>
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
			name: '',
		},
		queryResult: {
			rows: [],
		},
	  	roleDTO: {},
	  	roleUpdateRules: {
	  		name: [
				{required: true, message: "请输入角色名称"},
				{min: 2, max:20, message: "长度在2-20之间"},
			],
			authority: [
				{required: true, message: "请输入角色标识"},
				{min: 6, max:20, message: "长度在5-20之间"},
				{
					validator(rule, value, callback) {
						if (value.substr(0,5) != 'ROLE_') {
							callback(new Error('角色标识须是"ROLE_"开头'))
						} else {
							callback();
						}
					},
				},
			],
	  	},
	  	updateRoleDialog: false,
	  	permissionList: [],
	  	rolePermissionDTO: {},
	  	updateRolePermissionDialog: false,
	  }
	},
	mounted() {
		this.search();
		//加载权限树
		http.ajax('/service-auth/permission', {
			truefun: res => {
				let permissionId2entity = {};
				res.forEach((row) => {
					permissionId2entity[row.permissionId] = row;
					if(row.parentId != 0) {
						if(permissionId2entity[row.parentId].children == undefined) {
							permissionId2entity[row.parentId].children = [];
						}
						permissionId2entity[row.parentId].children.push(row);
					}
				});
				let newList = [];
				for(let permissionId in permissionId2entity) {
					if(permissionId2entity[permissionId].parentId == 0) {
						newList.push(permissionId2entity[permissionId]);
					}
				}
				this.permissionList = newList;
			},
		});
	},
	methods: {
		search() {
			http.ajax('/service-auth/role', {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(roleId) {
			if(roleId != undefined) {
				http.ajax('/service-auth/role/' + roleId, {
					truefun: resData => {
						this.roleDTO = resData;
					},
				});
			}
			this.updateRoleDialog = true;
		},
		openRolePermissionDialog(roleId) {
			if(roleId != undefined) {
				http.ajax('/service-auth/role/' + roleId, {
					truefun: resData => {
						this.roleDTO = resData;
					},
				});
			}
			this.updateRolePermissionDialog = true;
		},
		saveData() {
			this.$refs['updateRoleForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				http.ajax('/service-auth/role', {
					method: this.roleDTO.roleId ? 'put' : 'post',
					data: this.roleDTO,
					truefun: resData => {
						this.updateRoleDialog = false;
						this.search();
					},
				});
			});
		},
		saveRolePermission() {
			console.log(this.$refs['permissionTree'].getCheckedKeys());
		},
		deleteData(v1) {
			console.log(v1)
			this.search();
		},
		formatBoolean(row, column, value) {
			return value ? '是' : '否';
		},
	},
}
</script>
