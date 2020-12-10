<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 问卷题目配置'"></el-page-header>
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
			<el-table-column type="index" :index="1" align="center"></el-table-column>
			<el-table-column prop="questionId" label="questionId" align="center" width="100px"></el-table-column>
			<el-table-column prop="question" label="题目"></el-table-column>
			<el-table-column prop="type" label="类型" align="center" width="200px"></el-table-column>
			<el-table-column prop="maxAnswer" label="多选限制" align="center" width="100px"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.questionId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.questionId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑题目"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="questionDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="questionId" v-show="false">
					<el-input v-model="questionDTO.questionId"></el-input>
				</el-form-item>
				<el-form-item label="题目" prop="question">
					<el-input v-model="questionDTO.question"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-select v-model="questionDTO.type" placeholder="题目类型">
						<el-option label="单选题" key="单选题" value="单选题"></el-option>
						<el-option label="多选题" key="多选题" value="多选题"></el-option>
						<el-option label="问答题" key="问答题" value="问答题"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="最大多选数" prop="maxAnswer">
					<el-input-number v-model="questionDTO.maxAnswer" :min="0" :max="10" placeholder="仅多选题有效,0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="参考答案" prop="referenceAnswer">
					<el-input v-model="questionDTO.referenceAnswer" placeholder="选填"></el-input>
				</el-form-item>
				<el-form-item label="选项配置">
					<el-button size="mini" type="success" @click="addOption()">添加选项</el-button>
				</el-form-item>
				<el-form-item v-for="(option, index) in questionDTO.optionList"
					:label="optionKeys[index]"
					:prop="'optionList.' + index + '.option'"
					:rules="editRules.optionList_option"
					:key="option.tempId">
					<el-col :span="18">
						<el-input v-model="option.option"></el-input>
					</el-col>
					<el-col :span="6">
						<el-button @click.prevent="removeOption(option)" icon="el-icon-delete"></el-button>
					</el-col>
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
			questionDTO: {
				questioId: null,
				questionModuleId: null,
				question: '',
				type: null,
				maxAnswer: 0,
				referenceAnswer: '',
				optionList: [{
					option: '',
					tempId: Math.random(),
				}, {
					option: '',
					tempId: Math.random(),
				}],
			},
			editRules: {
				question: [
					{required: true, message: '请输入题目'},
					{min: 2, max: 50, message: '长度在2-50之间'},
				],
				type: [
					{required: true, message: '请选择题目类型'},
				],
				maxAnswer: [
					{required: true, message: '请输入多选限制，为0=不限制'},
				],
				optionList_option: [
					{required: true, message: '请输入选项内容'},
				],
			},
			editDialog: false,
			optionKeys: ['A','B','C','D','E','F','G','H','I','J'],
			saveDisabled: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityQuestion', [
			'questionModuleId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/question/list/' + this.questionModuleId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(referenceAnswer) {
			if(referenceAnswer != undefined) {
				http.ajax('/service-activity/question/' + referenceAnswer, {
					truefun: resData => {
						this.questionDTO = resData;
					},
				});
			} else {
				this.questionDTO.optionList = [{
					option: '',
					tempId: Math.random(),
				}, {
					option: '',
					tempId: Math.random(),
				}];
			}
			this.editDialog = true;
		},
		addOption() {
			this.questionDTO.optionList.push({
				option: '',
				tempId: Math.random(),
			});
		},
		removeOption(option) {
			let index = this.questionDTO.optionList.indexOf(option);
			if(index !== -1) {
				this.questionDTO.optionList.splice(index, 1);
			}
		},
		saveData() {
			if(this.saveDisabled) {
				return;
			}
			//禁用按钮
			this.saveDisabled = true;
			this.$refs['editForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					this.saveDisabled = false;
					return;
				}
				//添加额外信息
				this.questionDTO.questionModuleId = this.questionModuleId;
				let optionList = this.questionDTO.optionList;
				if(optionList != null) {
					for(let i = 0; i < optionList.length; i++) {
						optionList[i].key = this.optionKeys[i];
					}
				}
				http.ajax('/service-activity/question', {
					method: this.questionDTO.questionId ? 'put' : 'post',
					data: this.questionDTO,
					truefun: resData => {
						this.editDialog = false;
						this.search(true);
					},
					endfun: () => {
						this.saveDisabled = false;
					}
				});
			});
		},
		deleteData(questionId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/question/' + questionId, {
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
//		...mapMutations('activityQuestion', [
//			'setQuestionModuleId','setActivityId','setHeaderTitle',
//		]),
//		openWindow(questionModuleId, type, title) {
//			this.setQuestionModuleId(questionModuleId);
//			this.setActivityId(this.activityId);
//			this.setHeaderTitle(title);
//			this.addTab(this.path2permissionId[type]);
//		},
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/ActivityQuestionModule'];
			let thisTabPermissionId = this.path2permissionId['/ActivityQuestion'];
			this.closeTab(thisTabPermissionId, lastTabPermissionId);
		},
	},
}
</script>