import update from 'immutability-helper';
import { addMinutes } from 'date-fns';

import { mondayAtMoscow } from 'Common/dateUtils.js';

import actionTypes from 'AdmComponents/kanban/actionTypes.js';
import dndActionTypes from 'AdmComponents/dnd/actionTypes.js';

const calendarReducer = (state = initialState, action) => {
    switch(action.type) {

        //TODO: DRY w/kanban
        case dndActionTypes.STATE_CHANGE_SUCCESS:
            return update(state, {
                cards: {
                    [action.inResponseTo.dragItem.id]: {$unset: ['previousState']}
                }
            });

        case dndActionTypes.MOVE_CARD_TO_SLOT:
        case dndActionTypes.MOVE_CARD_TO_ANOTHER_CONTAINER:
            const stateId = containerId => containerId === 'ready_to_queue' ? 'ready_to_queue' : 'in_queue';

            if (action.dropContainerId === 'ready_to_queue') {
                return update(state, {
                    cards: {[action.dragItem.id]: {
                        post_state: {$set: action.dropContainerId},
                        previousState: {$set: state.cards[action.dragItem.id]}
                    }}
                });
            } else {
                return update(state, {
                    cards: {[action.dragItem.id]: {
                        post_state: {$set: 'in_queue'},
                        publish_at: {$set: addMinutes(action.dropContainerId.dateTime.toISOString(), 15)}, //will set to UTC tz
                        slug_url: {$set: `http://${window.location.hostname.replace(/^[\w]+./, '')}/p/${action.dragItem.id}`}, // using shortlink as a temporary workaround, otherwise view article wouldn't work right after queueing
                        previousState: {$set: state.cards[action.dragItem.id]}
                    }}
                });
            }

        case actionTypes.STATE_CHANGE_FAILED:
            return update(state, {
                error: {$set: {message: action.error}},
                cards: {[action.inResponseTo.dragItem.id]:
                    {$set: state.cards[action.inResponseTo.dragItem.id].previousState}
                }
            });

        case actionTypes.STATE_CHANGE_FORBIDDEN:
            return update(state, {
                error: {$set: "Недопустимое изменение состояния статьи"},
                cards: {[action.inResponseTo.dragItem.id]:
                    {$set: state.cards[action.inResponseTo.dragItem.id].previousState}
                }
            });

        case 'FORM_INCREASE_WEEK': return update(state, {weekOffset: {$set: state.weekOffset + 1}});
        case 'FORM_DECREASE_WEEK': return update(state, {weekOffset: {$set: state.weekOffset - 1}});
        case 'FORM_CALENDAR_WEEK':
            let currentMonday = new Date(state.initialMonday.getTime() + state.weekOffset * 1000 * 60 * 60 * 24 * 7);
            let calendarMonday = mondayAtMoscow(action.value);
            let weekOffset = (calendarMonday - currentMonday) / 7 / 24 / 60 / 60 / 1000;
            return update(state, {weekOffset: {$set: state.weekOffset + weekOffset}});
        case 'POPSTATE': return update(state, {weekOffset: {$set: action.state}});

        case 'INIT_NEW_WEEK_SUCCESS':
            return update(state, {
                last_event: {$set: action.json.last_event},
                max_event_id: {$set: action.json.max_event_id},
                cards: action.json.posts.reduce(
                    (acc, cur) => (acc[cur.id || cur.post.id] = {$set: cur}, acc),
                {}),
            });

        case 'MENU_ACTION_SUCCESS':
            switch (action.inResponseTo.value) {
                case 'to_removed':
                case 'to_hold':
                    return update(state, {cards: {$unset: [action.inResponseTo.id]}});
                case 'reset_editing_pa':
                case 'reset_editing_pe':
                case 'reset_editing_padm':
                    return update(state, {cards: {[action.inResponseTo.id] :{editing_user: {$set: null}}}});
                default:
                    return state;
            }

        default:
            return state;
    }
};

export default calendarReducer;
