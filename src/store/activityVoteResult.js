const state = {
	voteId: 0,
	activityId: 0,
	headerTitle: '',
}

const mutations = {
	setVoteId(state, voteId) {
		state.voteId = voteId;
	},
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