import React, {PropTypes} from 'react';
import Tooltip from 'react-tooltip';
import IconPlaceholder from './icons/media/placeholder';
import style from './styles/media';
import SingleImageWidget from './singleImageWidget';

export default class ContentImage extends React.Component {
  static propTypes = {
    image: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object
    ]),
    onUpload: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.updateImage = this.updateImage.bind(this);
  }

  state = {
    image: this.props.image
  };

  updateImage(image) {
    this.props.onUpload(image);
    this.setState({image});
  }

  render() {
    const {image} = this.state;

    if (image === undefined || !Object.keys(image).length) {
      return (
        <div className={style.media}>
          <IconPlaceholder className={style.media__icon}/>
          <SingleImageWidget onChange={this.updateImage}/>
        </div>
      );
    }

    return (
      <div className={style.media}>
        <img className={style.media__picture}
             src={image.url}
             data-tip={image.width + '×' + image.height}
        />
        <SingleImageWidget onChange={this.updateImage}/>
        <Tooltip offset={{top: -5}}
                 effect='solid'
                 class='tooltip'
                 place='top'
        />
      </div>
    );
  }
}
