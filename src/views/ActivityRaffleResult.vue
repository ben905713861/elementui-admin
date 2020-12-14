<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 抽奖结果'"></el-page-header>
		<hr class="hr" color="#F2F6FC">
		
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" class="search-form" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="openId">
				<el-input v-model="queryParams.openId" placeholder="openId"></el-input>
			</el-form-item>
			<el-form-item prop="phone">
				<el-input v-model="queryParams.phone" placeholder="手机"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search()" icon="el-icon-search">搜索/刷新</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
				<el-button type="primary" @click="exportExcel()" icon="el-icon-download">导出全部</el-button>
				<el-button type="danger" @click="removeAll()" icon="el-icon-delete">删除全部</el-button>
			</el-form-item>
		</el-form>
		
		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="raffleResultId" label="raffleResultId" align="center" width="200px"></el-table-column>
			<el-table-column prop="openId" label="openId" align="center" width="200px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="150px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column prop="result" label="中奖情况" align="center"></el-table-column>
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
		
	</div>
</template>

<script>
import { Message } from "element-ui";
import { mapMutations, mapState } from 'vuex';
import http from '@/components/Http';

export default {
	data() {
		return {
			queryParams: {
				raffleId: 0,
				openId: '',
				phone: '',
				page: 1,
				limit: 10,
			},
			queryResult: {
				rows: [],
				total: 0,
			},
			editDialog: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityRaffleResult', [
			'raffleId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			this.queryParams.raffleId = this.raffleId;
			http.ajax('/service-activity/raffleResult', {
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
		exportExcel() {
			http.download('/service-activity/raffleResult/exportExcel/' + this.raffleId);
		},
		removeAll() {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/raffleResult/all/' + this.raffleId, {
					method: 'delete',
					truefun: res => {
						this.search();
					},
				});
			})
			.catch(() => {});
		},
		...mapMutations('navTabs', [
			'closeTab',
		]),
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/ActivityRaffle'];
			let thisTabPermissionId = this.path2permissionId['/ActivityRaffleResult'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>