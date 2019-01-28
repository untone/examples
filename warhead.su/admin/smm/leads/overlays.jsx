import React from 'react';
import { connect } from 'react-redux';
import { wrap } from 'Common/fun.js';
import Snackbar from 'react-toolbox/lib/snackbar';

export default wrap(
    connect(
        state => state,
        dispatch => ({dispatch: {
            clearError: () => dispatch({type: 'CLEAR_ERROR'}),
            clearSuccess: () => dispatch({type: 'CLEAR_SUCCESS'}),
        }})
    ),

    props => <div>
        <Snackbar
            label={props.notice.message}
            action='Nice'
            timeout={1500}
            onTimeout={props.dispatch.clearSuccess}
            active={props.notice.active}/>
        <Snackbar
            label={props.error ? props.error.message : ''}
            timeout={1500}
            onTimeout={props.dispatch.clearError}
            type='warning'
            active={props.error !== null}/>
    </div>
);
