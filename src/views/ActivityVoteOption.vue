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
		<el-page-header @back="goBack" :content="headerTitle + ' - 投票项配置'"></el-page-header>
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
			<el-table-column prop="name" label="投票项名" align="center"></el-table-column>
			<el-table-column label="缩略图" align="center">
				<template slot-scope="scope">
					<img v-if="scope.row.thumbUrl" :src="scope.row.thumbUrl" class="row-thumb" />
				</template>
			</el-table-column>
			<el-table-column prop="link" label="超链接"></el-table-column>
			<el-table-column align="center" label="操作" width="200">
				<div slot-scope="scope" class="button-group">
					<el-button size="mini" type="warning" @click="openDialog(scope.row.optionId)" icon="el-icon-edit-outline">修改</el-button>
					<el-button size="mini" type="danger" @click="deleteData(scope.row.optionId)" icon="el-icon-delete">删除</el-button>
				</div>
			</el-table-column>
		</el-table>
		
		<el-dialog title="编辑投票项"
			:visible.sync="editDialog"
			:close-on-click-modal="false"
			@close="resetForm('editForm')"
			width="30%">
			<el-form :model="voteOptionDTO" :rules="editRules" ref="editForm" label-width="auto">
				<el-form-item prop="optionId" v-show="false">
					<el-input v-model="voteOptionDTO.optionId"></el-input>
				</el-form-item>
				<el-form-item label="投票项名" prop="name">
					<el-input v-model="voteOptionDTO.name"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="voteOptionDTO.description"></el-input>
				</el-form-item>
				<el-form-item label="缩略图" prop="thumbPath">
					<el-input v-show="false" v-model="voteOptionDTO.thumbPath"></el-input>
					<el-upload action=""
						:http-request="uploadThumb"
						:show-file-list="false"
						class="avatar-uploader">
						<img class="thumb-img" v-if="voteOptionDTO.thumbUrl" :src="voteOptionDTO.thumbUrl">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="超链接" prop="link">
					<el-input v-model="voteOptionDTO.link"></el-input>
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
			voteOptionDTO: {
				optionId: null,
				voteId: null,
				name: '',
				description: '',
				thumbPath: null,
				thumbUrl: null,
				link: '',
			},
			editRules: {
				name: [
					{required: true, message: '请输入投票项名'},
					{min: 1, max: 20, message: '长度在1-20之间'},
				],
				description: [
					{max: 1000, message: '长度须在1000字符以内'},
				],
				thumbPath: [
					{required: true, message: '请上传缩略图'},
				],
				link: [
					{max: 200, message: '长度须在200字符以内'},
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
		...mapState('activityVoteOption', [
			'voteId','activityId','headerTitle',
		]),
		...mapState('navTabs', [
			'path2permissionId',
		]),
	},
	methods: {
		search() {
			http.ajax('/activity-admin-service/voteOption/list/' + this.voteId, {
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
			this.voteOptionDTO.thumbUrl = null;
		},
		openDialog(optionId) {
			if(optionId != undefined) {
				http.ajax('/activity-admin-service/voteOption/' + optionId, {
					truefun: resData => {
						this.voteOptionDTO = resData;
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
					formdata.append('voteOptionThumb', file);
					http.ajax('/activity-admin-service/voteOption/thumb', {
						method: 'post',
						data: formdata,
						truefun: resData => {
							this.voteOptionDTO.thumbPath = resData.thumbPath;
							this.voteOptionDTO.thumbUrl = resData.thumbUrl;
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
				this.voteOptionDTO.voteId = this.voteId;
				http.ajax('/activity-admin-service/voteOption', {
					method: this.voteOptionDTO.optionId ? 'put' : 'post',
					data: this.voteOptionDTO,
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
				http.ajax('/activity-admin-service/voteOption/' + optionId, {
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
			let lastTabPermissionId = this.path2permissionId['/ActivityVote'];
			let thisTabPermissionId = this.path2permissionId['/ActivityVoteOption'];
			this.closeTab([thisTabPermissionId, lastTabPermissionId]);
		},
	},
}
</script>