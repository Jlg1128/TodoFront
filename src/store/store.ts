import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import Reducers from './reducers';

const logger = createLogger();

const middlewares: never[] = [];

export const store = createStore(
  combineReducers({ ...Reducers }),
  process.env.NODE_ENV === 'production'
  ? applyMiddleware(...middlewares)
  : composeWithDevTools(applyMiddleware(...middlewares)),
  );