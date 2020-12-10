<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 问卷结果'"></el-page-header>
		<hr class="hr" color="#F2F6FC">
		
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" class="search-form" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search()" icon="el-icon-search">刷新</el-button>
			</el-form-item>
		</el-form>
		
		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="questionResultId" label="questionResultId" align="center" width="200px"></el-table-column>
			<el-table-column prop="openId" label="openId" align="center" width="200px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="150px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column label="回答内容" align="center">
				<template slot-scope="scope" v-for="">
					
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="default" @click="openDialog(scope.row.questionResultId)" icon="el-icon-s-order">查看</el-button>
				</div>
			</el-table-column>
		</el-table>
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
				questionModuleId: 0,
				openId: '',
				phone: '',
				page: 1,
				limit: 10,
			},
			queryResult: {
				rows: [],
				total: 0,
			},
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityQuestionResult', [
			'questionModuleId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			this.queryParams.questionModuleId = this.questionModuleId;
			console.log(this.queryParams)
			http.ajax('/service-activity/questionResult', {
				data: this.queryParams,
				truefun: res => {
					this.queryResult = res;
				},
			});
		},
		goBack() {
			
		},
	},
}
</script>