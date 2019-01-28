import React from 'react';
import Slider from 'react-slick';
import uniqueId from 'lodash.uniqueid';

import IconLeft from './icons/media/left';
import IconRight from './icons/media/right';

import style from './styles/slider';

class videoNavButton extends React.Component {
  render() {
    return (
      <button {...this.props}/>
    );
  }
}
export default class ImageSlider extends React.Component {
  static propTypes = {
    videos: React.PropTypes.array,
    onUpdateVideo: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    currentVideo: 0
  };

  handleChange(selected) {
    this.setState({currentVideo: selected});
    this.props.onUpdateVideo(selected);
  }

  render() {
    const {videos} = this.props;
    let slides = videos.map(item => {
      return (
        <div key={uniqueId('slider-video-key-')}
             dangerouslySetInnerHTML={{__html: item.url}}/> // eslint-disable-line
      );
    });

    let prevArrow = (
      <videoNavButton>
        <IconLeft className={style.slider__icon}/>
      </videoNavButton>
    );
    let nextArrow = (
      <videoNavButton>
        <IconRight className={style.slider__icon}/>
      </videoNavButton>
    );

    return (
      <div>
        <Slider
          ref='slider'
          className={style.slider}
          afterChange={this.handleChange}
          accessibility
          centerPadding
          prevArrow={prevArrow}
          nextArrow={nextArrow}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}>
          {slides}
        </Slider>
        <div className={style.slider__count}>
          {this.state.currentVideo + 1} из {this.props.videos.length}
        </div>
      </div>
    );
  }
}
