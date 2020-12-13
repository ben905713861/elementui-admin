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
			</el-form-item>
		</el-form>
		
		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="questionResultId" label="questionResultId" align="center" width="200px"></el-table-column>
			<el-table-column prop="openId" label="openId" align="center" width="200px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="150px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column label="回答内容">
				<template slot-scope="scope">
					<template v-for="(answer, questionId, index) in scope.row.result">
						{{ index+1 }}.{{ answer }} &nbsp;
					</template>
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="default" @click="openDialog(scope.row.result)" icon="el-icon-s-order">查看</el-button>
				</div>
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
		
		<el-dialog title="回答内容"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			width="40%">
			<el-table :data="answerList" stripe="" border="" header-cell-class-name="bg-gray">
				<el-table-column type="index" :index="1" align="center"></el-table-column>
				<el-table-column prop="question" label="题目"></el-table-column>
				<el-table-column label="回答">
					<template slot-scope="scope">
						<template v-for="(answer) in scope.row.answers">
							{{ answer }}<br>
						</template>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
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
			editDialog: false,
			questionId2questionDTO: {},
			answerList: [],
		}
	},
	mounted() {
		this.search();
		http.ajax('/service-activity/questionResult/init/' + this.questionModuleId, {
			truefun: res => {
				res.forEach(questionDTO => {
					this.questionId2questionDTO[questionDTO.questionId] = questionDTO;
					if(questionDTO.optionList != null) {
						let optionKey2option = {};
						questionDTO.optionList.forEach(optionDTO => {
							optionKey2option[optionDTO.key] = optionDTO;
						});
						questionDTO.optionKey2option = optionKey2option;
					}
				});
			},
		});
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
			http.ajax('/service-activity/questionResult', {
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
		openDialog(result) {
			let answerList = [];
			for(let questionId in result) {
				let questionDTO = this.questionId2questionDTO[questionId];
				if(questionDTO.type == '问答题') {
					console.log(result[questionId])
					answerList.push({
						question: questionDTO.question,
						answers: [result[questionId]],
					});
					continue;
				}
				let keys = result[questionId].split(',');
				let answers = [];
				keys.forEach(key => {
					let answer = key + '.' + questionDTO.optionKey2option[key].option;
					answers.push(answer);
				});
				answerList.push({
					question: questionDTO.question,
					answers: answers,
				});
			}
			this.answerList = answerList;
			this.editDialog = true;
		},
		exportExcel() {
			http.download('/service-activity/questionResult/exportExcel/' + this.questionModuleId);
		},
		...mapMutations('navTabs', [
			'closeTab',
		]),
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/ActivityQuestionModule'];
			let thisTabPermissionId = this.path2permissionId['/ActivityQuestionResult'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>