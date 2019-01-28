import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import { chainReducers } from 'Common/fun.js';

import mainReducer from './reducer.js'
import rootEpic from './epics.js'
import initialState from './initialState.js'


const rootReducer = chainReducers(initialState, [
    mainReducer,
]);

let store = createStore(
    rootReducer,
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(createEpicMiddleware(rootEpic)),
);

store.dispatch({type: 'INIT'});

export default store;

