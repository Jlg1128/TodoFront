import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import Reducers from './reducers';

const middlewares: never[] = [];

export const store = createStore(
  combineReducers({ ...Reducers }),
  process.env.NODE_ENV === 'production'
  ? applyMiddleware(...middlewares)
  : composeWithDevTools(applyMiddleware(...middlewares)),
  );