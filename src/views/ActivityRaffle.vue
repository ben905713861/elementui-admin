<style>

</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 抽奖列表'"></el-page-header>
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
			<el-table-column prop="raffleId" label="raffleId" align="center"></el-table-column>
			<el-table-column prop="title" label="抽奖名" align="center"></el-table-column>
			<el-table-column prop="dayLimit" label="每人每日限抽次数" align="center"></el-table-column>
			<el-table-column prop="totalLimit" label="每人限抽总次数" align="center"></el-table-column>
			<el-table-column prop="dayWinLimit" label="每人每日限中次数" align="center"></el-table-column>
			<el-table-column prop="totalWinLimit" label="每人限中总次数" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="500">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.raffleId, '/ActivityRaffleOption', scope.row.title)"
						icon="el-icon-edit-outline">抽奖项配置</el-button>
					<el-button size="mini" type="info"
						@click="openWindow(scope.row.raffleId, '/ActivityRaffleResult', scope.row.title)"
						icon="el-icon-s-unfold">查看抽奖结果</el-button>
					<el-button size="mini" type="warning" @click="openDialog(scope.row.raffleId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.raffleId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑抽奖信息"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="raffleDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="raffleId" v-show="false">
					<el-input v-model="raffleDTO.raffleId"></el-input>
				</el-form-item>
				<el-form-item label="抽奖名" prop="title">
					<el-input v-model="raffleDTO.title"></el-input>
				</el-form-item>
				<el-form-item label="每人每天限抽次数" prop="dayLimit">
					<el-input-number v-model="raffleDTO.dayLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="每人限抽总次数" prop="totalLimit">
					<el-input-number v-model="raffleDTO.totalLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="每人每天限中次数" prop="dayWinLimit">
					<el-input-number v-model="raffleDTO.dayWinLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="每人限中总次数" prop="totalWinLimit">
					<el-input-number v-model="raffleDTO.totalWinLimit" :min="0" :max="100" placeholder="0代表不限制"></el-input-number>
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
			raffleDTO: {
				raffleId: null,
				activityId: this.activityId,
				title: '',
				dayLimit: null,
				totalLimit: null,
				dayWinLimit: null,
				totalWinLimit: null,
			},
			editRules: {
				title: [
					{required: true, message: '请输入抽奖名'},
					{min: 2, max: 50, message: '长度在2-50之间'},
				],
				dayWinLimit: [
					{required: true, message: '请输入每人每日限抽次数'},
				],
				totalWinLimit: [
					{required: true, message: '每人限抽总次数'},
				],
				dayLimit: [
					{required: true, message: '请输入每人每日限抽次数'},
				],
				totalLimit: [
					{required: true, message: '每人限抽总次数'},
				],
			},
			editDialog: false,
		}
	},
	mounted() {
		this.search();
	},
	computed: {
		...mapState('activityRaffle', [
			'activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/raffle/list/' + this.activityId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		openDialog(raffleId) {
			if(raffleId != undefined) {
				http.ajax('/service-activity/raffle/' + raffleId, {
					truefun: resData => {
						this.raffleDTO = resData;
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
				this.raffleDTO.activityId = this.activityId;
				http.ajax('/service-activity/raffle', {
					method: this.raffleDTO.raffleId ? 'put' : 'post',
					data: this.raffleDTO,
					truefun: resData => {
						this.editDialog = false;
						this.search(true);
					},
				});
			});
		},
		deleteData(raffleId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/raffle/' + raffleId, {
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
		...mapMutations('activityRaffleOption', {
			activityRaffleOption_setRaffleId: 'setRaffleId',
			activityRaffleOption_setActivityId: 'setActivityId',
			activityRaffleOption_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityRaffleResult', {
			activityRaffleResult_setRaffleId: 'setRaffleId',
			activityRaffleResult_setActivityId: 'setActivityId',
			activityRaffleResult_setHeaderTitle: 'setHeaderTitle',
		}),
		openWindow(raffleId, type, title) {
			if(type == '/ActivityRaffleOption') {
				this.activityRaffleOption_setRaffleId(raffleId);
				this.activityRaffleOption_setActivityId(this.activityId);
				this.activityRaffleOption_setHeaderTitle(title);
			} else if(type == '/ActivityRaffleResult') {
				this.activityRaffleResult_setRaffleId(raffleId);
				this.activityRaffleResult_setActivityId(this.activityId);
				this.activityRaffleResult_setHeaderTitle(title);
			}
			this.addTab(this.path2permissionId[type]);
		},
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/Activity'];
			let thisTabPermissionId = this.path2permissionId['/ActivityRaffle'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>