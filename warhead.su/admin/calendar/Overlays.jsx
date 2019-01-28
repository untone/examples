import React from 'react';
import { connect } from 'react-redux';
import { wrap } from 'Common/fun.js';
import Snackbar from 'react-toolbox/lib/snackbar';
import Dialog from 'react-toolbox/lib/dialog';
import ArticlePreviewDialog from 'AdmComponents/common/articlePreview/ArticlePreviewDialog.jsx';

export default wrap(
    connect(
        state => state,
        dispatch => ({dispatch: {
            clearError: () => dispatch({type: 'CLEAR_ERROR'}),
        }})
    ),

    props => <div>
        {props.articlePreview !== null &&
        <ArticlePreviewDialog/>}
        <Snackbar label={props.error ? props.error.message : ''} action="OK" type='warning' active={props.error !== null} onClick={props.dispatch.clearError} />
    </div>
);
