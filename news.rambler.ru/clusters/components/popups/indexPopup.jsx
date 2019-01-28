import React from 'react';
import moment from 'moment';
import locale from 'moment/locale/ru';
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';
import NumberPicker from 'react-widgets/lib/NumberPicker';
import styl from './popups';
import classnames from 'classnames/bind';

moment.updateLocale('ru', locale);
numberLocalizer(moment);

const cn = classnames.bind(styl);

export default class IndexPopup extends React.Component {
  static propTypes = {
    closePopup: React.PropTypes.func,
    currentObject: React.PropTypes.shape({
      index: React.PropTypes.number.isRequired
    }),
    onAccept: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      limits: {
        min: 1,
        max: 100,
        default: props.currentObject.index
      },
      value: props.currentObject.index,
      saveButton: 'disabled'
    };

    this.cancel = this.cancel.bind(this);
    this.accept = this.accept.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(value) {
    const isValueFalsy = isNaN(value) ||
      value < this.state.limits.min ||
      value === this.state.limits.default ||
      value > this.state.limits.max;

    if (isValueFalsy) {
      this.setState({value: value, saveButton: 'disabled'});
    } else {
      this.setState({value: value, saveButton: 'enabled'});
    }
  }

  accept() {
    if (this.state.saveButton !== 'enabled') {
      return;
    }

    this.props.onAccept(this.state.value, this.props.currentObject);
    this.props.closePopup();
  }

  cancel() {
    this.props.closePopup();
  }

  render() {
    const saveButton = cn({
      button: true,
      button_save: true,
      disabled: this.state.saveButton !== 'enabled'
    });

    const cancelButton = cn({
      button: true,
      button_cancel: true
    });

    return (
      <div className={styl.index_popup}>
        <div className={styl.index_container}>
          <div className={styl.index_text}>Смена позиции</div>
          <div>
            <NumberPicker
              min={this.state.limits.min}
              max={this.state.limits.max}
              value={this.state.value}
              onChange={this.onInputChange}
            />
          </div>
          <div className={styl.index_buttons_bar}>
            <div onClick={this.accept}
                 className={saveButton}>Сохранить</div>
            <div onClick={this.cancel}
                 className={cancelButton}>Отменить</div>
          </div>
        </div>
      </div>
    );
  }
}
