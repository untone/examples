/* CONSTRUCTORS */
import React from 'react';

/* STYLES */
import styl from './styles/videoUpload';

export default class VideoUpload extends React.Component {
  static propTypes = {
    onClick: React.PropTypes.func
  };

  render() {
    return (
      <div onClick={this.props.onClick} className={styl.container}>
        <div className={styl.container__button}>
          Добавить видео
        </div>
      </div>
    );
  }
}
