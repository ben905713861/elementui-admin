<style>
#echarts-main {
	width: 100%;
	height:400px;
}
</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 投票结果'"></el-page-header>
		<hr class="hr" color="#F2F6FC">
		
		<el-form @submit.native.prevent="">
			<el-form-item>
				<el-button type="primary" native-type="submit" @click="searchVoteNum()" icon="el-icon-search">刷新得票数</el-button>
				<el-button type="primary" native-type="submit" @click="showCheatVoteData = !showCheatVoteData;searchVoteNum()" icon="el-icon-search">包含/不包含人工加票</el-button>
			</el-form-item>
		</el-form>
		
		<div id="echarts-main"></div>
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
			<el-table-column prop="voteResultId" label="voteResultId" align="center" width="200px"></el-table-column>
			<el-table-column prop="openId" label="openId" align="center" width="280px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="150px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column prop="createTime" label="投票时间" align="center" width="160px"></el-table-column>
			<el-table-column label="投票情况">
				<template slot-scope="scope">
					<template v-for="optionId in scope.row.result">
						{{ voteId2vote[optionId].name }} &nbsp;
					</template>
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
		
		<el-dialog title="导出进度"
			:visible.sync="showDialog"
			:close-on-click-modal="false"
			@close="clearDialog"
			width="30%">
			<p>{{ exportInfo.msg }}</p>
			<el-progress :text-inside="true" :stroke-width="26" :percentage="exportInfo.percentage"></el-progress>
			<span v-if="exportInfo.showDownloadBtn" slot="footer">
				<el-button type="success" @click="downloadExcel()">下载</el-button>
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
			showCheatVoteData: true,
			queryParams: {
				voteId: 0,
				openId: '',
				phone: '',
				page: 1,
				limit: 10,
			},
			queryResult: {
				rows: [],
				total: 0,
			},
			voteId2vote: {},
			showDialog: false,
			exportInfo: {
				percentage: 0,
				msg: '',
				downloadPath: null,
				showDownloadBtn: false,
			},
		}
	},
	mounted() {
		this.searchVoteNum(this.search);
	},
	computed: {
		...mapState('activityVoteResult', [
			'voteId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		searchVoteNum(callback) {
			http.ajax('/activity-admin-service/voteResult/voteNum/' + this.voteId, {
				truefun: resData => {
					let voteId2vote = {};
					let voteName2voteNum = {};
					let voteName2voteTotalNum = {};
					resData.forEach(vote => {
						voteId2vote[vote.optionId] = vote;
						voteName2voteNum[vote.name] = vote.voteNum;
						voteName2voteTotalNum[vote.name] = vote.voteNum + vote.cheatVoteNum;
					});
					this.voteId2vote = voteId2vote;
					
					// 基于准备好的dom，初始化echarts实例
					let echarts = require('echarts');
					let myChart = echarts.init(document.getElementById('echarts-main'));
					// 绘制图表
					myChart.setOption({
						title: {
			                text: this.showCheatVoteData ? '总得票数(含人工加票)' : '真实得票数(不含人工加票)',
			            },
					    tooltip: {},
					    xAxis: {
					        data: Object.keys(voteName2voteNum),
					    },
					    yAxis: {},
					    series: [
						    {
						        name: this.showCheatVoteData ? '总得票数' : '真实得票数',
						        type: 'bar',
						        data: Object.values(this.showCheatVoteData ? voteName2voteTotalNum : voteName2voteNum),
						    },
					    ]
					});
					
					//回调
					callback && callback();
				},
			});
		},
		search() {
			this.queryParams.voteId = this.voteId;
			http.ajax('/activity-admin-service/voteResult', {
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
			//ws请求
			let socket = http.socket('/activity-admin-service/voteResult/exportExcel/' + this.voteId);
			socket.onopen = () => {
				this.showDialog = true;
			}
			socket.onmessage = event => {
				var res = JSON.parse(event.data);
				if(res.status == 0) {
					this.exportInfo.msg = res.msg;
				} else if(res.status == 1) {
					this.exportInfo.percentage = Number(res.data);
				} else if(res.status == 2) {
					this.exportInfo.msg = res.msg;
					this.exportInfo.downloadPath = res.data;
					console.log(res.data)
					this.exportInfo.showDownloadBtn = true;
				}
			}
			socket.onclose = () => {
				this.exportInfo.showDownloadBtn = true;
			}
			socket.onerror = err => {
				console.error(err);
			}
		},
		downloadExcel() {
			console.log(this.exportInfo.downloadPath)
			http.download('/activity-admin-service/voteResult/export', {
				voteId: this.voteId,
				path: this.exportInfo.downloadPath,
			});
		},
		clearDialog() {
			this.exportInfo.percentage = 0;
			this.exportInfo.msg = '';
			this.exportInfo.showDownloadBtn = false;
			this.exportInfo.downloadPath = null;
		},
		removeAll() {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/activity-admin-service/voteResult/all/' + this.voteId, {
					method: 'delete',
					truefun: res => {
						this.search();
						this.searchVoteNum();
					},
				});
			})
			.catch(() => {});
		},
		...mapMutations('navTabs', [
			'closeTab',
		]),
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/ActivityVote'];
			let thisTabPermissionId = this.path2permissionId['/ActivityVoteResult'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>