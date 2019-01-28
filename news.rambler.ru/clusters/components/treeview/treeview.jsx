import React from 'react';
import styl from './treeview.styl';
import classNames from 'classnames/bind';
import IconArrow from './icons/arrow';

const cn = classNames.bind(styl);

class TreeViewSubItem extends React.Component {
  static propTypes = {
    collapsed: React.PropTypes.bool,
    item: React.PropTypes.object,
    onClick: React.PropTypes.func,
    selected: React.PropTypes.string
  };

  state = this.props;

  itemClick = event => {
    event.stopPropagation();
    this.props.onClick(this.props.item.alias);
  };

  render() {
    const item = this.props.item;
    const itemClass = cn({
      tree_view_children: true,
      item_selected: this.props.selected === item.alias
    });

    const textClassName = cn({
      'text_children': true,
      'text-disabled': this.props.item.status === 2,
      'text-extraordinary': this.props.item.status === 0
    });

    return (
            <div key={item.alias}
                 className={itemClass}
                 onClick={this.itemClick}>
              <div className={textClassName}>{this.props.collapsed ? null : item.text}</div>
            </div>
    );
  }
}

class TreeViewItem extends React.Component {
  static propTypes = {
    item: React.PropTypes.object,
    onClick: React.PropTypes.func,
    selected: React.PropTypes.string
  };

  state = this.props;

  arrowClick = event => {
    event.stopPropagation();
    this.setState({collapsed: !this.state.collapsed});
  };

  itemClick = () => {
    this.props.onClick(this.props.item.parent.alias);
  };

  render() {
    let childs = [];
    let hasChilds = false;
    let textClass;

    const itemClassName = cn({
      item: true,
      item_selected: this.props.selected === this.props.item.parent.alias,
      item_child_selected: this.props.item.childs.some(item => {
        return item.alias === this.props.selected;
      })
    });

    const arrowClassName = cn({
      tree_view_arrow: true,
      tree_view_arrow_collapsed: this.state.collapsed
    });

    const childContainerClassName = cn({
      child_container: true,
      child_container_collapsed: this.state.collapsed
    });

    const arrow = (
      <div className={arrowClassName} onClick={this.arrowClick}>
        <IconArrow width={40} height={40}/>
      </div>
    );

    if (this.props.item.childs) {
      childs = this.props.item.childs.map(child => {
        return (
          <TreeViewSubItem key={child.alias}
                           selected={this.props.selected}
                           collapsed={this.state.collapsed}
                           item={child}
                           onClick={this.props.onClick}/>
        );
      });

      hasChilds = childs.length > 0;
    }

    textClass = cn({
      'text_non_arrow': !hasChilds,
      'text': hasChilds,
      'text-disabled': this.props.item.parent.status === 2,
      'text-extraordinary': this.props.item.parent.status === 0
    });

    return (
      <div onClick={this.itemClick}>
        <div key={this.props.item.parent.alias} className={itemClassName}>
          {hasChilds === true ? arrow : null}
          <div className={textClass}>{this.props.item.parent.text}</div>
        </div>
        <div className={childContainerClassName}>
          {childs}
        </div>
      </div>
    );
  }
}

export default class TreeView extends React.Component {
  static propTypes = {
    onItemClick: React.PropTypes.func,
    selected: React.PropTypes.string,
    sourceData: React.PropTypes.arrayOf(React.PropTypes.object)
  };

  render() {
    const items = this.props.sourceData.map((item, index) => {
      return (
        <TreeViewItem selected={this.props.selected}
                      onClick={this.props.onItemClick}
                      item={item}
                      index={index}
                      collapsed
                      key={item.parent + index}/>
      );
    });

    return (
            <div className={styl.tree_view}>
                {items}
            </div>
    );
  }
}
