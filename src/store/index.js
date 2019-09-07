import { createStore as createReduxStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'
import AsyncStorage from '@react-native-community/async-storage'

import applicationReducer from './reducers/application'
import usageReducer from './reducers/usage'

import applicationMiddleware from './middlewares/application'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['usage']
}

export default () => {
  const store = createReduxStore(
    persistReducer(
      persistConfig,
      combineReducers({
        application: applicationReducer,
        usage: usageReducer
      })
    ),
    applyMiddleware(
      applicationMiddleware
    )
  )
  let persistor = persistStore(store)
  return { persistor, store }
}
