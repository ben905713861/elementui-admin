<style>
	.right-pane {
		/*height: 100%;*/
		padding: 0.5rem 1rem;
	}
</style>


<template>
	<div class="right-pane">
		<el-tabs :value="activeTabName" @tab-remove="closeTab" @tab-click="tabClick">
			<el-tab-pane name="Home" label="首页">
				<async-component :is="homeComponent"></async-component>
			</el-tab-pane>
			<el-tab-pane v-for="(item, key) in tabMap" :key="key" :name="key" :label="item.label" closable="">
				<async-component :is="item.component"></async-component>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>


<script>
import { mapState, mapMutations } from 'vuex'
import Home from '@/views/Home'

export default {
	name: 'RightPane',
	data() {
		return {
			homeComponent: Home,
		}
	},
	computed: {
		...mapState('navTabs', [
			'tabMap','activeTabName',
		]),
	},
	methods: {
		...mapMutations('navTabs', [
			'switchTab','closeTab',
		]),
		tabClick(e) {
			this.switchTab(e.name)
		},
	},
}
</script>
