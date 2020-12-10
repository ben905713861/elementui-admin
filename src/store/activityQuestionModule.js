const state = {
	activityId: 0,
	headerTitle: '',
}

const mutations = {
	setActivityId(state, activityId) {
		state.activityId = activityId;
	},
	setHeaderTitle(state, headerTitle) {
		state.headerTitle = headerTitle;
	},
}

export default {
	namespaced: true,
	state,
	mutations,
}