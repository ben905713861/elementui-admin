<style>
.row-thumb {
	max-height: 30px;
}
.avatar-uploader .el-upload {
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	cursor: pointer;
}
.avatar-uploader .el-upload:hover {
	border-color: #409EFF;
}
.avatar-uploader .thumb-img {
	display: block;
	max-width: 300px;
}
.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	line-height: 178px;
	text-align: center;
}
</style>

<template>
	<div>
		<el-page-header @back="goBack" :content="headerTitle + ' - 抽奖项配置'"></el-page-header>
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
			<el-table-column prop="optionId" label="optionId" align="center"></el-table-column>
			<el-table-column prop="name" label="奖品名" align="center"></el-table-column>
			<el-table-column label="缩略图" align="center">
				<template slot-scope="scope">
					<img v-if="scope.row.thumbUrl" :src="scope.row.thumbUrl" class="row-thumb" />
				</template>
			</el-table-column>
			<el-table-column prop="noAward" label="是否为不中奖项" :formatter="formatBoolean" align="center"></el-table-column>
			<el-table-column prop="rate" label="权重" align="center"></el-table-column>
			<el-table-column label="概率" align="center">
				<template slot-scope="scope" v-if="queryResult.totalRate != 0">
					{{ (scope.row.rate / queryResult.totalRate*100).toFixed(2) }}%
				</template>
			</el-table-column>
			<el-table-column prop="dayLimit" label="每日限制发奖数" align="center"></el-table-column>
			<el-table-column prop="totalLimit" label="发奖限制总数" align="center"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.optionId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.optionId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑题目"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="raffleOptionDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="optionId" v-show="false">
					<el-input v-model="raffleOptionDTO.optionId"></el-input>
				</el-form-item>
				<el-form-item label="奖品名" prop="name">
					<el-input v-model="raffleOptionDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="是否为不中奖项" prop="noAward">
					<el-select v-model="raffleOptionDTO.noAward" placeholder="是否为不中奖项">
						<el-option label="是" :key="true" :value="true"></el-option>
						<el-option label="否" :key="false" :value="false"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="缩略图" prop="thumbPath">
					<el-input v-show="false" v-model="raffleOptionDTO.thumbPath"></el-input>
					<el-upload action=""
						:http-request="uploadThumb"
						:show-file-list="false"
						class="avatar-uploader">
						<img class="thumb-img" v-if="raffleOptionDTO.thumbUrl" :src="raffleOptionDTO.thumbUrl">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="权重" prop="rate">
					<el-input-number v-model="raffleOptionDTO.rate" :min="0" :max="10000"></el-input-number>
				</el-form-item>
				<el-form-item label="每日限制发奖数" prop="dayLimit">
					<el-input-number v-model="raffleOptionDTO.dayLimit" :min="0" :max="10000" placeholder="0代表不限制"></el-input-number>
				</el-form-item>
				<el-form-item label="发奖限制总数" prop="totalLimit">
					<el-input-number v-model="raffleOptionDTO.totalLimit" :min="0" :max="10000" placeholder="0代表不限制"></el-input-number>
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
import ImageCutter from '@/components/ImageCutter';

export default {
	data() {
		return {
			queryParams: {},
			queryResult: {
				rows: [],
				totalRate: 0,
			},
			raffleOptionDTO: {
				optionId: null,
				name: '',
				noAward: false,
				thumbPath: null,
				thumbUrl: null,
				rate: null,
				dayLimit: null,
				totalLimit: null,
			},
			editRules: {
				name: [
					{required: true, message: '请输入奖品名'},
					{min: 2, max: 50, message: '长度在1-20之间'},
				],
				noAward: [
					{required: true, message: '请选择是否为不中奖项'},
				],
				thumbPath: [
					{required: true, message: '请上传缩略图'},
				],
				rate: [
					{required: true, message: '请输入权重'},
				],
				dayLimit: [
					{required: true, message: '请输入每日限制发奖数'},
				],
				totalLimit: [
					{required: true, message: '请输入发奖限制总数'},
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
		...mapState('activityRaffleOption', [
			'raffleId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/service-activity/raffleOption/list/' + this.raffleId, {
				data: this.queryParams,
				truefun: res => {
					this.queryResult.rows = res;
					res.forEach(row => {
						this.queryResult.totalRate += row.rate;
					});
				},
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
			this.raffleOptionDTO.thumbUrl = null;
		},
		openDialog(optionId) {
			if(optionId != undefined) {
				http.ajax('/service-activity/raffleOption/' + optionId, {
					truefun: resData => {
						this.raffleOptionDTO = resData;
					},
				});
			}
			this.editDialog = true;
		},
		uploadThumb(v) {
			ImageCutter.instance(v.file)
				.compress(600)
				.then((cutter) => {
					var file = cutter.display();
					var formdata = new FormData();
					formdata.append('raffleOptionThumb', file);
					http.ajax('/service-activity/raffleOption/thumb', {
						method: 'post',
						data: formdata,
						truefun: resData => {
							this.raffleOptionDTO.thumbPath = resData.thumbPath;
							this.raffleOptionDTO.thumbUrl = resData.thumbUrl;
						},
					});
				})
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
				this.raffleOptionDTO.raffleId = this.raffleId;
				http.ajax('/service-activity/raffleOption', {
					method: this.raffleOptionDTO.optionId ? 'put' : 'post',
					data: this.raffleOptionDTO,
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
		deleteData(optionId) {
			this.$confirm('确定删除？', '操作警告')
			.then(() => {
				http.ajax('/service-activity/raffleOption/' + optionId, {
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
			'closeTab',
		]),
		goBack() {
			let lastTabPermissionId = this.path2permissionId['/ActivityRaffle'];
			let thisTabPermissionId = this.path2permissionId['/ActivityRaffleOption'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>