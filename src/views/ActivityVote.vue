<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 投票列表'"></el-page-header>
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
			<el-table-column prop="voteId" label="voteId" align="center"></el-table-column>
			<el-table-column prop="title" label="投票名" align="center"></el-table-column>
			<el-table-column prop="maxSelect" label="最多选择数" align="center"></el-table-column>
			<el-table-column prop="minSelect" label="最小选择数" align="center"></el-table-column>
			<el-table-column prop="allowView" label="是否允许查看结果" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="dayLimit" label="每人每日限抽次数" align="center"></el-table-column>
			<el-table-column prop="totalLimit" label="每人限抽总次数" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="500">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.voteId, '/ActivityVoteOption', scope.row.title)"
						icon="el-icon-edit-outline">投票项配置</el-button>
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.voteId, '/ActivityVoteResult', scope.row.title)"
						icon="el-icon-s-unfold">查看投票结果</el-button>
					<el-button size="mini" type="warning" @click="openDialog(scope.row.voteId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.voteId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑投票信息"
			:visible.sync="showDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="voteDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="voteId" v-show="false">
					<el-input v-model="voteDTO.voteId"></el-input>
				</el-form-item>
				<el-form-item label="投票名" prop="title">
					<el-input v-model="voteDTO.title"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="voteDTO.description"></el-input>
				</el-form-item>
				<el-form-item label="最少选择数" prop="minSelect">
					<el-input-number v-model="voteDTO.minSelect" :min="1" :max="100"></el-input-number>
				</el-form-item>
				<el-form-item label="最大选择数" prop="maxSelect">
					<el-input-number v-model="voteDTO.maxSelect" :min="1" :max="100"></el-input-number>
				</el-form-item>
				<el-form-item label="允许查看投票结果" prop="allowView">
					<el-switch v-model="voteDTO.allowView"></el-switch>
				</el-form-item>
				<el-form-item label="每人每天限抽次数" prop="dayLimit">
					<el-input-number v-model="voteDTO.dayLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="每人限抽总次数" prop="totalLimit">
					<el-input-number v-model="voteDTO.totalLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
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
			voteDTO: {
				voteId: null,
				activityId: null,
				title: '',
				description: '',
				minSelect: 1,
				maxSelect: 1,
				allowView: true,
				dayLimit: 0,
				totalLimit: 0,
			},
			editRules: {
				title: [
					{required: true, message: '请输入投票名'},
					{min: 2, max: 50, message: '长度在2-50之间'},
				],
				description: [
					{max: 1000, message: '长度须在1000以内'},
				],
				minSelect: [
					{required: true, message: '请输入最少选择数'},
				],
				maxSelect: [
					{required: true, message: '请输入最大选择数'},
				],
				dayLimit: [
					{required: true, message: '请输入每人每日限抽次数'},
				],
				totalLimit: [
					{required: true, message: '每人限抽总次数'},
				],
			},
			showDialog: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityVote', [
			'activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/vote/list/' + this.activityId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(voteId) {
			if(voteId != undefined) {
				http.ajax('/service-activity/vote/' + voteId, {
					truefun: resData => {
						this.voteDTO = resData;
					},
				});
			}
			this.showDialog = true;
		},
		saveData() {
			this.$refs['editForm'].validate(valid => {
				if(!valid) {
					Message.error('表单信息错误');
					return;
				}
				this.voteDTO.activityId = this.activityId;
				http.ajax('/service-activity/vote', {
					method: this.voteDTO.voteId ? 'put' : 'post',
					data: this.voteDTO,
					truefun: resData => {
						this.showDialog = false;
						this.search(true);
					},
				});
			});
		},
		deleteData(voteId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/vote/' + voteId, {
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
		...mapMutations('activityVoteOption', {
			activityVoteOption_setVoteId: 'setVoteId',
			activityVoteOption_setActivityId: 'setActivityId',
			activityVoteOption_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityVoteResult', {
			activityVoteResult_setVoteId: 'setVoteId',
			activityVoteResult_setActivityId: 'setActivityId',
			activityVoteResult_setHeaderTitle: 'setHeaderTitle',
		}),
		openWindow(voteId, type, title) {
			if(type == '/ActivityVoteOption') {
				this.activityVoteOption_setVoteId(voteId);
				this.activityVoteOption_setActivityId(this.activityId);
				this.activityVoteOption_setHeaderTitle(title);
			} else if(type == '/ActivityVoteResult') {
				this.activityVoteResult_setVoteId(voteId);
				this.activityVoteResult_setActivityId(this.activityId);
				this.activityVoteResult_setHeaderTitle(title);
			}
			this.addTab(this.path2permissionId[type]);
		},
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/Activity'];
			let thisTabPermissionId = this.path2permissionId['/ActivityVote'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>