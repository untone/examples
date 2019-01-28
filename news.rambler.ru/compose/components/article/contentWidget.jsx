import React, {PropTypes} from 'react';
import ImageUpload from './imageUpload';
import ImageSource from './imageSource';
import ImageSlider from './imageSlider';
import VideoSlider from './videoSlider';
import VideoUpload from './videoUpload';
import VideosToolbar from './videosToolbar';
import API from 'common/api';
import Ajax from 'common/webapi';
import ClassNames from 'classnames/bind';
import cn from 'classnames';
import {bindAll} from 'common/utils';
import SimplePopup from 'common/popups/simple';
import VideoForm from './videoForm';
import {List} from 'immutable';

import style from './styles/widget';

import VideoIcon from './icons/toolbox/video';
import ImageIcon from './icons/toolbox/image';

const cnBind = ClassNames.bind(style);

export default class ContentWidget extends React.Component {
  static propTypes = {
    article: PropTypes.object,
    images: PropTypes.array,
    onUpdate: PropTypes.func,
    onVideoUpload: PropTypes.func,
    handleRemoveVideo: PropTypes.func,
    onUpload: PropTypes.func,
    disrankImage: PropTypes.func
  };

  constructor(props) {
    super(props);

    bindAll(this, ['handleSwitch', 'sliderUpdate',  'onSourceEdited', 'sourceChanged',
      'updateHead', 'videoSliderUpdate', 'toggleVideoPopup', 'saveNewVideo', 'setHeadVideo',
      'removeVideo', 'removeImage', 'disrankImage']);
  }

  state = {
    images: this.props.images,
    imageContext: this.props.images.length > 0 ? 'slider' : 'uploader',
    videoContext: this.props.article.videos.length > 0 ? 'slider' : 'uploader',
    isActive: false,
    selected: this.props.images.length > 0 ? this.props.images[0] : {source_id: 0},
    selectedVideo: this.props.article.videos.length > 0 ? this.props.article.videos[0] : {},
    type: 'image',
    head: this.props.article.image_id,
    headVideo: this.props.article.mvideo_id,
    videos: this.props.article.videos,
    videoPopup: false
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
  }

  componentWillReceiveProps(nextProps) {
    const selected =  nextProps.article.images.find(image => {
      return image.id === this.state.selected.id;
    });

    if (selected) {
      this.setState({images: nextProps.images, selected});
      return;
    }

    this.setState({images: nextProps.images});
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
      description: selected.description || ''
    })
      .then(() => {
        this.setState({images, selected});
      });
  }

  saveNewVideo(video) {
    API.Video.create({url: video.url, description: ''})
      .then(response => response.json())
      .then((response) => {
        const immutableVideos = List(this.state.videos);
        const videos = immutableVideos.unshift({
          id: response.id,
          url: video.url,
          description: ''
        });

        this.setState({videos, videoContext: 'slider'});
        this.props.onVideoUpload(response.id);
      });
  }

  removeVideo() {
    let context = 'slider';
    let currentIndex = 0;
    let selected;

    const videos = this.state.videos.filter((video, index) => {
      if (video.id === this.state.selectedVideo.id) {
        currentIndex = index;
        return false;
      }

      return true;
    });

    if (videos.length === 0) {
      context = 'uploader';
    } else {
      if (currentIndex + 1 <= videos.length) {
        selected = videos[currentIndex];
      } else if (currentIndex + 1 === videos.length) {
        selected = videos[currentIndex - 1];
      }
    }

    this.setState({videos, videoContext: context, selectedVideo: selected});
    this.props.handleRemoveVideo(videos.map(video => video.id));
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

  handleSwitch(context) {
    this.setState({imageContext: context});
  }

  sliderUpdate(index) {
    this.setState({selected: this.state.images[index]});
  }

  videoSliderUpdate(index) {
    this.setState({selectedVideo: this.state.videos[index]});
  }

  updateHead(selected) {
    const images = this.state.images.map((image) => {
      if (image.id === selected.id) {
        image.head = true;
      } else {
        image.head = false;
      }

      return image;
    });

    this.setState({
      images,
      selected: {
        ...selected,
        head: true
      }
    });

    this.props.onUpdate({
      article: {
        ...this.props.article,
        mimage: selected.id
      }
    });
  }

  removeImage(selectedImage) {
    let currentIndex = 0;
    let imageContext = 'slider';
    let selected = selectedImage;
    const images = this.state.images.filter((image, index) => {
      if (image.id === selected.id) {
        currentIndex = index;
        return false;
      }

      return true;
    });

    if (images.length === 0) {
      imageContext = 'uploader';
    } else {
      if (currentIndex + 1 <= images.length) {
        selected = images[currentIndex];
      } else {
        selected = images[currentIndex - 1];
      }
    }

    this.setState({images, imageContext, selected});
    this.props.onUpdate({
      article: {
        ...this.props.article,
        images
      }
    });
  }

  toggleVideoPopup() {
    this.setState({videoPopup: !this.state.videoPopup});
  }

  setHeadVideo() {
    this.setState({headVideo: this.state.selectedVideo.id});
    this.props.onUpdate({
      article: {
        ...this.state.article,
        mvideo_id: this.state.selectedVideo.id
      }
    });
  }

  disrankImage(imageId) {
    this.setState({
      selected: {
        ...this.state.selected,
        from_item: false,
        disranked: true
      }
    });

    this.props.disrankImage(imageId);
  }

  render() {
    const articleId = this.props.article.id;
    const {images, videos, isActive, selected, resources, type,
      imageContext, videoContext, videoPopup, headVideo, selectedVideo} = this.state;
    const {onUpload} = this.props;
    let widget;
    let bottomBar;
    let videoPopupContent;

    if (type === 'image') {
      if (imageContext === 'slider') {
        widget = (
          <ImageSlider
            images={images}
            onUpdate={this.sliderUpdate}
            type={type}
          />
        );

        bottomBar = (
          <ImageSource
            active={isActive}
            removeImage ={this.removeImage}
            cluster={articleId}
            current={selected}
            updateHead={this.updateHead}
            images={images}
            dataList={resources}
            placeholder={'Добавить источник фото'}
            onSwitch={this.handleSwitch}
            onSourceEdited={this.onSourceEdited}
            onSourceChanged={this.sourceChanged}
            onUpload={onUpload}
            disrankImage={this.disrankImage}
          />
        );
      } else {
        widget = (
            <ImageUpload
              cluster={articleId}
              images={images}
              onUpload={onUpload}
              onSwitch={this.handleSwitch}
            />
          );
      }
    } else {
      if (videoPopup) {
        videoPopupContent = (
          <SimplePopup displayCenter close={this.toggleVideoPopup}>
            <VideoForm saveNewVideo={this.saveNewVideo}/>
          </SimplePopup>
        );
      }

      if (videoContext === 'slider') {
        widget = (
          <VideoSlider
            videos={videos}
            onUpdateVideo={this.videoSliderUpdate}
            type={type}
          />
        );

        bottomBar = (
          <VideosToolbar head={headVideo === selectedVideo.id}
                         setHeadVideo={this.setHeadVideo}
                         removeVideo={this.removeVideo}
                         togglePopup={this.toggleVideoPopup}/>
        );
      } else {
        widget = (
          <VideoUpload onClick={this.toggleVideoPopup}/>
        );
      }
    }

    const videoClass = cnBind({
      widget__wrapper: true,
      widget__wrapper_selected: type === 'video'
    });

    const imageClass = cnBind({
      widget__wrapper: true,
      widget__wrapper_selected: type === 'image'
    });

    return (
      <section
        ref={ref => {this.ref = ref;}}
        className={cn(style.widget, 'widget', {[style.widget_active]: true})}
        tabIndex={1}>
          <div className={style.widget__toggle}>
            <div onClick={()=> this.setState({type: 'image'})} className={imageClass}>
              <ImageIcon className={style.widget__icon}/>
            </div>
            <div onClick={()=> this.setState({type: 'video'})} className={videoClass}>
              <VideoIcon className={style.widget__icon}/>
            </div>
          </div>
        {videoPopupContent}
        {widget}
        {bottomBar}
      </section>
    );
  }
}
