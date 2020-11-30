const state = {
    activeTabName: 'home',
    tabMap: {},
}

const mutations = {
	switchTab(state, index) {
		state.activeTabName = index;
	},
    addTab(state, index) {
    	let component = resolve => require(['@/views/' + index], resolve)
    	state.tabMap[index] = {
    		label: index,
            component: component,
    	}
        state.activeTabName = index;
    },
    closeTab(state, name) {
    	//记录当前打开的选项卡
    	let last_activeTabName = state.activeTabName;
    	//先切换到待删除选项卡，再删除
    	state.activeTabName = name;
        delete state.tabMap[name];
        //删除选项卡后，归位
        let keys = Object.keys(state.tabMap);
		if(keys.length == 0) {
			state.activeTabName = 'Home';
		} else {
			state.activeTabName = last_activeTabName;
		}
	},
}

export default {
    namespaced: true,
    state,
    mutations,
}