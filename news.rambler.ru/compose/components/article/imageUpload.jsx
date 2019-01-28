import React from 'react';
import cn from 'classnames';
import API from 'common/api';
import Dropzone from 'react-dropzone';

import IconProgress from './icons/media/progress';

import style from './styles/dropzone';

export default class ImageUpload extends React.Component {
  static propTypes = {
    cluster: React.PropTypes.number,
    onUpload: React.PropTypes.func,
    onSwitch: React.PropTypes.func
  };

  state = {
    files: [],
    progress: false,
    image: null
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextState.image !== this.state.image) {
      this.handleRecieveImage(nextState.image);
    }
  }

  handleRecieveImage = image => {
    this.props.onUpload(image);
  };

  handleContextSwitch = () => {
    this.props.onSwitch('slider');
  };

  hadleImageUpload(id) {
    let image;

    API.Image.fetchOne(id, {}, 'default', 'c500x280')
    .then(({result}) => {
      if (result) {
        image = result[0];
        this.setState({files: [], image, progress: false});
        this.handleContextSwitch();
      }
    });
  }

  handleImageDrop = acceptedFiles => {
    const file = acceptedFiles[0];
    const reader = new window.FileReader();

    this.setState({files: acceptedFiles, progress: true});
    reader.readAsBinaryString(file);

    reader.onloadend = () => {
      API.Image.create({
        filename: file.name,
        image: btoa(reader.result)
      })
      .then(response => response.json())
      .then(response => response.id && this.hadleImageUpload(response.id));
    };
  };

  handleReject() {
    console.warn('rejected!');
  }

  render() {
    const backgroundImage = this.state.files.length > 0 ? this.state.files.map((file) => `url(${file.preview})`) : '';
    const css = {
      backgroundImage: backgroundImage,
      backgroundSize: 'cover'
    };

    return (
      <Dropzone
        style={css}
        className={style.dropzone}
        accept={'image/*'}
        activeClassName={style.dropzone_active}
        onDropAccepted={this.handleImageDrop}
        onDropRejected={this.handleReject}>
        {this.state.progress &&
          <IconProgress
            className={cn(style.dropzone__icon, style.dropzone__icon_progress)}
            width={18}
            height={18}
          />}
        <div className={style.dropzone__button}>
          {'Загрузить фото'}
        </div>
      </Dropzone>
    );
  }
}
