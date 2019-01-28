import React, { Component } from 'react';
import { connect } from "react-redux";
import { DatePicker } from 'react-toolbox/lib/date_picker';
import { Snackbar } from 'react-toolbox/lib/snackbar';

import LeadsDialog from './LeadsDialog.jsx';
import LeadsCard from './LeadsCard.jsx';

import { addHours, addDays, isPast } from 'date-fns';
import ru from 'date-fns/locale/ru';

import { wrap } from "Common/fun.js";

import { formatForCalendar, rangeForCalendar, utc2msk} from 'Common/dateUtils.js';

import style from './leads.module.scss';
import calendarDatePicker from 'AdmComponents/calendar/datePicker.module.scss';

export default wrap(
    connect(
        state => ({state}),
        dispatch => ({dispatch: {
            increaseWeek: () => dispatch({type: 'INCREASE_WEEK'}),
            decreaseWeek: () => dispatch({type: 'DECREASE_WEEK'}),
            calendarWeek: value => dispatch({type: 'CALENDAR_WEEK', value}),
        }})
    ),
    class LeadsCalendar extends Component {
        render () {
            const {dispatch, state} = this.props;
            const {beingEdited, initialMonday, posts, weekOffset} = state;

            const hours = [...Array(13).keys()].map(i => i + 8);

            const findCard = dateTime => {
                return posts.find(card => {
                    let cardPublishAt = new Date(card.publish_at);
                    let cardPublishedAt = new Date(card.published_at);
                    let value =
                        (cardPublishAt >= dateTime &&
                        cardPublishAt < addHours(dateTime, 1) &&
                        card.state === 'in_queue') ||
                        (cardPublishedAt >= dateTime &&
                        cardPublishedAt < addHours(dateTime, 1) &&
                        card.state === 'published');
                    return value;
                });
            }

            const currentMonday = formatForCalendar(initialMonday, weekOffset);

            return (
                <div className={style.row}>
                    <div className={style.calendar}>
                        <div className={style.calendarWrap}>
                            <div className={style.calendarDate}>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    viewBox='0 0 50 50'
                                    className={style.calendarDateNav}
                                    onClick={dispatch.decreaseWeek}>
                                    <path d='M27.216 18.5L25.76 17 18 25l7.76 8 1.456-1.5L20.91 25l6.306-6.5z' fill='#c4c4c4'/>
                                </svg>
                                <DatePicker
                                    className={style.calendarDatePicker}
                                    autoOk
                                    cancelLabel='Отмена'
                                    locale='ru'
                                    onChange={dispatch.calendarWeek}
                                    // maxDate={utc2msk(new Date(initialMonday.getTime() + 6 * 24 * 60 * 60 * 1000))}
                                    inputFormat={() => rangeForCalendar(currentMonday)}
                                    theme={calendarDatePicker}
                                    value={currentMonday}
                                    sundayFirstDayOfWeek={false}
                                />
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    viewBox='0 0 50 50'
                                    className={style.calendarDateNav}
                                    onClick={dispatch.increaseWeek}>
                                    <path d='M20 31.5l1.455 1.5 7.76-8-7.76-8L20 18.5l6.305 6.5L20 31.5z' fill='#c4c4c4'/>
                                </svg>
                            </div>
                            <div className={style.calendarContainer}>
                                <div className={style.calendarHours}>
                                    {hours.map(hour => <div key={hour.toString()} className={style.calendarHour}>
                                        {hour}:15
                                    </div>)}
                                </div>

                                {[0, 1, 2, 3, 4, 5, 6]
                                    .map(days => addDays(initialMonday, days))
                                    .map(date => new Date(date.getTime() + weekOffset * 1000 * 60 * 60 * 24 * 7))
                                    .map(date => {
                                        return (
                                            <div key={date.toString()} className={style.calendarColumn}>
                                                <div className={style.calendarHeader}>
                                                    {utc2msk(date).getUTCDate()} {['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][utc2msk(date).getUTCMonth()]}
                                                    <b>{['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][utc2msk(date).getUTCDay()]}</b>
                                                </div>
                                                {hours.map(hrs => addHours(date, hrs)).map(dateTime => {
                                                    const pastIndex = isPast(dateTime);
                                                    const card = findCard(dateTime);
                                                    // console.log('card', card);
                                                    return (
                                                        <div key={dateTime.toString()}
                                                            className={`${style.calendarCell} ${pastIndex ? style.calendarCellPast : ''}`}>
                                                            <div className={style.calendarSlot}>
                                                                <div className={style.calendarCard}>
                                                                    {card !== undefined && <LeadsCard card={card}/>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    {beingEdited && <LeadsDialog/>}
                </div>
            );
        }
    }
);
