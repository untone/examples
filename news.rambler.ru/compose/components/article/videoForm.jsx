/* CONSTRUCTORS */
import React from 'react';
import cn from 'classnames';
import {bindAll} from 'common/utils';

/* STYLES */
import styl from './styles/videoForm';

export default class VideoForm extends React.Component {
  static propTypes = {
    closePopup: React.PropTypes.func,
    saveNewVideo: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['onChange', 'save']);
  }

  state = {
    url: ''
  };

  onChange(event) {
    this.setState({url: event.target.value});
  }

  save() {
    this.props.saveNewVideo(this.state);
    this.props.closePopup();
  }

  render() {
    return (
      <div className={styl.video_form}>
        <div className={styl.video_form__title}>
          Добавление видеозаписи
        </div>
        <input autoFocus
               className={styl.input}
               value={this.state.url}
               onChange={this.onChange}
               placeholder='Добавить видеозапись'/>
        <div className={styl.video_form__buttons_bar}>
          <div onClick={this.save} className={cn(styl.button_save, styl.button)}>
            Сохранить
          </div>
          <div onClick={this.props.closePopup} className={cn(styl.button_cancel, styl.button)}>
            Отменить
          </div>
        </div>
      </div>
    );
  }
}
