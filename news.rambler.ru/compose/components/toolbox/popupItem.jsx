import React from 'react';
import Popup from 'common/popup/index';
// import classNames from 'classnames/bind';

export default class PopupItem extends Popup {
  constructor(props) {
    super(props);
    this.state = props;
    this.close = this.close.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.isOpen) {
      this.props.onClose();
    }
  }

  close() {
    this.setState({isOpen: false});
  }

  render() {
    let style = this.props.style;
    // let cn = classNames.bind(this.props.style);
    return (
      <div className={style.popup}>
        {this.props.children}
      </div>
    );
  }
}

