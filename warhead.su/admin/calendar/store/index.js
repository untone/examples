import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { mondayAtMoscow, YYYYmmDD_MSK } from 'Common/dateUtils.js';
import { api, handleHTTPErrors, getDateFromURL } from 'Common/utils.js';
import { commonInitialState, commonKanbanReducer, commonKanbanEpic } from 'AdmCommon/commonKanbanStore';
import { chainReducers } from 'Common/fun.js';

import calendarReducer from './reducer';
import calendarEpics from './epics';

import articlePreviewReducer from 'AdmComponents/common/articlePreview/reducer.js';
import articlePreviewInitialState from 'AdmComponents/common/articlePreview/initialState.js';

const currentDate = new Date();
const currentDateMonday = mondayAtMoscow(currentDate);

const initialDate = getDateFromURL({
    path: window.location.pathname,
    regex: /\/calendar\/(\d{4})(\d{2})(\d{2})/
});

let initUrl = '/calendar.json';
let weekOffset = 0;

if (initialDate) {
    let initialDateMonday = mondayAtMoscow(initialDate);
    weekOffset = (initialDateMonday - currentDateMonday) / 7 / 24 / 60 / 60 / 1000;
    const initialWednesday = new Date(initialDateMonday.getTime() + 3 * 24 * 60 * 60 * 1000);
    initUrl =  `/calendar/${YYYYmmDD_MSK(initialWednesday)}.json`;
}

window.history.replaceState(weekOffset, document.title, window.location.pathname);

const initialState = Object.assign({}, commonInitialState, {
    initUrl,
    initialMonday: currentDateMonday,
    weekOffset
    /*TODO: refactor all names to camelCase,
    except for field names in data directly received from backend*/
}, articlePreviewInitialState);


// handles pure effects of actions on the stored state
const rootReducer = chainReducers(initialState, [
    commonKanbanReducer,
    calendarReducer,
    articlePreviewReducer
]);

// handles side effects of actions not captured by the stored state,
// including asynchronousity
const rootEpic = combineEpics(
    commonKanbanEpic,
    ...Object.values(calendarEpics)
);

let store = createStore(
    rootReducer,
    applyMiddleware(createEpicMiddleware(rootEpic))
);
store.dispatch({type: 'INIT'});
window.addEventListener('popstate', event => store.dispatch({type: 'POPSTATE', state: event.state}));

export default store;
