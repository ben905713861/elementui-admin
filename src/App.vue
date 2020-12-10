<style>
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
	}
	html, body {
		margin: 0;
		padding: 0;
	}
	.bg-gray {
		background-color: #f5f5f5!important;
	}
	.pagination {
		margin: 8px 0;
		text-align: right;
	}
	.el-dialog__body {
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}
	.hr {
		margin-bottom: 12px
	}
</style>

<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
		name: 'app'
	}
</script>
