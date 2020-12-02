<style>
.nav {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 15rem;
    background-color: #324157;
}
.pane {
    position: absolute;
    left: 15rem;
    top: 0;
    bottom: 0;
    right: 0;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>


<template>
    <el-container>
        <div class="nav">
            <left-nav></left-nav>
        </div>
        <div class="pane">
            <right-pane></right-pane>
        </div>
    </el-container>
</template>


<script>
import LeftNav from './LeftNav'
import RightPane from './RightPane'

export default {
    name: 'Home',
    components: {
        LeftNav,
        RightPane,
    },
    mounted() {
    	//加载上次关闭的窗口
    	let lastTabInfo = window.localStorage.getItem('LAST_TAB_INFO');
    	if(lastTabInfo) {
    		lastTabInfo = JSON.parse(lastTabInfo);
    		console.log(lastTabInfo)
//  		this.$store.state.navTabs.tabMap = lastTabInfo.tabMap;
//  		this.$store.state.navTabs.activeTabName = lastTabInfo.activeTabName;
    	}
//  	
//		//关闭窗口前的触发事件
//		let _this = this;
//		window.onbeforeunload = function(e) {
//			let lastTabInfo = {
//				activeTabName: _this.$store.state.navTabs.activeTabName,
//				tabMap: _this.$store.state.navTabs.tabMap,
//			};
//			window.localStorage.setItem('LAST_TAB_INFO', JSON.stringify(lastTabInfo));
//		}
	},
}
</script>
