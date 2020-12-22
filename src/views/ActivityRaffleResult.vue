<style>
.row-thumb {
	max-height: 30px;
}
</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 抽奖结果'"></el-page-header>
		<hr class="hr" color="#F2F6FC">
		
		<el-form @submit.native.prevent="">
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="searchAwardNum()" icon="el-icon-search">刷新奖品数</el-button>
			</el-form-item>
		</el-form>
		<el-table :data="awardInfo.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column type="index" :index="1" align="center"></el-table-column>
			<el-table-column prop="name" label="奖品名" align="center"></el-table-column>
			<el-table-column label="缩略图" align="center" width="100">
				<template slot-scope="scope">
					<img v-if="scope.row.thumbUrl" :src="scope.row.thumbUrl" class="row-thumb" />
				</template>
			</el-table-column>
			<el-table-column label="概率" align="center" width="100">
				<template slot-scope="scope" v-if="awardInfo.totalRate != 0">
					{{ (scope.row.rate / awardInfo.totalRate*100).toFixed(2) }}%
				</template>
			</el-table-column>
			<el-table-column label="当日已发奖数 / 每日限制发奖数" align="center">
				<template slot-scope="scope">
					<template v-if="scope.row.dayLimit == 0">
						<el-tag type="info">不限</el-tag>
					</template>
					<template v-else="">
						<el-row>
							<el-col :span="20">
								<el-progress
									text-inside=""
									:stroke-width="30"
									:percentage="scope.row.dayCount / scope.row.dayLimit * 100">
								</el-progress>
							</el-col>
							<el-col :span="4">
								<el-tag type="info">{{ scope.row.dayCount + '/' + scope.row.dayLimit }}</el-tag>
							</el-col>
						</el-row>
					</template>
				</template>
			</el-table-column>
			<el-table-column prop="totalLimit" label="已发总奖数 / 发奖限制总数" align="center">
				<template slot-scope="scope">
					<template v-if="scope.row.totalLimit == 0">
						<el-tag type="info">不限</el-tag>
					</template>
					<template v-else="">
						<el-row>
							<el-col :span="20">
								<el-progress
									text-inside=""
									:stroke-width="30"
									:percentage="scope.row.totalCount / scope.row.totalLimit * 100">
								</el-progress>
							</el-col>
							<el-col :span="4">
								<el-tag type="info">{{ scope.row.totalCount + '/' + scope.row.totalLimit }}</el-tag>
							</el-col>
						</el-row>
					</template>
				</template>
			</el-table-column>
		</el-table>
		<hr class="hr" color="#F2F6FC">
		
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" class="search-form" @submit.native.prevent="">
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
			<el-table-column prop="openId" label="openId" align="center" width="280px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="150px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column prop="createTime" label="抽奖时间" align="center" width="180px"></el-table-column>
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
			awardInfo: {
				rows: [],
				totalRate: 0,
			},
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
		this.searchAwardNum();
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
		searchAwardNum() {
			http.ajax('/activity-admin-service/raffleResult/awardNum/' + this.raffleId, {
				truefun: res => {
					let totalRate = 0;
					this.awardInfo.rows = res;
					res.forEach(row => {
						totalRate += row.rate;
					});
					this.awardInfo.totalRate = totalRate;
				},
			});
		},
		search() {
			this.queryParams.raffleId = this.raffleId;
			http.ajax('/activity-admin-service/raffleResult', {
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
			http.download('/activity-admin-service/raffleResult/exportExcel/' + this.raffleId);
		},
		removeAll() {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/activity-admin-service/raffleResult/all/' + this.raffleId, {
					method: 'delete',
					truefun: res => {
						this.search();
						this.searchAwardNum();
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