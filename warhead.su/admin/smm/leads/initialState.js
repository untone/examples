import { mondayAtMoscow, YYYYmmDD_MSK } from 'Common/dateUtils.js';
import { getDateFromURL } from 'Common/utils.js';

const currentDate = new Date();
const currentDateMonday = mondayAtMoscow(currentDate);

const initialDate = getDateFromURL({
    path: window.location.pathname,
    regex: /\/smm\/leads\/(\d{4})(\d{2})(\d{2})/
});

let initUrl = '/smm/leads.json';
let weekOffset = 0;

if (initialDate) {
    let initialDateMonday = mondayAtMoscow(initialDate);
    weekOffset = (initialDateMonday - currentDateMonday) / 7 / 24 / 60 / 60 / 1000;
    initUrl = `/smm/leads/${YYYYmmDD_MSK(initialDate)}.json`;
}

window.history.pushState(weekOffset, document.title, window.location.pathname);

export default {
    form_authenticity_token: form_authenticity_token,
    beingEdited: false,
    beingTouched: false,
    editPost: {},
    editLeadAlias: 'vk',
    error: null,
    notice: {
        message: null,
        active: false
    },
    initUrl,
    isFetchInProgress: false,
    initialMonday: currentDateMonday,
    posts: [],
    weekOffset
}
