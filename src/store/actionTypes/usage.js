import { createActions } from 'redux-actions'

export default createActions({
  ADD_USAGE: packageName => ({
    packageName,
    date: new Date()
  })
});