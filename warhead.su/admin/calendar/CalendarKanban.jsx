import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import {DatePicker} from 'react-toolbox/lib/date_picker';

import { DragDropContext } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';

import { addMinutes, addHours, addDays, isPast, differenceInHours } from 'date-fns';
import ru from 'date-fns/locale/ru';

import { wrap } from 'Common/fun.js';

import { formatForCalendar, rangeForCalendar, utc2msk } from 'Common/dateUtils.js';

import Container from 'AdmComponents/dnd/Container.jsx';
import Slot from 'AdmComponents/dnd/Slot.jsx';
import Avatar from 'AdmCommon/Avatar.jsx';

/*TODO: vvv move to a separate file */

import { Card } from 'react-toolbox/lib/card';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import itemMenu from 'AdmCommon/itemMenu.module.scss';
import style from './calendar.module.scss'
import articleStyle from './articleCard.module.scss'
import calendarDatePicker from './datePicker.module.scss'

const actionNames = {
    view: "Просмотреть",
    edit: "Редактировать",
    to_hold: "В долгий ящик",
    to_removed: "Убрать с главной страницы",
    reset: "Сбросить редактирование"
}


const ArticleCard = wrap(
    connect(
        state => ({state}),
        dispatch => ({dispatch: {
            menuAction: id => value => dispatch({type: 'CARD_MENU_ACTION', id, value})
        }})
    ),
    props => {
        const padm = props.state.logged_user_tokens.find(token => token==='post_admin');
        const pe = props.state.logged_user_tokens.find(token => token==='post_enqueue');
        const edited_by_another =
            props.editing_user != null &&
            props.editing_user.id !== props.state.logged_user_id;

        var allowedActions = {}; //TODO: move to rights.js?

        if (padm && props.post_state === 'published') {
            /* allowedActions.to_removed = 'to_removed'; */
            // for the time being
            allowedActions.edit = 'edit';
            allowedActions.to_removed = 'to_removed';
            if (edited_by_another) { allowedActions.reset = 'reset_editing_padm'; }
        }

        if (pe && props.post_state !== 'published') {
            /* allowedActions.to_hold = 'to_hold'; */
            // for the time being
            if (props.post_state === 'in_queue') { allowedActions.edit = 'edit'; }
            if (edited_by_another) { allowedActions.reset = 'reset_editing_pe'; }
        }

        allowedActions.view = 'view';
        return <div className={articleStyle.container}>
            {props.connectDragSource(
                // so the overflow when hover won't work on dragged tile shadow, we'll just disable hover style when dragging
                <div className={props.isDragging ? articleStyle.card : `${articleStyle.card} ${articleStyle.cardNoDrag}`}>
                    <Card className={articleStyle.cardContent} style={{
                        backgroundColor: '#' + props.overlay_color,
                        animation: props.editing_user ? 'pulse 0.75s infinite alternate' : null
                    }}>
                        {props.is_from_partner && <svg className={articleStyle.cardPartner} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512' title='Партнерская статья'><path fill='currentColor' d='M245.712 287.809c80.296 0 138.288-50.323 138.288-128.803C384 81.125 326.009 32 245.712 32H108c-6.627 0-12 5.373-12 12v204H12c-6.627 0-12 5.373-12 12v16c0 6.627 5.373 12 12 12h84v58H12c-6.627 0-12 5.373-12 12v14c0 6.627 5.373 12 12 12h84v84c0 6.627 5.373 12 12 12h19.971c6.627 0 12-5.373 12-12v-84H308c6.627 0 12-5.373 12-12v-14c0-6.627-5.373-12-12-12H139.971v-58.191h105.741zM139.971 71.594h104.643c59.266 0 98.14 31.979 98.14 87.215 0 55.818-38.873 88.96-98.777 88.96H139.971V71.594z'/></svg>}
                        {props.for_yandex_news && <svg className={articleStyle.cardYandex} xmlns='http://www.w3.org/2000/svg' title='Статья для Яндекс.Новостей'>
                            <circle cx="9" cy="9" r="9" fill="red"/>
                            <path d="M10.187 10.465V15H11.5V3H9.54C7.614 3 5.994 4.247 5.994 6.796c0 1.817.716 2.802 1.79 3.345L5.5 15h1.517l2.08-4.536h1.09zm.003-1.059H9.49c-1.142 0-2.08-.628-2.08-2.582 0-2.021 1.024-2.717 2.08-2.717h.699v5.3z" fill="#fff"/>
                            </svg>}
                        <div className={articleStyle.cardTitle}>
                            <span className={articleStyle.cardTitleContent}>
                                {props.title}
                            </span>
                        </div>
                    </Card>
                </div>
            )}
            {props.editing_user &&
                <div className={articleStyle.cardEditedBy}>
                    {props.editing_user.id !== props.state.logged_user_id && <Avatar img={props.editing_user.avatar} small={true} />}
                </div>
            }
            <div className={articleStyle.cardMenu}>
                <IconMenu icon={<span className={articleStyle.cardIcon}>⋮</span>} position="auto" menuRipple theme={itemMenu} onSelect={props.dispatch.menuAction(props.id)}>
                    {Object.keys(allowedActions)
                        .map(actionId =>
                            <MenuItem caption={actionNames[actionId]} value={allowedActions[actionId]} key={actionId} />
                        )
                    }
                </IconMenu>
            </div>
        </div>
    }
);

/*TODO: ^^^ move to a separate file */

export default wrap(
    DragDropContext(MultiBackend(HTML5toTouch)),
    connect(
        state => state,
        dispatch => ({dispatch: {
            increaseWeek: () => dispatch({type: 'FORM_INCREASE_WEEK'}),
            decreaseWeek: () => dispatch({type: 'FORM_DECREASE_WEEK'}),
            calendarWeek: value => dispatch({type: 'FORM_CALENDAR_WEEK', value}),
        }})
    ),
    class CalendarKanban extends Component {
        state = {
            basketHeight: 80
        };

        componentDidMount() {
            this.handleBasketHeight();
        };

        componentWillReceiveProps(nextProps) {
            if (nextProps.cards.length !== this.props.cards.length || this.getReadyCards(nextProps.cards).length !== this.getReadyCards(this.props.cards).length) {
                this.handleBasketHeight();
            }
        };

        getReadyCards = (cards) => Object.values(cards).filter(_ => _.post_state === 'ready_to_queue');

        handleBasketHeight = () => {
            setTimeout(() => {
                const node = findDOMNode(this.basket);
                this.setState({basketHeight: node.getBoundingClientRect().height});
            }, 50);
        };

        render() {
            const now = new Date();
            /*TODO: refactor with a sane datetime library*/
            const allCards = Object.values(this.props.cards);
            const cards = allCards
                .filter(card => card.post_state === 'ready_to_queue')
                .sort((a, b) => b.updated_at - a.updated_at);

            const hours = [...Array(13).keys()].map(i => i + 8);

            const findCard = dateTime => {
                return allCards.find(card => {
                    let cardPublishAt = new Date(card.publish_at);
                    let cardPublishedAt = new Date(card.published_at);
                    let value =
                        (cardPublishAt >= dateTime &&
                        cardPublishAt < addHours(dateTime, 1) &&
                        card.post_state === 'in_queue') ||
                        (cardPublishedAt >= dateTime &&
                        cardPublishedAt < addHours(dateTime, 1) &&
                        card.post_state === 'published');
                    return value;
                });
            }

            const currentMonday = formatForCalendar(this.props.initialMonday, this.props.weekOffset);
            const calendarRows = [0, 1, 2, 3, 4, 5, 6];
            return <div className={style.row}>
                <div className={style.basket} ref={elem => this.basket = elem}>
                    <Container
                        className={style.basketContainer}
                        cardClass={style.basketCard}
                        id='ready_to_queue'
                        cardType={ArticleCard}
                        cards={cards}/>
                </div>
                <div className={style.calendar} style={{paddingTop: `${this.state.basketHeight}px`}}>
                    <div className={style.calendarWrap}>
                        <div className={style.calendarDate}>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 50 50'
                                className={style.calendarDateNav}
                                onClick={this.props.dispatch.decreaseWeek}>
                                <path d='M27.216 18.5L25.76 17 18 25l7.76 8 1.456-1.5L20.91 25l6.306-6.5z' fill='#c4c4c4'/>
                            </svg>
                            <DatePicker
                                className={style.calendarDatePicker}
                                autoOk
                                cancelLabel='Отмена'
                                locale='ru'
                                onChange={this.props.dispatch.calendarWeek}
                                inputFormat={() => rangeForCalendar(currentMonday)}
                                theme={calendarDatePicker}
                                value={currentMonday}
                                sundayFirstDayOfWeek={false}
                            />
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 50 50'
                                className={style.calendarDateNav}
                                onClick={this.props.dispatch.increaseWeek}>
                                <path d='M20 31.5l1.455 1.5 7.76-8-7.76-8L20 18.5l6.305 6.5L20 31.5z' fill='#c4c4c4'/>
                            </svg>
                        </div>
                        <div className={style.calendarContainer}>
                            {/* <div className={style.calendarHours}>
                                {hours.map(hour => <div key={hour.toString()} className={style.calendarHour}>
                                    {hour}:15
                                </div>)}
                            </div> */}

                            {calendarRows
                                .map(days => addDays(this.props.initialMonday, days))
                                .map(date => new Date(date.getTime() + this.props.weekOffset * 1000 * 60 * 60 * 24 * 7))
                                // addWeeks seems to be buggy, despite https://github.com/date-fns/date-fns/issues/465
                                .map((date, index) => {
                                    return <div
                                            key={date.toString()}
                                            className={style.calendarColumn}>
                                            <div className={style.calendarHeader}>
                                                {utc2msk(date).getUTCDate()} {['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][utc2msk(date).getUTCMonth()]}
                                                <b>{['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][utc2msk(date).getUTCDay()]}</b>
                                            </div>
                                            {hours.map(hrs => addHours(date, hrs)).map((dateTime, idx) => {
                                                const pastIndex = isPast(dateTime);
                                                return (
                                                    <div
                                                        key={dateTime.toString()}
                                                        className={`${style.calendarCell} ${pastIndex ? style.calendarCellPast : ''}`}
                                                        data-hour={index === 0 ? `${hours[idx]}:15` : null}>
                                                        <Slot
                                                            id={{type:'slot', dateTime}}
                                                            card={findCard(dateTime)}
                                                            cardType={ArticleCard}
                                                            className={style.calendarSlot}
                                                            cardClass={style.calendarCard}
                                                            canDrop={addMinutes(dateTime, 15) > now}
                                                            canDragP={props => props.post_state !== 'published'
                                                                && new Date(props.publish_at) > now
                                                                && props.editing_user == null
                                                            }/>
                                                    </div>
                                                );
                                            })}
                                        </div>;
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    }
);
