import React from 'react';
import Slider from 'react-slick';
import Tooltip from 'react-tooltip';

import IconLeft from './icons/media/left';
import IconRight from './icons/media/right';

import style from './styles/slider';

class imageNavButton extends React.Component {
  render() {
    return (
      <button {...this.props}/>
    );
  }
}
export default class ImageSlider extends React.Component {
  static propTypes = {
    images: React.PropTypes.array,
    onUpdate: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    current: 0
  };

  handleChange(selected) {
    this.setState({current: selected});
    this.props.onUpdate(selected);
  }

  render() {
    const {images} = this.props;
    let slides = images.map((item, index) => {
      const tooltip = `${item.width}×${item.height}`;

      return (
        <div
          data-for='imageTooltip'
          data-tip={tooltip}
          key={index.toString()}>
          <img
            className={style.slider__slide}
            src={item.url}
            width={item.width}
            height={item.height}
          />
        </div>
      );
    });

    let prevArrow = (
      <imageNavButton>
        <IconLeft className={style.slider__icon}/>
      </imageNavButton>
    );
    let nextArrow = (
      <imageNavButton>
        <IconRight className={style.slider__icon}/>
      </imageNavButton>
    );

    return (
      <div>
        <Tooltip
          id='imageTooltip'
          offset={{top: -80}}
          effect='solid'
          class='tooltip'
          place='top'
        />
        <Slider
          ref='slider'
          className={style.slider}
          afterChange={this.handleChange}
          accessibility
          centerPadding
          adaptiveHeight={false}
          dots={false}
          fade
          prevArrow={prevArrow}
          nextArrow={nextArrow}
          infinite={false}
          speed={500}
          autoplay={false}
          slidesToShow={1}
          slidesToScroll={1}>
          {slides}
        </Slider>
        <div className={style.slider__count}>
          {this.state.current + 1} из {this.props.images.length}
        </div>
      </div>
    );
  }
}
