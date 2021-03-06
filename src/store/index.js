import Vuex from "vuex"
import Vue from 'vue'
import navTabs from './navTabs'
import activityQuestionModule from './activityQuestionModule'
import activityQuestion from './activityQuestion'
import activityQuestionResult from './activityQuestionResult'
import activityRaffle from './activityRaffle'
import activityRaffleOption from './activityRaffleOption'
import activityRaffleResult from './activityRaffleResult'
import activityRecord from './activityRecord'
import activityRecordResult from './activityRecordResult'
import activityVote from './activityVote'
import activityVoteOption from './activityVoteOption'
import activityVoteResult from './activityVoteResult'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        navTabs: navTabs,
        activityQuestionModule: activityQuestionModule,
        activityQuestion: activityQuestion,
        activityQuestionResult: activityQuestionResult,
        activityRaffle: activityRaffle,
        activityRaffleOption: activityRaffleOption,
        activityRaffleResult: activityRaffleResult,
        activityRecord: activityRecord,
        activityRecordResult: activityRecordResult,
        activityVote: activityVote,
        activityVoteOption: activityVoteOption,
        activityVoteResult: activityVoteResult,
    }
});