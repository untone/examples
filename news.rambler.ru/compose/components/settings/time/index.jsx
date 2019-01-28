import React from 'react';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

import styl from './styles/index';

export default class Time extends React.Component {
  static propTypes = {
    time: React.PropTypes.object
  };

  mapComponents() {
    const timeKeys = Object.keys(this.props.time);
    let components = [];

    timeKeys.forEach(key => {
      let timeTitle;

      switch (key) {
        case 'ctime':
          timeTitle = 'Создано';
          break;
        case 'mtime':
          timeTitle = 'Отредактировано';
          break;
        case 'ptime':
          timeTitle = 'Опубликовано';
          break;
        default:
          timeTitle = 'Неизвестная временая константа';
      }

      components.push(
        <div key={key} className={styl.time__item}>
          <div className={styl.time__title}>
            {timeTitle}
          </div>
          <DateTimePicker
            format={'D MMM YYYY HH:mm'}
            defaultValue={new Date(this.props.time[key] * 1000)}
            readOnly/>
        </div>
      );
    });

    return components;
  }

  render() {
    return (
      <div className={styl.time}>
        {this.mapComponents()}
      </div>
    );
  }
}
