<style>
.button-group { display: flex; flex-flow: wrap; justify-content: center; }
.button-group .btn { margin: 2px; }
</style>


<template>
	<div>
		<el-form :model="queryParams" ref="searchForm" label-width="auto" :inline="true" @submit.native.prevent="">
			<el-form-item>
				<el-button type="success" @click="openDialog()" icon="el-icon-plus">新增</el-button>
			</el-form-item>
			<el-form-item prop="name">
				<el-input type="text" v-model="queryParams.name" placeholder="活动名"></el-input>
			</el-form-item>
			<el-form-item prop="wxId">
				<el-select v-model="queryParams.wxId" clearable="" placeholder="微信公众号">
					<el-option v-for="wx in wxMap"
						:label="wx.name"
						:key="wx.wxId"
						:value="wx.wxId">
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" native-type="submit" @click="search(true)" icon="el-icon-search">搜索/刷新</el-button>
				<el-button @click="resetForm('searchForm')" icon="el-icon-circle-close">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="queryResult.rows" stripe="" border="" header-cell-class-name="bg-gray">
			<el-table-column prop="activityId" label="activityId" align="center" width="90"></el-table-column>
			<el-table-column prop="name" label="活动名" align="center"></el-table-column>
			<el-table-column label="活动类型" align="center">
				<template slot-scope="scope">{{ scope.row.type.join(',') }}</template>
			</el-table-column>
			<el-table-column prop="allowType" label="限定参与方式" align="center"></el-table-column>
			<el-table-column label="绑定公众号" align="center">
				<template slot-scope="scope">
					<template v-if="scope.row.wxDTO">{{ scope.row.wxDTO.name }}</template>
				</template>
			</el-table-column>
			<el-table-column prop="isTest" label="测试模式" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
			<el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
			<el-table-column label="开展状态" :formatter="formatStatus" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="250">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.activityId)" class="btn" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.activityId)" class="btn" icon="el-icon-delete">删除</el-button>
					<template v-for="type in scope.row.type">
						<el-button v-if="type == '问卷'"
							size="mini" type="info"
							@click="openWindow(scope.row.activityId, '/ActivityQuestionModule', scope.row.name)" class="btn"
							icon="el-icon-chat-line-round">问卷模块</el-button>
						<el-button v-if="type == '抽奖'"
							size="mini" type="info"
							@click="openWindow(scope.row.activityId, '/ActivityRaffle', scope.row.name)" class="btn"
							icon="el-icon-trophy">抽奖模块</el-button>
						<el-button v-if="type == '登记'"
							size="mini" type="info"
							@click="openWindow(scope.row.activityId, '/ActivityRecord', scope.row.name)" class="btn"
							icon="el-icon-phone">登记模块</el-button>
						<el-button v-if="type == '投票'"
							size="mini" type="info"
							@click="openWindow(scope.row.activityId, '/ActivityVote', scope.row.name)" class="btn"
							icon="el-icon-thumb">投票模块</el-button>
					</template>
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

		<el-dialog title="编辑活动信息"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="activityDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="activityId" v-show="false">
					<el-input v-model="activityDTO.activityId"></el-input>
				</el-form-item>
				<el-form-item label="活动名" prop="name">
					<el-input v-model="activityDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type" placeholder="活动类型">
					<el-select v-model="activityDTO.type" multiple="" :disabled="activityDTO.activityId != null">
						<el-option label="问卷" key="问卷" value="问卷"></el-option>
						<el-option label="抽奖" key="抽奖" value="抽奖"></el-option>
						<el-option label="登记" key="登记" value="登记"></el-option>
						<el-option label="投票" key="投票" value="投票"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否为测试模式" prop="isTest">
					<el-switch v-model="activityDTO.isTest"></el-switch>
				</el-form-item>
				<el-form-item label="开始时间" prop="startTime">
					<el-date-picker v-model="activityDTO.startTime"
						type="datetime"
						placeholder="选择开始时间"
						value-format="yyyy-MM-dd HH:mm:ss">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="结束时间" prop="endTime">
					<el-date-picker v-model="activityDTO.endTime"
						type="datetime"
						placeholder="选择结束时间"
						value-format="yyyy-MM-dd HH:mm:ss">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="限定参与方式" prop="allowType">
					<el-select v-model="activityDTO.allowType" placeholder="限定参与方式">
						<el-option label="无" key="无" value="无"></el-option>
						<el-option label="微信" key="微信" value="微信"></el-option>
						<el-option label="手机" key="手机" value="手机"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="绑定公众号" prop="wxId">
					<el-select v-model="activityDTO.wxId" placeholder="微信公众号">
						<el-option label="不绑定" :key="0" :value="0"></el-option>
						<el-option v-for="wx in wxMap"
							:label="wx.name"
							:key="wx.wxId"
							:value="wx.wxId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="限定参与者名单" prop="allowTypeDetail">
					<el-input type="textarea"
						v-model="activityDTO.allowTypeDetail"
						rows="5"
						placeholder="当启用【限定参与方式】时有效，为空则不限定参与者。【限定参与方式】为手机则填手机号，为微信则填微信号，填写多个时以英文逗号分隔。">
					</el-input>
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
			wxMap: {},
			queryParams: {
				name: '',
				appId: '',
				page: 1,
				limit: 10,
			},
			queryResult: {
				rows: [],
				total: 0,
			},
			activityDTO: {
				activityId: null,
				name: '',
				type: [],
				isTest: true,
				startTime: '',
				endTime: '',
				allowType: '无',
				wxId: 0,
			},
			editRules: {
				name: [
					{required: true, message: '请输入活动名'},
					{min: 2, max: 50, message: '长度在2-50之间'},
				],
				type: [
					{required: true, message: '请选择类型'},
				],
				startTime: [
					{required: true, message: '请选择开始时间'},
				],
				endTime: [
					{required: true, message: '请选择结束时间'},
				],
				allowType: [
					{required: true, message: '请选择限定参与方式'}
				],
			},
			editDialog: false,
		}
	},
	computed: {
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	mounted() {
		this.search(true);
		http.ajax('/activity-admin-service/activity/init', {
			data: this.queryParams,
			truefun: res => {
				res.forEach(wx => {
					this.wxMap[wx.wxId] = wx;
				});
			},
		});
	},
	methods: {
		search(isPage1 = false) {
			if(isPage1) {
				this.queryParams.page = 1;
			}
			http.ajax('/activity-admin-service/activity', {
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
		openDialog(activityId) {
			if(activityId != undefined) {
				http.ajax('/activity-admin-service/activity/' + activityId, {
					truefun: resData => {
						this.activityDTO = resData;
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
				http.ajax('/activity-admin-service/activity', {
					method: this.activityDTO.activityId ? 'put' : 'post',
					data: this.activityDTO,
					truefun: resData => {
						this.editDialog = false;
						this.search();
					},
				});
			});
		},
		deleteData(activityId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/activity-admin-service/activity/' + activityId, {
					method: 'delete',
					truefun: resData => {
						this.search();
					},
				});
			})
			.catch(() => {});
		},
		...mapMutations('navTabs', [
			'addTab',
		]),
		...mapMutations('activityQuestionModule', {
			activityQuestionModule_setActivityId: 'setActivityId',
			activityQuestionModule_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityRaffle', {
			activityRaffle_setActivityId: 'setActivityId',
			activityRaffle_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityRecord', {
			activityRecord_setActivityId: 'setActivityId',
			activityRecord_setHeaderTitle: 'setHeaderTitle',
		}),
		...mapMutations('activityVote', {
			activityVote_setActivityId: 'setActivityId',
			activityVote_setHeaderTitle: 'setHeaderTitle',
		}),
		openWindow(activityId, path, name) {
			let type = path[1].toLowerCase() + path.substr(2);
			this[type + '_setActivityId'](activityId);
			this[type + '_setHeaderTitle'](name);
			this.addTab(this.path2permissionId[path]);
		},
		formatBoolean(row, column, value) {
			return value ? '是' : '否';
		},
		formatStatus(row, column, value) {
			let status;
			let now;
			{
				let date = new Date();
				let Y = date.getFullYear();
				let M = date.getMonth() + 1;
				let D = date.getDate();
				if(D < 10) {
					D = '0' + D;
				}
				let h = date.getHours();
				if(h < 10) {
					h = '0' + h;
				}
				let m = date.getMinutes();
				if(m < 10) {
					m = '0' + m;
				}
				let s = date.getSeconds();
				if(s < 10) {
					s = '0' + s;
				}
				now = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
			}
			if(now < row.startTime) {
				status = '未开始';
			} else if(now > row.endTime) {
				status = '已结束';
			} else {
				status = '进行中';
			}
			row.status = status;
			return status;
		},
	},
}
</script>
