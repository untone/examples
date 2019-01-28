import React from 'react';
import style from './toolbar.styl';
import classnames from 'classnames/bind';
import RefreshButton from '../../../common/buttons/refresh/index';

const cn = classnames.bind(style);

class Item extends React.Component {
  static propTypes = {
    id: React.PropTypes.any,
    onSelect: React.PropTypes.func,
    selected: React.PropTypes.bool,
    text: React.PropTypes.string
  };

  state = this.props;

  select = () => {
    this.props.onSelect(this.props.id);
  };

  render() {
    const className = cn({
      toolbar__item_label: true,
      toolbar__item_label_checked: this.props.selected
    });

    return (
      <div
        className={style.toolbar__item}
         onClick={this.select}>
         <span className={className}>
          {this.props.text}
        </span>
      </div>
    );
  }
}

export default class Toolbar extends React.Component {
  static propTypes = {
    changeToolbarFilter: React.PropTypes.func,
    refreshData: React.PropTypes.func
  };

  state = {
    refresh: false,
    buttons: [
      {
        id: 'active',
        text: 'Активные',
        selected: true
      },
      {
        id: 'inactive',
        text: 'Неактивные',
        selected: false
      },
      {
        id: 'all',
        text: 'Все',
        selected: false
      }
    ]
  };

  refreshData = () => {
    this.setState({refresh: true});
    this.props.refreshData().then(() => {
      setTimeout(() => {
        this.setState({refresh: false});
      }, 1000);
    });
  };

  onItemSelect = id => {
    let visible;
    let buttons = this.state.buttons.map(button => {
      button.selected = button.id === id;
      return button;
    });

    this.setState({buttons: buttons});

    switch (id) {
      case 'active':
        visible = 1;
        break;
      case 'inactive':
        visible = 0;
        break;
      default:
        visible = '';
    }

    this.props.changeToolbarFilter(visible);
  };

  render() {
    const buttons = this.state.buttons.map(button => {
      return (
        <Item
          onSelect={this.onItemSelect}
          selected={button.selected}
          id={button.id}
          key={button.id}
          text={button.text}
        />
      );
    });

    return (
      <div className={style.toolbar}>
        {buttons}
        <div className={style.toolbar__item}>
          <RefreshButton onClick={this.refreshData}
                         isRefreshing={this.state.refresh}
          />
        </div>
      </div>
    );
  }
}
