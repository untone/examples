import React from 'react';
import moment from 'moment';
import locale from 'moment/locale/ru';
import cn from 'classnames';
import styl from './list.styl';
import {bindAll} from '../../../common/utils';
import IconEdit from './icons/edit';
import IconCompose from './icons/compose';
import IconPosition from './icons/position';
import IconHide from './icons/hide';
import IconUnHide from './icons/unhide';
// import IconRemove from './icons/remove';
import IconLink from './icons/link';
import IconImage from './icons/image';
import ReactTooltip from 'react-tooltip';

moment.updateLocale('ru', locale);

class Item extends React.Component {
  static propTypes = {
    buttonsEvents: React.PropTypes.object,
    cluster: React.PropTypes.object,
    onClick: React.PropTypes.func,
    visible: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    bindAll(this, ['openContent', 'toggleHide']);
  }

  openContent() {
    this.props.onClick(this.props.cluster);
  }

  toggleHide(e) {
    e.stopPropagation();
    this.props.buttonsEvents.toggleHide(this.props.cluster.id);
  }

  render() {
    const cluster = this.props.cluster;
    const topics = cluster.topics.map(topic => {
      return (<div key={topic.id} className={styl.list__cluster__topic}>{topic.name}</div>);
    });
    const events = this.props.buttonsEvents;
    const iconHide = (
      <IconHide
        onClick={this.toggleHide}
        className={styl.list__cluster__bottom_icon}
        data-tip='Скрыть кластер с сайта'/>
    );
    const iconUnhide = (
      <IconUnHide
        onClick={this.toggleHide}
        className={styl.list__cluster__bottom_icon}
        data-tip='Вернуть кластер на сайт'/>
    );

    let rightTopCornerElement;
    let toggleIcon = this.props.visible === 1 ? iconHide : iconUnhide;

    switch (cluster.status) {
      case '-1':
        rightTopCornerElement = (<div className={cn(styl.list__cluster__mark, styl.list__cluster__mark_hidden)}>скрыт</div>);
        break;
      case 5:
        rightTopCornerElement = (<div className={cn(styl.list__cluster__mark, styl.list__cluster__mark_hidden)}>скрыт</div>);
        break;
      case 6:
        rightTopCornerElement = (<div className={cn(styl.list__cluster__mark, styl.list__cluster__mark_censor)}>автоцензура</div>);
        break;
      case 8:
        rightTopCornerElement = (<div className={cn(styl.list__cluster__mark, styl.list__cluster__mark_not)}>нет полнотекстов</div>);
        break;
      default:
        rightTopCornerElement = (<div className={styl.list__cluster__index}>{cluster.index}</div>);
    }

    return (
      <div
        id={cluster.id}
        className={styl.list__item}>
        <div className={styl.list__cluster}>
          <div className={styl.list__cluster__photo}>
            {cluster.image
              ? <img src={cluster.image} />
              : <IconImage width={32} height={28} />
            }
          </div>
          <div className={styl.list__cluster__info}>
            <div className={styl.list__cluster__meta}>
              <div className={styl.list__cluster__source}>
                {cluster.source}
              </div>
              <div className={styl.list__cluster__time}>
                {moment(cluster.time).format('D MMM HH:MM')}
              </div>
              <span className={styl.list__cluster__citems}>
                {cluster.items}
              </span>
              {rightTopCornerElement}
            </div>
            <div className={styl.list__cluster__content}>
              <div className={styl.list__cluster__title}>
                {cluster.title}
              </div>
              <div className={styl.list__cluster__clicks}>
                <span className={styl.list__cluster__click_delta}>
                  {cluster.clickDelta ? cluster.clickDelta : 0 }
                </span>
                {' • '}
                <span className={styl.list__cluster__click_period}>
                  {cluster.clickPeriod}
                </span>
              </div>
            </div>
            <div className={styl.list__cluster__bottom}>
              <div className={styl.list__cluster__topics}>
                {topics}
              </div>
              <div className={styl.list__cluster__icons}>
                <IconEdit
                  onClick={(e) => events.editClusterList(e, cluster)}
                  className={styl.list__cluster__bottom_icon}
                  data-tip='Открыть список новостей кластера'
                  data-for='clusterTooltip'/>
                <IconCompose
                  onClick={(e) => events.editCluster(e, cluster)}
                  className={styl.list__cluster__bottom_icon}
                  data-tip='Открыть редактор кластера'
                  data-for='clusterTooltip'/>
                <IconPosition
                  onClick={(e) => events.changePosition(e, cluster)}
                  className={styl.list__cluster__bottom_icon}
                  data-tip='Изменить позицию кластера в рубрике'
                  data-for='clusterTooltip'/>
                {toggleIcon}
                {/* <IconRemove onClick={events.deleteCluster} className={cn(styl.list__cluster__bottom_icon, styl.list__cluster__bottom_icon_disabled)}/> */}
                <a target='_blank' href={cluster.link}>
                  <IconLink
                    onClick={events.openInNewTab}
                    className={styl.list__cluster__bottom_icon}
                    data-tip='Открыть кластер на сайте в новой вкладке'
                    data-for='clusterTooltip'/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class List extends React.Component {
  static propTypes = {
    buttonsEvents: React.PropTypes.object,
    list: React.PropTypes.arrayOf(React.PropTypes.object),
    onClick: React.PropTypes.func,
    visible: React.PropTypes.any
  };

  render() {
    let clusters = this.props.list.map(cluster => {
      return (<Item onClick={this.props.onClick}
                    visible={this.props.visible}
                    key={cluster.id}
                    cluster={cluster}
                    buttonsEvents={this.props.buttonsEvents}
      />);
    });

    return (
    <div className={styl.list}>
      {clusters}
      <ReactTooltip
        id='clusterTooltip'
        effect='solid'
        class='tooltip'
        place='top'/>
    </div>);
  }
}
