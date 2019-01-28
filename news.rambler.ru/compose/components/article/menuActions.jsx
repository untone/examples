/* CONSTRUCTORS */
import React from 'react';
import {bindAll} from 'common/utils';

/* STYLES */
import styl from './styles/menuActions';

/* ICONS */
import AddIcon from './icons/menu/add';
import SetIcon from './icons/menu/set';
import RemoveIcon from './icons/menu/remove';

export default class MenuActions extends React.Component {
  static propTypes = {
    closePopup: React.PropTypes.func,
    togglePopup: React.PropTypes.func,
    setHeadVideo: React.PropTypes.func,
    removeVideo: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['addNew', 'setHeadVideo', 'removeVideo']);
  }

  addNew() {
    this.props.closePopup();
    this.props.togglePopup();
  }

  setHeadVideo() {
    this.props.closePopup();
    this.props.setHeadVideo();
  }

  removeVideo() {
    this.props.closePopup();
    this.props.removeVideo();
  }

  render() {
    return (
      <div className={styl.menu}>
        <div onClick={this.setHeadVideo} className={styl.menu__item}>
          <SetIcon className={styl.menu__icon}/>
          <div className={styl.menu__text}>Сделать главным</div>
        </div>
        <div onClick={this.addNew} className={styl.menu__item}>
          <AddIcon className={styl.menu__icon}/>
          <div className={styl.menu__text}>Добавить видео</div>
        </div>
        <div onClick={this.removeVideo}  className={styl.menu__item}>
          <RemoveIcon className={styl.menu__icon}/>
          <div className={styl.menu__text}>Удалить видео</div>
        </div>
      </div>
    );
  }
}
