import 'rxjs';
import { Observable } from 'rxjs/Observable';
import { format, addWeeks, addMinutes } from 'date-fns';

import { api, handleHTTPErrors } from 'Common/utils.js';

import actionTypes from 'AdmComponents/kanban/actionTypes.js';
import dndActionTypes from 'AdmComponents/dnd/actionTypes.js';
import { YYYYmmDD_MSK } from 'Common/dateUtils.js';

export default {
    stateChange: (action$, store) => action$.filter(action =>
        action.type === dndActionTypes.MOVE_CARD_TO_SLOT ||
        action.type === dndActionTypes.MOVE_CARD_TO_ANOTHER_CONTAINER).mergeMap(action => {
        let state = store.getState();
        if (!state.logged_user_tokens.find(token => token === 'post_enqueue')) {
            return Observable.of({type: actionTypes.STATE_CHANGE_FORBIDDEN, inResponseTo: action});
        }
        const id = action.dragItem.id;
        const from = action.dragItem.containerId;
        const to = action.dropContainerId;

        var body = {};

        var method = null;
        if (action.type === dndActionTypes.MOVE_CARD_TO_SLOT) {
            method = 'to_queue';
            body['publish_at'] = addMinutes(to.dateTime, 15).toISOString();
        } else {
            method = 'to_ready_to_queue';
        }

        return api({
            state, action,
            url: `/posts/${id}/${method}.json`,
            method: 'post',
            body,
            actionTypePrefix: 'STATE_CHANGE'
        });
    }),

    //TODO: check if the week is already loaded
    formIncreaseWeek: $action => $action.ofType('FORM_INCREASE_WEEK').mapTo({type: 'INIT_NEW_WEEK'}),
    formDecreaseWeek: $action => $action.ofType('FORM_DECREASE_WEEK').mapTo({type: 'INIT_NEW_WEEK'}),
    formCalendarWeek: $action => $action.ofType('FORM_CALENDAR_WEEK').mapTo({type: 'INIT_NEW_WEEK'}),

    initNewWeek: (action$, store) => action$.ofType('INIT_NEW_WEEK').mergeMap(action => {
        const state = store.getState();
        const initialMonday = new Date(state.initialMonday.getTime() + state.weekOffset * 7 * 24 * 60 * 60 * 1000);
        //addWeeks(state.initialMonday, state.weekOffset);

        //quickhax
        //TODO: rewrite in some sane way
        const initialWednesday = new Date(initialMonday.getTime() + 3 * 24 * 60 * 60 * 1000);

        window.history.pushState(state.weekOffset, document.title, '/calendar/' + YYYYmmDD_MSK(initialMonday));

        return api({
            state, action,
            url: `/calendar/${format(initialWednesday, 'YYYYMMDD')}.json`,
            method: 'get',
            actionTypePrefix: 'INIT_NEW_WEEK'
        });
    }),

    cardMenuAction: (action$, store) => action$.ofType('CARD_MENU_ACTION').mergeMap(action => {
        const state = store.getState();
        switch (action.value) {
            case 'edit':
                window.location.href = `/posts/${action.id}`;
                return Observable.of({type: 'MENU_ACTION_REDIRECT_CHECKED', inResponseTo: action}); //should not be called?
            case 'to_removed':
            case 'to_hold':
                return window.confirm("Действительно убрать статью?")
                    ? api({
                        state, action,
                        url: `/posts/${action.id}/${action.value}.json`,
                        method: 'post',
                        actionTypePrefix: 'MENU_ACTION'
                    })
                    : Observable.of({type: 'DUMMY'});

            case 'reset_editing_pa':
            case 'reset_editing_pe':
            case 'reset_editing_padm':
                return api({
                    state, action,
                    url: `/posts/${action.id}/${action.value}.json`,
                    method: 'post',
                    actionTypePrefix: 'MENU_ACTION'
                });
            case 'view':
                var article = state.cards[action.id];
                if (article.post_state === 'published' || article.post_state === 'in_queue') {
                    window.open(article.slug_url.replace(/^https/, 'http'));
                } else {
                    window.open(`/posts/${action.id}/view`);
                }
                return Observable.empty(); //of({type: 'MENU_ACTION_COMPLETE', inResponseTo: action})
            default: return Observable.of({type: 'MENU_ACTION_INVALID', inResponseTo: action});
        }
    })
}
