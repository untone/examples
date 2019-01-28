/* CONSTRUCTORS */
import React from 'react';

/* UTILS */
import classNames from 'classnames/bind';

export default class CheckboxItem extends React.Component {
  static propTypes = {
    disableToggle: React.PropTypes.bool,
    checked: React.PropTypes.bool,
    children: React.PropTypes.element.isRequired,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    style: React.PropTypes.object,
    title: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.state = {
      checked: this.props.checked || false
    };
  }

  handleToggle(e) {
    if (this.props.disableToggle) {
      this.props.onClick();
      return;
    }

    if (e.type === 'click' || e.type === 'touchend' || e.type === 'keypress' && e.keyCode === 0) {
      this.props.onChange();
      this.setState({
        checked: !this.state.checked
      });
      e.preventDefault();
    }
  }

  render() {
    let cn = classNames.bind(this.props.style);
    let buttonClassName = cn({
      toolbox__button: true,
      toolbox__button_checked: this.state.checked
    });
    return (
      <button className={buttonClassName}
        data-tip={this.props.title}
        data-for='toolboxTooltip'
        disabled={this.props.disabled}
        onClick={!this.props.disabled && this.handleToggle}
        onKeyPress={!this.props.disabled && this.handleToggle}>
        {this.props.children}
      </button>
    );
  }
}
