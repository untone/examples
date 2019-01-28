import React, { Component } from 'react';
import { connect } from "react-redux";
import { wrap } from "Common/fun.js";

import titles from './titles.js';

import style from './leads.module.scss';
import articleStyle from 'AdmComponents/calendar/articleCard.module.scss'

import FavIcon from 'AdmCommon/FavIcon.jsx';

export default wrap(
    connect(
        state => ({state}),
        dispatch => ({dispatch: {
            edit: id => value => dispatch({type: 'CARD_EDIT', id})
        }})
    ),
    props => {
        const {card: {overlay, smm_leads, id, title}, dispatch, state} = props;
        const badge = Object.keys(smm_leads).map((key, index) => {
            if (smm_leads[key].changed) {
                return <FavIcon key={index} name={key} className={style.calendarCardBadge} title={titles[key].alias}/>;
            }
            return null;
        });
        const activeClass = state.editPost.id === id ? style.calendarCardActive : '';
        return (
            <div className={`${articleStyle.container} ${style.calendarCardTheme}`} onClick={dispatch.edit(id)}>
                <div className={articleStyle.card}>
                    <div className={style.calendarCardBadges}>
                        {badge}
                    </div>
                    <div className={`${articleStyle.cardContent} ${activeClass}`} style={{backgroundColor: `#${overlay}`, cursor: 'pointer'}}>
                        <div className={`${articleStyle.cardTitle} ${style.calendarCardTitle}`}>
                            <span className={articleStyle.cardTitleContent}>
                                {title}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
