/* CONSTRUCTORS */
import React from 'react';

/* COMPONENTS */
// import PopupItem from './popupItem';
import Tooltip from 'react-tooltip';
import CheckboxItem from './checkboxItem';
import Section from '../settings/section/index';
import Time from '../settings/time/index';
import SimplePopup from '../../../common/popups/simple';


/* ICONS */
import IconCog from './icons/cog';
import IconTime from './icons/time';
import IconComments from './icons/comments';
import IconBreaking from './icons/breaking';
import IconFulltext from './icons/fulltext';
import IconFeed from './icons/feed';
import IconEye from './icons/eye';

/* STYLES */
import toolbox from './style';

class ToolboxItem extends React.Component {
  static propTypes = {
    context: React.PropTypes.string,
    item: React.PropTypes.object,
    onUpdate: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.item.checked,
      isOpen: false
    };

    this.handleUpdate = this.handleUpdate.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
  }

  handleUpdate() {
    this.props.onUpdate({
      toggles: {
        [this.props.context]: {
          [this.props.item.name]: {
            checked: !this.state.checked
          }
        }
      }
    });
    this.setState({
      checked: !this.state.checked
    });
  }

  togglePopup() {
    this.setState({isOpen: !this.state.isOpen});
  }

  render() {
    let props = this.props.item;
    let icon;
    let button;
    switch (props.icon) {
      case 'cog':
        icon = (
          <IconCog
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'time':
        icon = (
          <IconTime
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'comments':
        icon = (
          <IconComments
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'breaking':
        icon = (
          <IconBreaking
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'rss':
        icon = (
          <IconFeed
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'eye':
        icon = (
          <IconEye
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      case 'fulltext':
        icon = (
          <IconFulltext
            className={toolbox.toolbox__icon}
            width={34}
            height={34}
          />
        );
        break;
      default:
        return false;
    }

    if (props.name === 'options' || props.name === 'datetime') {
      let popupContent;
      let checked;

      switch (props.name) {
        case 'options':
          checked = this.props.item.settings ? true : false;
          popupContent = (<Section settings={this.props.item.settings}/>);
          break;
        case 'datetime':
          checked = this.props.item.time ? true : false;
          popupContent = (<Time time={this.props.item.time}/>);
          break;
        default:
          checked = false;
          popupContent = null;
      }

      button = (
        <div className={toolbox.toolbox__wrap}>
          <CheckboxItem
            disableToggle
            onClick={this.togglePopup}
            checked={checked}
            disabled={props.disabled}
            style={toolbox}
            children={icon}
            title={props.title}
          />
          {this.state.isOpen ?
            <SimplePopup left close={this.togglePopup}>
              {popupContent}
            </SimplePopup> : null}
        </div>
      );
    } else {
      button = (
        <CheckboxItem
          checked={this.state.checked}
          disabled={props.disabled}
          style={toolbox}
          children={icon}
          onChange={this.handleUpdate}
          title={props.title}
        />
      );
    }

    return button;
  }
}

export default class Toolbox extends React.Component {
  static propTypes = {
    context: React.PropTypes.string,
    onUpdate: React.PropTypes.func,
    settings: React.PropTypes.object,
    time: React.PropTypes.object,
    toggles: React.PropTypes.object
  };

  render() {
    const items = [
      {
        name: 'options',
        title: 'Настройки рубрик, регионов и тегов',
        icon: 'cog',
        settings: this.props.settings,
        toggle: false,
        checked: this.props.toggles.options.checked,
        disabled: this.props.toggles.options.disabled
      }, {
        name: 'datetime',
        title: 'Время публикации',
        icon: 'time',
        time: this.props.time,
        toggle: false,
        checked: this.props.toggles.datetime.checked,
        disabled: this.props.toggles.datetime.disabled
      }, {
        name: 'comments',
        title: 'Комментарии',
        icon: 'comments',
        toggle: true,
        checked: this.props.toggles.comments.checked,
        disabled: this.props.toggles.comments.disabled
      }, {
        name: 'breaking',
        title: 'Срочная новость',
        icon: 'breaking',
        toggle: false,
        checked: this.props.toggles.breaking.checked,
        disabled: this.props.toggles.breaking.disabled,
      }, {
        name: 'export',
        title: 'Эскпорт в РСС',
        icon: 'rss',
        toggle: true,
        checked: this.props.toggles.export.checked,
        disabled: this.props.toggles.export.disabled
      }, {
        name: 'invisible',
        title: 'Невидимая публикация',
        icon: 'eye',
        toggle: true,
        checked: this.props.toggles.invisible.checked,
        disabled: this.props.toggles.invisible.disabled
      }, {
        name: 'fulltext',
        title: 'Полнотекст',
        icon: 'fulltext',
        toggle: true,
        checked: this.props.toggles.fulltext.checked,
        disabled: this.props.toggles.fulltext.disabled
      }
    ];

    let buttons = items.map((item, index) => {
      return (
        <ToolboxItem
          key={index}
          item={item}
          context={this.props.context}
          onUpdate={this.props.onUpdate}
        />
      );
    });

    return (
      <div className={toolbox.toolbox}>
        {buttons}
        <Tooltip
          id='toolboxTooltip'
          offset={{top: -5}}
          effect='solid'
          class='tooltip'
          place='bottom'
        />
      </div>
    );
  }
}
