import React, { Component, PureComponent } from 'react';
import { HH_MM_MSK_ticking } from 'Common/dateUtils.js';
import style from './clock.module.scss';

export default class Clock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: new Date()
    };
  }

  componentDidMount() {
    this.intervalID = setInterval(
      () => this.tick(),
      500
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  tick() {
    this.setState({
      time: new Date()
    });
  }

  render() {
    return <span className={style.clock}>
      {HH_MM_MSK_ticking(this.state.time)}
    </span>;
  }
}