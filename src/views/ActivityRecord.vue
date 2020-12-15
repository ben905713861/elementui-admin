<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 登记项配置'"></el-page-header>
		<hr class="hr" color="#F2F6FC">
		
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" class="search-form" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search()" icon="el-icon-search">刷新</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="default" @click="openWindow()" icon="el-icon-s-unfold">查看登记结果</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column type="index" :index="1" align="center"></el-table-column>
			<el-table-column prop="recordId" label="recordId" align="center"></el-table-column>
			<el-table-column prop="name" label="登记项名" align="center"></el-table-column>
			<el-table-column prop="type" label="类型" align="center"></el-table-column>
			<el-table-column prop="required" label="是否必填" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.recordId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.recordId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑登记项"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="recordDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="recordId" v-show="false">
					<el-input v-model="recordDTO.recordId"></el-input>
				</el-form-item>
				<el-form-item label="登记项名" prop="name">
					<el-input v-model="recordDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-select v-model="recordDTO.type" placeholder="类型" @change="typeChange">
						<el-option label="单行文本" key="单行文本" value="单行文本"></el-option>
						<el-option label="数字" key="数字" value="数字"></el-option>
						<el-option label="多行文本" key="多行文本" value="多行文本"></el-option>
						<el-option label="单选" key="单选" value="单选"></el-option>
						<el-option label="多选" key="多选" value="多选"></el-option>
						<el-option label="单图上传" key="单图上传" value="单图上传"></el-option>
						<el-option label="多图上传" key="多图上传" value="多图上传"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否必填" prop="required">
					<el-select v-model="recordDTO.required" placeholder="是否必填">
						<el-option label="是" :key="true" :value="true"></el-option>
						<el-option label="否" :key="false" :value="false"></el-option>
					</el-select>
				</el-form-item>
				
				<el-form-item v-if="recordDTO.type == '单行文本' || recordDTO.type == '多行文本'" label="最短长度" prop="min">
					<el-input-number v-model="recordDTO.min" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '单行文本' || recordDTO.type == '多行文本'" label="最大长度" prop="max">
					<el-input-number v-model="recordDTO.max" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '数字'" label="最小值" prop="min">
					<el-input-number v-model="recordDTO.min" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '数字'" label="最大值" prop="max">
					<el-input-number v-model="recordDTO.max" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '多选'" label="最少选择数" prop="min">
					<el-input-number v-model="recordDTO.min" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '多选'" label="最多选择数" prop="max">
					<el-input-number v-model="recordDTO.max" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '单图上传' || recordDTO.type == '多图上传'" label="最小文件大小(kb)" prop="min">
					<el-input-number v-model="recordDTO.min" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '单图上传' || recordDTO.type == '多图上传'" label="最大文件大小(kb)" prop="max">
					<el-input-number v-model="recordDTO.max" :min="0" :max="30000" placeholder="0=不限制"></el-input-number>
				</el-form-item>
				
				<el-form-item v-if="recordDTO.type == '单选' || recordDTO.type == '多选'" label="选项配置" prop="options">
					<el-button size="mini" type="success" @click="addOption()">添加选项</el-button>
				</el-form-item>
				<el-form-item v-if="recordDTO.type == '单选' || recordDTO.type == '多选'"
					v-for="(option, index) in recordDTO.optionList"
					:label="(index + 1).toString()"
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
			recordDTO: {
				recordId: null,
				name: '',
				type: '单行文本',
				required: false,
				min: 0,
				max: 0,
				options: [],
				optionList: [],
			},
			editRules: {
				name: [
					{required: true, message: '请输入登记项名'},
					{min: 1, max: 50, message: '长度在1-20之间'},
				],
				type: [
					{required: true, message: '请选择是否为不中奖项'},
				],
				required: [
					{required: true, message: '请选择是否必填'},
				],
				min: [
					{required: true, message: '请输入最小值,0=不限制'},
				],
				max: [
					{required: true, message: '请输入最大值,0=不限制'},
				],
				optionList_option: [
					{required: true, message: '请输入选项内容'},
				],
			},
			editDialog: false,
			saveDisabled: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityRecord', [
			'activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/record/list/' + this.activityId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(recordId) {
			if(recordId != undefined) {
				http.ajax('/service-activity/record/' + recordId, {
					truefun: resData => {
						if(resData.options) {
							let optionList = [];
							resData.options.forEach((option) => {
								optionList.push({
									option: option,
									tempId: Math.random(),
								});
							});
							resData.optionList = optionList;
						}
						this.recordDTO = resData;
					},
				});
			}
			this.editDialog = true;
		},
		addOption() {
			this.recordDTO.optionList.push({
				option: '',
				tempId: Math.random(),
			});
		},
		removeOption(option) {
			let index = this.recordDTO.optionList.indexOf(option);
			if(index !== -1) {
				this.recordDTO.optionList.splice(index, 1);
			}
		},
		typeChange(type) {
			if(type == '单选') {
				this.recordDTO.min = 0;
				this.recordDTO.max = 0;
			}
			if(type != '单选' && type != '多选') {
				this.recordDTO.options = [];
				this.recordDTO.optionList = [];
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
				this.recordDTO.activityId = this.activityId;
				//检查选项
				if(this.recordDTO.type == '单选' || this.recordDTO.type == '多选') {
					if(this.recordDTO.optionList.length < 2) {
						Message.error('单选或多选必须指定至少2个选项');
						this.saveDisabled = false;
						return;
					}
				}
				this.recordDTO.options = [];
				this.recordDTO.optionList.forEach(option => {
					this.recordDTO.options.push(option.option);
				});
				http.ajax('/service-activity/record', {
					method: this.recordDTO.recordId ? 'put' : 'post',
					data: this.recordDTO,
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
		deleteData(recordId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/record/' + recordId, {
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
		...mapMutations('navTabs', [
			'addTab','closeTab',
		]),
		...mapMutations('activityRecordResult', {
			activityRecordResult_setActivityId: 'setActivityId',
			activityRecordResult_setHeaderTitle: 'setHeaderTitle',
		}),
		openWindow() {
			this.activityRecordResult_setActivityId(this.activityId);
			this.activityRecordResult_setHeaderTitle(this.headerTitle);
			this.addTab(this.path2permissionId['/ActivityRecordResult']);
		},
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/Activity'];
			let thisTabPermissionId = this.path2permissionId['/ActivityRecord'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>