import React from 'react';
import ImageUpload from './imageUpload';
import ImageSource from './imageSource';
import ImageSlider from './imageSlider';
import API from 'common/api';
import Ajax from 'common/webapi';
import ClassNames from 'classnames/bind';
import cn from 'classnames';
import {bindAll} from 'common/utils';

import style from './styles/widget';

import VideoIcon from './icons/toolbox/video';
import ImageIcon from './icons/toolbox/image';

const cnBind = ClassNames.bind(style);

export default class ContentWidget extends React.Component {
  static propTypes = {
    article: React.PropTypes.object,
    images: React.PropTypes.array,
    onUpdate: React.PropTypes.func,
    onUpload: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    bindAll(this, ['handleActivate', 'handleDeactivate', 'handleSwitch',
      'sliderUpdate', 'handleDocumentClick', 'onSourceEdited', 'sourceChanged',
      'updateHead']);
  }

  state = {
    context: this.props.images.length > 0 ? 'slides' : 'upload',
    images: this.props.images,
    isActive: false,
    selected: this.props.images.length > 0 ? this.props.images[0] : {source_id: 0},
    type: 'image',
    head: this.props.article.image_id
  };

  componentDidMount() {
    API.Source.fetch()
      .then(response => {
        const updatedImages = this.state.images.map((image) => {
          if (image.id === this.props.article.image_id) {
            image.head = true;
          }

          return image;
        });

        this.setState({
          resources: response.result,
          images: updatedImages
        });
      });

    document.addEventListener('click', this.handleDocumentClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  handleDocumentClick(event) {
    if (!this.ref || !this.ref.contains(event.target)) {
      this.handleDeactivate();
    }
  }

  onSourceEdited(data) {
    const selected = Object.assign({}, this.state.selected, data);
    const images = this.state.images.map(image => {
      if (image.id === data.id) {
        const {copy_title, copy_url, source_id} = data;
        return {
          ...image,
          copy_title,
          copy_url,
          source_id
        };
      }

      return image;
    });

    Ajax.ImageEdit.fetchJson({
      image_id: selected.id,
      source_id: selected.source_id,
      copy_title: selected.copy_title,
      copy_url: selected.copy_url,
      description: selected.description
    })
      .then(() => {
        this.setState({images, selected});
      });
  }

  sourceChanged(selectedSource) {
    const updatedImages = this.state.images.map((image) => {
      if (image.id === this.state.selected.id) {
        image.source_id = selectedSource.id;
      }

      return image;
    });

    this.setState({images: updatedImages});
  }

  handleActivate(event) {
    event.stopPropagation();
    this.setState({isActive: true});
  }

  handleDeactivate() {
    this.setState({isActive: false});
  }

  handleSwitch(context) {
    this.setState({context: context});
  }

  sliderUpdate(index) {
    this.setState({selected: this.state.images[index]});
  }

  updateHead(selected) {
    const updatedImages = this.state.images.map((image) => {
      if (image.id === selected.id) {
        image.head = true;
      } else {
        image.head = false;
      }

      return image;
    });

    selected.head = true;
    this.setState({images: updatedImages, selected});
  }

  render() {
    const articleId = this.props.article.id;
    let images = this.state.images;
    let widget;

    switch (this.state.context) {
      case 'slides':
        widget = (
          <ImageSlider
            images={images}
            onUpdate={this.sliderUpdate}
          />
        );
        break;
      case 'upload':
        widget = (
          <ImageUpload
            cluster={articleId}
            images={images}
            onUpload={this.props.onUpload}
            onSwitch={this.handleSwitch}
          />
        );
        break;
      default:
        widget = (
          <span/>
        );
    }

    const videoClass = cnBind({
      widget__wrapper: true,
      widget__wrapper_selected: this.state.type === 'video'
    });

    const imageClass = cnBind({
      widget__wrapper: true,
      widget__wrapper_selected: this.state.type === 'image'
    });

    return (
      <section
        ref={ref => {this.ref = ref;}}
        className={cn(style.widget, 'widget', {[style.widget_active]: this.state.isActive})}
        onClick={this.handleActivate}
        tabIndex={1}>
        {this.state.isActive ?
          <div className={style.widget__toggle}>
            <div onClick={()=> this.setState({type: 'image'})} className={imageClass}>
              <ImageIcon className={style.widget__icon}/>
            </div>
            <div onClick={()=> this.setState({type: 'video'})} className={videoClass}>
              <VideoIcon className={style.widget__icon}/>
            </div>
          </div> : null }
        {widget}
        <ImageSource
          active={this.state.isActive}
          cluster={articleId}
          current={this.state.selected}
          updateHead={this.updateHead}
          images={images}
          dataList={this.state.resources}
          placeholder={'Добавить источник фото'}
          onSwitch={this.handleSwitch}
          onSourceEdited={this.onSourceEdited}
          onSourceChanged={this.sourceChanged}
          onUpload={this.props.onUpload}
        />
      </section>
    );
  }
}
