import React from 'react';
import classNames from 'classnames/bind';

import style from './index.styl';

const cn = classNames.bind(style);

export default class Footer extends React.Component {
  static propTypes = {
    context: React.PropTypes.string,
    article: React.PropTypes.object,
    onSave: React.PropTypes.func,
    onReset: React.PropTypes.func
  };

  handleSave(event) {
    this.props.onSave(event);
  }

  render() {
    let {article} = this.props;
    let active = article.title.length > 0
        && article.text.length > 0
        && article.resource_id > 0
        && article.url.length > 0;
    let footerClassName = cn({
      footer: true,
      footer_active: active
    });

    return (
      <div className={footerClassName}>
        <button
          className={classNames(style.footer__button, style.footer__button_save)}
          onClick={this.props.onSave.bind(null, false)}>
          {'Сохранить'}
        </button>
        {this.props.context === 'item'
          ? <button
              className={classNames(style.footer__button, style.footer__button_clusterize)}
              onClick={this.props.onSave.bind(null, true)}>
              {'Создать кластер'}
            </button>
          : null
        }
        <button
          className={classNames(style.footer__button, style.footer__button_cancel)}
          onClick={this.props.onReset}>
          {'Сбросить изменения'}
        </button>
      </div>
    );
  }
}
