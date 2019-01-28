/* CONSTRUCTORS */
import React from 'react';
import API from 'common/api';
import cn from 'classnames';
import {bindAll} from 'common/utils';
import Dropzone from 'react-dropzone';

/* ICONS */
import IconProgress from './icons/media/progress';

/* STYLES */
import style from './styles/singleImageWidget';

export default class SingleImageWidget extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['handleImageDrop', 'handleClick']);
  }

  state = {
    files: [],
    progress: false
  };

  handleClick(event) {
    event.nativeEvent.stopImmediatePropagation();
  }

  handleImageDrop(acceptedFiles) {
    let file = acceptedFiles[0];
    let reader = new window.FileReader();
    reader.readAsBinaryString(file);
    this.setState({progress: true}, () => {
      reader.onloadend = () => {
        API.Image.create({filename: file.name, image: btoa(reader.result)})
          .then(response => response.json())
          .then(response => {
            return API.Image.fetchOne(response.id, {}, 'default', 'c500x280');
          })
          .then(response => {
            this.setState({progress: false}, () => {
              this.props.onChange(response.result[0]);
            });
          });
      };
    });
  }

  render() {
    return (
      <Dropzone
        className={style.editor__dropzone}
        activeClassName={style.editor__dropzone_active}
        onDrop={this.handleImageDrop}
        onClick={this.handleClick}>
        {this.state.progress
          ? <IconProgress className={cn(style.editor__dropzone_icon, style.editor__dropzone_icon_progress)}/>
          : null
        }
        <div className={style.editor__dropzone_button}>
          {'загрузить фото'}
        </div>
      </Dropzone>
    );
  }
}
