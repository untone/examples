import React, {PropTypes} from 'react';
import cn from 'classnames';
import ContentHeader from './contentHeader';
import ContentMedia from './contentMedia';
import ContentEditor from './contentEditor';
import style from './styles/index';
import theme from './styles/theme';

export default class Article extends React.Component {
  static propTypes = {
    article: PropTypes.object,
    context: PropTypes.string,
    onVideoUpload: PropTypes.func,
    handleRemoveVideo: PropTypes.func,
    onUpdate: PropTypes.func,
    onUpload: PropTypes.func,
    disrankImage: PropTypes.func
  };

  render() {
    const props = this.props;
    return (
      <div className={cn(style.editor, theme.news)}>
        <ContentHeader
          article={props.article}
          onUpdate={this.props.onUpdate}
        />
        <ContentMedia
          article={props.article}
          context={props.context}
          images={props.article.images}
          onVideoUpload={props.onVideoUpload}
          handleRemoveVideo={props.handleRemoveVideo}
          onUpdate={props.onUpdate}
          onUpload={props.onUpload}
          disrankImage={props.disrankImage}
        />
        <ContentEditor
          article={props.article}
          images={props.article.images}
          context={props.context}
          onUpdate={props.onUpdate}
        />
      </div>
    );
  }
}
