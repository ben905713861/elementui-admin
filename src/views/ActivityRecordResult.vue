<style>
.thumb-box {
	display: flex; flex-direction:column;
}
.thumb-box .thumb {
	max-width: 400px;
}
</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 登记结果'"></el-page-header>
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
			<el-table-column prop="recordResultId" label="recordResultId" align="center" width="180px"></el-table-column>
			<el-table-column prop="openId" label="openId" align="center" width="280px"></el-table-column>
			<el-table-column prop="phone" label="手机" align="center" width="120px"></el-table-column>
			<el-table-column prop="ip" label="IP" align="center" width="150px"></el-table-column>
			<el-table-column prop="createTime" label="登记时间" align="center" width="160px"></el-table-column>
			<el-table-column label="登记内容">
				<template slot-scope="scope">
					<template v-for="(answer, recordId, index) in scope.row.result">
						{{ answer }} &nbsp;
					</template>
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作" width="120">
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
		
		<el-dialog title="登记内容"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			width="40%">
			<el-table :data="answerList" stripe="" border="" header-cell-class-name="bg-gray">
				<el-table-column type="index" :index="1" align="center"></el-table-column>
				<el-table-column label="登记项">
					<template slot-scope="scope">
						{{ recordId2recordDTO[scope.row.recordId].name }}
					</template>
				</el-table-column>
				<el-table-column label="回答">
					<template slot-scope="scope">
						<template v-if="recordId2recordDTO[scope.row.recordId].type == '单图上传'
							|| recordId2recordDTO[scope.row.recordId].type == '多图上传'">
							<div class="thumb-box">
								<img v-for="path in JSON.parse(scope.row.answer)"
									:src="'http://file.huodong7.dev' + path" class="thumb" />
							</div>
						</template>
						<template v-else="">
							{{ scope.row.answer }}
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
				activityId: 0,
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
			recordId2recordDTO: {},
			answerList: [],
		}
	},
	mounted() {
		this.search();
		http.ajax('/service-activity/recordResult/init/' + this.activityId, {
			truefun: res => {
				res.forEach(recordDTO => {
					this.recordId2recordDTO[recordDTO.recordId] = recordDTO;
				});
			},
		});
	},
	computed: {
		...mapState('activityRecordResult', [
			'activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			this.queryParams.activityId = this.activityId;
			http.ajax('/service-activity/recordResult', {
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
			for(let key in result) {
				answerList.push({
					recordId: key,
					answer: result[key],
				});
			}
			this.answerList = answerList;
			this.editDialog = true;
		},
		exportExcel() {
			http.download('/service-activity/recordResult/exportExcel/' + this.activityId);
		},
		removeAll() {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/recordResult/all/' + this.activityId, {
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
			let lastTabPermissionId = this.path2permissionId['/ActivityRecord'];
			let thisTabPermissionId = this.path2permissionId['/ActivityRecordResult'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>