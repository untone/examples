/* CONSTRUCTORS */
import React, {PropTypes} from 'react';
import Popup from 'common/popup/index';
import cn from 'classnames';
import {bindAll} from 'common/utils';

/* STYLES */
import style from './styles/widget';

/* ICONS */
import IconDots from './icons/menu/dots';
import IconAdd from './icons/menu/add';
import IconSet from './icons/menu/set';
import IconSource from './icons/menu/source';
import IconRemove from './icons/menu/remove';
import IconUnlock from './icons/menu/unlock';

export default class SourceMenu extends Popup {
  static propTypes = {
    openNewSourcePopup: PropTypes.func,
    updateHead: PropTypes.func,
    removeImage: PropTypes.func,
    disrankImage: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = props;

    bindAll(this, ['handleMenu', 'handleSet', 'handleAdd', 'handleRemove',
      'handleClose', 'handleDocumentClick', 'disrank']);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  handleDocumentClick(event) {
    if (!this.ref || !this.ref.contains(event.target)) {
      this.handleClose();
    }
  }

  handleMenu() {
    this.setState({isOpen: !this.state.isOpen});
  }

  handleSet() {
    this.props.updateHead(this.props.current);
  }

  handleAdd() {
    this.props.onSwitch('uploader');
  }

  handleRemove() {
    this.props.removeImage(this.props.current);
  }

  handleClose() {
    this.setState({isOpen: false});
  }

  disrank() {
    this.props.disrankImage(this.props.current.id);
  }

  render() {
    let deleteButton = null;

    if (this.props.current.from_item) {
      deleteButton = (
        <li className={style.widget__dropdown_item} onClick={this.disrank}>
          <IconUnlock className={style.widget__dropdown_icon}/>
          <div className={style.widget__dropdown_text}>
            Сделать ручной
          </div>
        </li>
      );
    } else if (!this.props.current.disranked && !this.props.current.from_item) {
      deleteButton = (
        <li className={style.widget__dropdown_item} onClick={this.handleRemove}>
          <IconRemove className={style.widget__dropdown_icon}/>
          <div className={style.widget__dropdown_text}>
            Удалить
          </div>
        </li>
      );
    }

    const menuClasses = cn(
      style.widget__menu,
      {[style.widget__menu_open]: this.state.isOpen}
    );

    return (
      <div className={menuClasses}>
        <IconDots
          onClick={this.handleMenu}
          className={style.widget__dots}
          width='30'
          height='30'
        />
        <ul
          ref={ref => {this.ref = ref;}}
          className={style.widget__dropdown}
          onClick={this.handleMenu}>
          <li className={style.widget__dropdown_item} onClick={this.handleSet}>
            <IconSet className={style.widget__dropdown_icon}/>
            <div className={style.widget__dropdown_text}>
              Сделать главной
            </div>
          </li>
          <li className={style.widget__dropdown_item} onClick={this.handleAdd}>
            <IconAdd className={style.widget__dropdown_icon}/>
            <div className={style.widget__dropdown_text}>
              Добавить изображение
            </div>
          </li>
          <li className={style.widget__dropdown_item} onClick={this.props.openNewSourcePopup}>
            <IconSource className={style.widget__dropdown_icon}/>
            <div className={style.widget__dropdown_text}>
              Редактировать источник
            </div>
          </li>
            {deleteButton}
        </ul>
      </div>
    );
  }
}
