import { combineEpics } from "redux-observable";
import { api } from "Common/utils.js";
import { YYYYmmDD_MSK, formatForCalendar } from 'Common/dateUtils.js';
import 'rxjs';
import { Observable } from "rxjs/Observable";

const rootEpic = combineEpics(
    (action$, store) => action$.ofType('INIT').mergeMap(action => {
        const state = store.getState();
        const {initUrl} = state;
        const body = {};
        return api({
            state, action,
            url: initUrl,
            method: 'get',
            body,
            actionTypePrefix: 'INIT'
        });
    }),

    (action$, store) => action$.filter(action =>
        action.type === 'INCREASE_WEEK' ||
        action.type === 'DECREASE_WEEK' ||
        action.type === 'CALENDAR_WEEK')
        .mapTo({type: 'INIT_NEW_WEEK'}),

    (action$, store) => action$.ofType('INIT_NEW_WEEK').mergeMap(action => {
        const state = store.getState();
        const {initialMonday, initUrl, weekOffset} = state;
        const newMonday = formatForCalendar(initialMonday, weekOffset);
        const url = `/smm/leads${weekOffset ? '/' + YYYYmmDD_MSK(newMonday) : ''}`;
        const body = {};
        window.history.pushState(weekOffset, document.title, url);
        return Observable.of({type: 'LOAD_PROGRESS', inResponseTo: action}).merge(api({
            state, action,
            url: `${url}.json`,
            method: 'get',
            body,
            actionTypePrefix: 'INIT'
        }));
    }),

    (action$, store) => action$.ofType('CARD_SAVE').mapTo({type: 'SAVE_LEAD_INIT'}),

    (action$, store) => action$.ofType('LOAD_PROGRESS').mapTo({type: 'LOAD_PROGRESS_DONE'}),

    (action$, store) => action$.ofType('SAVE_LEAD_INIT').mergeMap(action => {
        const state = store.getState();
        const {editPost: {id, smm_leads}} = state;
        const body = {};
        Object.keys(smm_leads).map(key => body[key] = smm_leads[key].text);
        return Observable.of({type: 'SAVE_POST_STARTED', inResponseTo: action}).merge(api({
            state, action,
            url: `/smm/lead/${id}/save/`,
            method: 'patch',
            body: body,
            actionTypePrefix: 'SAVE_POST'
        }));
    })
);

export default rootEpic;
