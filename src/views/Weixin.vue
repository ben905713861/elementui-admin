<style>

</style>


<template>
	<div>
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="name">
				<el-input type="text" v-model="queryParams.name" placeholder="公众号名"></el-input>
			</el-form-item>
			<el-form-item prop="appId">
				<el-input type="text" v-model="queryParams.appId" placeholder="appId"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search(true)" icon="el-icon-search">搜索</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="wxId" label="wxId" align="center" width="80"></el-table-column>
			<el-table-column prop="name" label="公众号名" align="center"></el-table-column>
			<el-table-column prop="appId" label="appId" align="center"></el-table-column>
			<el-table-column prop="appSecret" label="appSecret" align="center"></el-table-column>
			<el-table-column prop="getTokenUrl" label="第三方获取accessToken接口" align="center"></el-table-column>
			<el-table-column prop="getTokenParam" label="第三方获取accessToken字段名" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<template slot-scope="scope">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.wxId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.wxId)" icon="el-icon-delete">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination class="pagination"
			background=""
			layout="total,prev,pager,next,sizes"
			:total="queryResult.total"
			:current-page="queryParams.page"
			:page-size="queryParams.limit"
			@size-change="sizeChange"
			@current-change="currentChange">
		</el-pagination>

		<el-dialog title="编辑管理员信息"
			:visible.sync="updateDialog"
			:close-on-click-modal="false"
			@close="resetForm('updateForm')"
			width="30%">
			<el-form :model="wxDTO" :rules="updateRules" ref="updateForm" label-width="auto">
				<el-form-item prop="wxId" v-show="false">
					<el-input v-model="wxDTO.wxId"></el-input>
				</el-form-item>
				<el-form-item label="公众号名" prop="name">
					<el-input v-model="wxDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="appId" prop="appId">
					<el-input v-model="wxDTO.appId"></el-input>
				</el-form-item>
				<el-form-item label="appSecret" prop="appSecret">
					<el-input v-model="wxDTO.appSecret"></el-input>
				</el-form-item>
				<el-form-item label="第三方获取accessToken接口" prop="getTokenUrl">
					<el-input v-model="wxDTO.getTokenUrl"></el-input>
				</el-form-item>
				<el-form-item label="第三方获取accessToken字段名" prop="getTokenParam">
					<el-input v-model="wxDTO.getTokenParam"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="success" @click="saveData()">保存</el-button>
			</span>
		</el-dialog>

	</div>
</template>


<script>
import { Message } from "element-ui";
import http from '@/components/Http';

export default {
	data() {
	  return {
		queryParams: {
			name: '',
			appId: '',
			page: 1,
			limit: 10,
		},
		queryResult: {
			rows: [],
			total: 0,
		},
	  	wxDTO: {
	  		wxId: null,
	  		name: '',
	  		appId: '',
	  		appSecret: '',
	  		getTokenUrl: '',
	  		getTokenParam: '',
	  	},
	  	updateRules: {
	  		name: [
				{required: true, message: "请输入公众号名"},
				{min: 2, max: 20, message: "长度在2-20之间"},
			],
			appId: [
				{required: true, message: "请输入appId"},
				{min: 18, max: 18, message: "长度必须是18位"},
			],
			appSecret: [
				{required: true, message: "请输入appSecret"},
				{min: 32, max: 32, message: "长度必须是32位"},
			],
			getTokenUrl: [
				{min: 0, max: 200, message: "第三方获取accessToken接口必须是200位以内"},
			],
			getTokenParam: [
				{min: 0, max: 20, message: "第三方获取accessToken字段名必须是20位以内"},
			],
	  	},
	  	updateDialog: false,
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
			http.ajax('/activity-admin-service/wx', {
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
		openDialog(wxId) {
			if(wxId != undefined) {
				http.ajax('/activity-admin-service/wx/' + wxId, {
					truefun: resData => {
						this.wxDTO = resData;
					},
				});
			}
			this.updateDialog = true;
		},
		saveData() {
			this.$refs['updateForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				http.ajax('/activity-admin-service/wx', {
					method: this.wxDTO.wxId ? 'put' : 'post',
					data: this.wxDTO,
					truefun: resData => {
						this.updateDialog = false;
						this.search(true);
					},
				});
			});
		},
		deleteData(wxId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/activity-admin-service/wx/' + wxId, {
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
		formatRole(row, column, value) {
			var roleNames = [];
			value.forEach(roleId => {
				roleNames.push(this.roleMap[roleId].name);
			});
			return roleNames.join(',');
		},
	},
}
</script>
