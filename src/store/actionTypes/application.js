import { createActions } from 'redux-actions'

export default createActions({
  ADD_APPLICATIONS: applications => ({
    applications
  }),
  REQUEST_APPLICATIONS: () => ({})
});