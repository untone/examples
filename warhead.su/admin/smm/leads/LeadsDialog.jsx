import React, { Component } from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';

import { connect } from 'react-redux';
import { wrap } from 'Common/fun.js';
import { HH_MM_MSK } from 'Common/dateUtils.js';

import Copy from 'AdmCommon/copy.jsx';

import FavIcon from 'AdmCommon/FavIcon.jsx';
import titles from './titles.js';

import style from './leads.module.scss';
import dialogTheme from './dialogTheme.module.scss';
import inputTheme from 'AdmCommon/inputTheme.module.scss';

const host = window.location.hostname.replace('adm.', '')

const picAbbr = abbr => (abbr === 'tele') ? 'fb' : abbr;

export default wrap(
    connect(
        state => state,
        dispatch => ({dispatch: {
            cardClose: () => dispatch({type: 'CARD_CLOSE'}),
            cardSave: () => dispatch({type: 'CARD_SAVE'}),
            leadSelect: alias => dispatch({type: 'LEAD_SELECT', alias}),
            leadInput: value => dispatch({type: 'LEAD_INPUT', value})
        }})
    ),
    class LeadsDialog extends Component {

        render() {
            const {beingEdited, beingTouched, dispatch, editPost, editLeadAlias, isFetchInProgress} = this.props;
            const {id, smm_leads, publish_at, published_at, state} = editPost;
            const date = state === 'published' ? published_at : publish_at;
            const articleURL = `//${host}/p/${id}`;
            const shareURL = `https:${articleURL}/${titles[editLeadAlias].path}`;
            const saveDisabled = Object.values(smm_leads).filter(item => item.text.length === 0).length > 0;

            return (
                <Dialog
                    active={beingEdited}
                    onEscKeyDown={dispatch.cardClose}
                    onOverlayClick={dispatch.cardClose}
                    actions={
                        beingTouched ? [
                                {
                                    label: 'Отменить',
                                    onClick: dispatch.cardClose,
                                    disabled: isFetchInProgress},
                                {
                                    label: 'Сохранить',
                                    onClick: dispatch.cardSave,
                                    disabled: isFetchInProgress || saveDisabled
                                }
                            ] : [
                                {label: 'Закрыть', onClick: dispatch.cardClose}
                            ]
                    }
                    theme={dialogTheme}>
                    <div className={style.dialogTitle}>
                        <div className={style.dialogDate}>
                            {HH_MM_MSK(new Date(date))}
                        </div>
                        <a href={articleURL} className={style.dialogLink} target='_blank'>
                            {editPost.title}
                        </a>
                    </div>
                    <div className={style.dialogTags}>
                        {editPost.tags}
                    </div>
                    <div className={style.dialogLead}>
                        {editPost.lead}
                    </div>
                    <div className={style.dialogTabs}>
                        {['vk', 'fb', 'ok', 'tw', 'smi2', 'da', 'tele'].map((key, index) => {
                            const activeClass = editLeadAlias === key ? style.dialogTabsItemActive : '';
                            const emptyClass = smm_leads[key].text.length === 0 ? style.dialogTabsItemEmpty : '';
                            return (
                                <button
                                    key={index}
                                    className={`${style.dialogTabsItem} ${activeClass} ${emptyClass}`}
                                    onClick={event => dispatch.leadSelect(key)}>
                                    <span className={style.dialogTabsItemText}>{titles[key].alias}</span>
                                    <FavIcon name={key} className={`${style.dialogTabsBadge} ${smm_leads[key].changed ? style.dialogTabsBadgeActive : ''}`} title={titles[key].alias}/>
                                </button>
                            );
                        })}
                    </div>
                    <div className={style.dialogForm}>
                        <div className={style.dialogFormRow}>
                            <div className={style.dialogFormLabel}>
                                Адрес страницы
                            </div>
                            <a href={shareURL} className={style.dialogFormValu} target='_blank'>
                                {shareURL}
                            </a>
                        </div>
                        <div className={style.dialogFormRow}>
                            <div className={style.dialogFormLabel}>
                                Обложка
                            </div>
                            <img
                                className={style.dialogFormImage}
                                src={`//${host}/system/og/${editPost.id}.${picAbbr(editLeadAlias)}.png`}/>
                        </div>
                        <div className={style.dialogFormRow}>
                            <div className={style.dialogFormLabel}>
                                Текст снипета
                            </div>
                            <Copy text={smm_leads[editLeadAlias].text}/>
                            <Input
                                maxLength={titles[editLeadAlias].limit}
                                multiline={true}
                                rows={8}
                                onChange={dispatch.leadInput}
                                disabled={isFetchInProgress}
                                value={smm_leads[editLeadAlias].text}
                                theme={inputTheme}/>
                        </div>
                    </div>
                </Dialog>
            );
        }
    }
);
