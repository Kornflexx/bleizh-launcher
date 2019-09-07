import { NativeModules } from 'react-native'
import actions from '../actionTypes/application'

const HANDLERS = {
  [actions.requestApplications.toString()]: (next) => (state, action) => {
    NativeModules.AppLauncher.getApplications()
      .then(applications => next(actions.addApplications(applications)))
      .catch(err => console.log('eee', err))
  } 
}

export default store => next => {
  const handlers = {}
  for (const key in HANDLERS) {
    handlers[key] = HANDLERS[key](next)
  }
  return action => {
    const state = store.getState()
    if (handlers[action.type]) {
      handlers[action.type](state, action)
    }
    next(action)
  }
}