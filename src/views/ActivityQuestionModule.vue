<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 问卷列表'"></el-page-header>
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
			<el-table-column prop="questionModuleId" label="questionModuleId" align="center"></el-table-column>
			<el-table-column prop="title" label="问卷名" align="center"></el-table-column>
			<el-table-column label="每人每日限答次数" align="center">
				<template slot-scope="scope">
					{{ scope.row.dayLimit == 0 ? '不限' : scope.row.dayLimit }}
				</template>
			</el-table-column>
			<el-table-column label="每人限答总次数" align="center">
				<template slot-scope="scope">
					{{ scope.row.totalLimit == 0 ? '不限' : scope.row.totalLimit }}
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作" width="500">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.questionModuleId, '/ActivityQuestion', scope.row.title)"
						icon="el-icon-edit-outline">题目配置</el-button>
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.questionModuleId, '/ActivityQuestionResult', scope.row.title)"
						icon="el-icon-s-unfold">查看问卷结果</el-button>
					<el-button size="mini" type="warning" @click="openDialog(scope.row.questionModuleId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.questionModuleId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑问卷信息"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="questionModuleDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="questionModuleId" v-show="false">
					<el-input v-model="questionModuleDTO.questionModuleId"></el-input>
				</el-form-item>
				<el-form-item label="问卷名" prop="title">
					<el-input v-model="questionModuleDTO.title"></el-input>
				</el-form-item>
				<el-form-item label="每人每天限答次数" prop="dayLimit">
					<el-input-number v-model="questionModuleDTO.dayLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="每人限答总次数" prop="totalLimit">
					<el-input-number v-model="questionModuleDTO.totalLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
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
import { mapMutations, mapState } from 'vuex';
import http from '@/components/Http';
	
export default {
	data() {
		return {
			queryParams: {},
			queryResult: {
				rows: [],
			},
			questionModuleDTO: {
				questionModuleId: null,
				activityId: null,
				title: '',
				dayLimit: null,
				totalLimit: null,
			},
			editRules: {
				title: [
					{required: true, message: '请输入问卷名'},
					{min: 2, max: 50, message: '长度在2-50之间'},
				],
				dayLimit: [
					{required: true, message: '请输入每人每日限答次数'},
				],
				totalLimit: [
					{required: true, message: '每人限答总次数'},
				],
			},
			editDialog: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityQuestionModule', [
			'activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/questionModule/list/' + this.activityId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(questionModuleId) {
			if(questionModuleId != undefined) {
				http.ajax('/service-activity/questionModule/' + questionModuleId, {
					truefun: resData => {
						this.questionModuleDTO = resData;
					},
				});
			}
			this.editDialog = true;
		},
		saveData() {
			this.$refs['editForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				this.questionModuleDTO.activityId = this.activityId;
				http.ajax('/service-activity/questionModule', {
					method: this.questionModuleDTO.questionModuleId ? 'put' : 'post',
					data: this.questionModuleDTO,
					truefun: resData => {
						this.editDialog = false;
						this.search(true);
					},
				});
			});
		},
		deleteData(questionModuleId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/questionModule/' + questionModuleId, {
					method: 'delete',
					truefun: resData => {
						this.search();
					},
				});
			})
			.catch(() => {});
		},
		...mapMutations('navTabs', [
			'addTab','closeTab',
		]),
		...mapMutations('activityQuestion', {
			activityQuestion_setQuestionModuleId: 'setQuestionModuleId',
			activityQuestion_setActivityId: 'setActivityId',
			activityQuestion_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityQuestionResult', {
			activityQuestionResult_setQuestionModuleId: 'setQuestionModuleId',
			activityQuestionResult_setActivityId: 'setActivityId',
			activityQuestionResult_setHeaderTitle: 'setHeaderTitle',
		}),
		openWindow(questionModuleId, type, title) {
			if(type == '/ActivityQuestion') {
				this.activityQuestion_setQuestionModuleId(questionModuleId);
				this.activityQuestion_setActivityId(this.activityId);
				this.activityQuestion_setHeaderTitle(title);
			} else if(type == '/ActivityQuestionResult') {
				this.activityQuestionResult_setQuestionModuleId(questionModuleId);
				this.activityQuestionResult_setActivityId(this.activityId);
				this.activityQuestionResult_setHeaderTitle(title);
			}
			this.addTab(this.path2permissionId[type]);
		},
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/Activity'];
			let thisTabPermissionId = this.path2permissionId['/ActivityQuestionModule'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>