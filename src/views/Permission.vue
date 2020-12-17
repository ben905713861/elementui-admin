<style>

</style>


<template>
	<div>
		<el-form :inline="true">
			<el-form-item>
				<el-button type="primary" @click="search()" icon="el-icon-search">刷新</el-button>
			</el-form-item>
		</el-form>
		
		<el-table :data="queryResult.rows" stripe="" border=""
			header-cell-class-name="bg-gray"
			highlight-current-row=""
			row-key="permissionId"
		    default-expand-all=""
		    :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
			<el-table-column type="index" :index="1" align="center"></el-table-column>
			<el-table-column prop="name" label="菜单权限名" align="left">
				<template slot-scope="scope">
					<i v-if="scope.row.icon" :class="scope.row.icon"></i>
					<span>{{ scope.row.name }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="type" label="类型" align="center"></el-table-column>
			<el-table-column prop="path" label="菜单路径" align="center"></el-table-column>
			<el-table-column prop="authority" label="权限标识" align="center"></el-table-column>
			<el-table-column prop="sort" label="排序" align="center"></el-table-column>
			<el-table-column prop="isHidden" label="隐藏" align="center" :formatter="formatBoolean"></el-table-column>
		</el-table>
	</div>
</template>


<script>
import http from '@/components/Http';
import permisTree from '@/components/PermissionTree';
import { Message } from "element-ui";

export default {
	data() {
		return {
			queryResult: {
				rows: [],
			},
			permissionDTO: {},
		}
	},
	mounted() {
		this.search();
	},
	methods: {
		search() {
			http.ajax('/auth-admin-service/permission', {
				truefun: res => {
					this.queryResult.rows = permisTree.arrange(res);
				},
			});
		},
		formatBoolean(row, column, value) {
			return value ? '是' : '否';
		},
	},
}
</script>
