import initialState from './initialState.js'
import update from "immutability-helper";
import { mondayAtMoscow } from 'Common/dateUtils.js';
import typograf from 'AdmCommon/typograf.js';
import {deepClone} from "Common/utils.js";

const mainReducer = (state, action) => {

    switch(action.type) {
        case 'LOAD_PROGRESS':
            return update(state, {
                isFetchInProgress: {$set: true},
            });

        case 'LOAD_PROGRESS_DONE':
            return update(state, {
                isFetchInProgress: {$set: false},
            });

        case 'INIT_SUCCESS':
            return update(state, {
                error: {$set: null},
                posts: {$set: action.json},
            });

        case 'INIT_FAILED':
            return update(state, {
                error: {$set: {message: action.error}},
            });

        case 'CLEAR_ERROR':
            return update(state, {error: {$set: null}});

        case 'CLEAR_SUCCESS':
            return update(state, {
                notice: {
                    active: {$set: false},
                    meesage: {$set: null}
                }
            });

        case 'DECREASE_WEEK':
            return update(state, {
                weekOffset: {$set: state.weekOffset - 1},
            });

        case 'INCREASE_WEEK':
            return update(state, {
                weekOffset: {$set: state.weekOffset + 1},
            });
            return state;

        case 'CALENDAR_WEEK':
            let currentMonday = new Date(state.initialMonday.getTime() + state.weekOffset * 1000 * 60 * 60 * 24 * 7);
            let calendarMonday = mondayAtMoscow(action.value);
            let weekOffset = (calendarMonday - currentMonday) / 7 / 24 / 60 / 60 / 1000;
            return update(state, {
                weekOffset: {$set: state.weekOffset + weekOffset},
            });

        case 'CARD_EDIT':
            const editPost = state.posts.filter(item => item.id === action.id);
            return update(state, {
                beingEdited: {$set: true},
                editPost: {$set: deepClone(editPost[0])},
            });

        case 'CARD_CLOSE':
            return update(state, {
                beingEdited: {$set: false},
                beingTouched: {$set: false},
                editPost: {$set: {}},
                editLeadAlias: {$set: initialState.editLeadAlias}
            });

        case 'CARD_SAVE':
            const {smm_leads} = state.editPost;
            for (let item in smm_leads) {
                smm_leads[item].text = typograf.execute(smm_leads[item].text);
            };
            return update(state, {
                editPost: {
                    smm_leads: {$set: smm_leads}
                },
            })

        case 'LEAD_SELECT':
            return update(state, {
                editLeadAlias: {$set: action.alias}
            });

        case 'LEAD_INPUT':
            return update(state, {
                beingTouched: {$set: true},
                editPost: {
                    smm_leads: {
                        [state.editLeadAlias]: {
                            text: {$set: action.value},
                            changed: {$set: true}
                        }
                    }
                },
            });

        case 'SAVE_POST_STARTED':
            return update(state, {
                isFetchInProgress: {$set: true},
                notice: {
                    active: {$set: true},
                    success: {$set: false},
                    message: {$set: 'Сохраняем лид...'}
                }
            });

        case 'SAVE_POST_SUCCESS':
            const savedPost = state.editPost;
            const post = state.posts.filter(entry => entry.id === savedPost.id)[0];
            const index = state.posts.indexOf(post);
            return update(state, {
                beingEdited: {$set: false},
                beingTouched: {$set: false},
                isFetchInProgress: {$set: false},
                notice: {
                    active: {$set: true},
                    success: {$set: true},
                    message: {$set: 'Лиды успешно сохранены'}
                },
                editPost: {$set: {}},
                posts: {
                    [index]: {$set: savedPost}
                },
            });

        case 'SAVE_POST_FAILED':
            return update(state, {
                error: {$set: {message: action.error}},
                isFetchInProgress: {$set: false},
            });

        default:
            return state;
    }
};

export default mainReducer
