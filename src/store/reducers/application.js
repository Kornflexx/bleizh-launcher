import { handleActions } from 'redux-actions'
import actions from '../actionTypes/application'

const initialState = {
  items: []
}

export default handleActions(
  {
    [actions.addApplications]: (state, action) => {
      const { applications } = action.payload
      return {
        ...state,
        items: applications
      }
    }
  },
  initialState
);
