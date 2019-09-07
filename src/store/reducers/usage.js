import { handleActions } from 'redux-actions'
import actions from '../actionTypes/usage'
import { REHYDRATE } from 'redux-persist'

import * as usageServices from '../../services/recommandation'

const initialState = {
  weekUsages: {}
}

/*
  weekUsages: {
    41: [track, track]
  }
*/

const selectOrCreate = (select, create) => (state) => (...args) => {
  const info = select(state)(...args)
  if (!info.item) {
    return {
      ...create(state)(...args),
      created: true
    }
  }
  return {
    ...info,
    created: false
  }
}

const selectWeekUsage = (state) => ({ date }) => {
  const index = usageServices.getWeekIndex(date)
  return {
    item: state.weekUsages[index],
    index
  }
}
const createWeekUsage = (state) => ({ date }) => {
  const weekIndex = usageServices.getWeekIndex(date)
  const newWeekUsage = []
  state.weekUsages = {...state.weekUsages}
  state.weekUsages[weekIndex] = newWeekUsage
  return { item: newWeekUsage, index: weekIndex }
}
const selectOrCreateWeekUsage = selectOrCreate(selectWeekUsage, createWeekUsage)

const selectTrack = state => ({ date, packageName }) => {
  const weekIndex = usageServices.getWeekIndex(date)
  const index = state.weekUsages[weekIndex].findIndex(track => track.packageName === packageName)
  return {
    item: state.weekUsages[weekIndex][index],
    index
  }
}

const createTrack = state => ({ date, packageName }) => {
  const weekIndex = usageServices.getWeekIndex(date)
  const track = usageServices.addUsage(usageServices.createTrack(packageName), date)
  state.weekUsages[weekIndex] = [
    ...state.weekUsages[weekIndex],
    track
  ]
  return { item: track, index: state.weekUsages[weekIndex].length - 1 }
}

const updateTrack = (state) => (trackInfo, { date }) => {
  const weekIndex = usageServices.getWeekIndex(date)
  const nextTrack = usageServices.addUsage(trackInfo.item, date)
  state.weekUsages[weekIndex][trackInfo.index] = nextTrack
} 
const selectOrCreateTrack = selectOrCreate(selectTrack, createTrack)
export default handleActions(
  {
    [actions.addUsage]: (state, action) => {
      const { payload } = action
      const nextState = { ...state }
      selectOrCreateWeekUsage(nextState)(payload)
      const trackInfo = selectOrCreateTrack(nextState)(payload)
      if (!trackInfo.created) {
        updateTrack(nextState)(trackInfo, payload)
      }
      return nextState
    },
    [REHYDRATE]: (state, action) => {
      const { payload } = action
      console.log('hydrated state', payload)
      if (payload && payload.usage) return payload.usage
      return initialState
    }
  },
  initialState
);
