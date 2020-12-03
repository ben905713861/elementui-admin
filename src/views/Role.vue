<style>

</style>


<template>
	<div>
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="name">
				<el-input type="text" v-model="queryParams.name" placeholder="角色名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search()" icon="el-icon-search">搜索</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="roleId" label="roleId" align="center"></el-table-column>
			<el-table-column prop="name" label="角色名" align="center"></el-table-column>
			<el-table-column prop="authority" label="角色标识" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="300">
				<template slot-scope="scope" v-if="scope.row.roleId != 1">
					<el-button size="mini" type="default" @click="openRolePermissionDialog(scope.row.roleId)" icon="el-icon-edit-outline">分配权限</el-button>
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
			@close="resetRolePermissionTree()"
			width="30%">
			<el-tree :data="permissionList"
				show-checkbox=""
				default-expand-all=""
				check-on-click-node	=""
				:expand-on-click-node="false"
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
import { Message } from "element-ui";
import http from '@/components/Http';
import permisTree from '@/components/PermissionTree';

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
	  	rolePermissionDTO: {
	  		roleId: 0,
	  	},
	  	updateRolePermissionDialog: false,
	  }
	},
	mounted() {
		this.search();
		//加载权限树
		http.ajax('/service-auth/permission', {
			truefun: res => {
				this.permissionList = permisTree.arrange(res);
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
			console.log(formName)
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
			http.ajax('/service-auth/role/rolePermission/' + roleId, {
				truefun: resData => {
					resData.forEach(permissionId => {
						let node = this.$refs['permissionTree'].getNode(permissionId);
						if(node.isLeaf) {
							this.$refs['permissionTree'].setChecked(permissionId, true, true);
						}
					});
					this.rolePermissionDTO.roleId = roleId;
				},
			});
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
			let leafKeys = this.$refs['permissionTree'].getCheckedKeys();
			let halfKeys = this.$refs['permissionTree'].getHalfCheckedKeys();
			let keys = [...leafKeys, ...halfKeys];
			http.ajax('/service-auth/role/rolePermission/' + this.rolePermissionDTO.roleId, {
				method: 'post',
				data: keys,
				truefun: resData => {
					this.updateRolePermissionDialog = false;
				},
			});
		},
		resetRolePermissionTree() {
			this.$refs['permissionTree'].setCheckedKeys([]);
		},
		deleteData(roleId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-auth/role/' + roleId, {
					method: 'delete',
					truefun: resData => {
						this.search();
					},
				});
			})
			.catch(() => {});
		},
		formatBoolean(row, column, value) {
			return value ? '是' : '否';
		},
	},
}
</script>
