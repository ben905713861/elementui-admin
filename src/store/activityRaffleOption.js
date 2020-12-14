const state = {
	raffleId: 0,
	activityId: 0,
	headerTitle: '',
}

const mutations = {
	setRaffleId(state, raffleId) {
		state.raffleId = raffleId;
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