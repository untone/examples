import React, {PropTypes} from 'react';
import ContentImage from './contentImage';
import ContentWidget from './contentWidget';

export default class ContentMedia extends React.Component {
  static propTypes = {
    article: PropTypes.object,
    images: PropTypes.array,
    context: PropTypes.string,
    onVideoUpload: PropTypes.func,
    handleRemoveVideo: PropTypes.func,
    onUpdate: PropTypes.func,
    onUpload: PropTypes.func,
    disrankImage: PropTypes.func
  };

  render() {
    const {context, article, images, onUpdate, onUpload, onVideoUpload, handleRemoveVideo, disrankImage} = this.props;
    let widget;

    switch (context) {
      case 'cluster':
        widget = (
          <ContentWidget
            article={article}
            images={images}
            onVideoUpload={onVideoUpload}
            handleRemoveVideo={handleRemoveVideo}
            onUpdate={onUpdate}
            onUpload={onUpload}
            disrankImage={disrankImage}
          />
        );
        break;
      case 'item':
        widget = (
          <ContentImage image={article.image} onUpload={onUpload}/>
        );
        break;
      default:
        widget = (null);
    }

    return (
      <span>
        {widget}
      </span>
    );
  }
}
