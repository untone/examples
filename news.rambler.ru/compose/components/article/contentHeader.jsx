import React from 'react';
import Textarea from 'react-textarea-autosize';
import classNames from 'classnames/bind';
import style from './styles/header.styl';
import theme from './styles/theme.styl';

const cn = classNames.bind(style);

export default class ContentHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'title',
      value: this.props.article.title,
      count: this.props.article.title.length
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.refs[this.state.name].focus();
  }

  handleChange(event) {
    let value = event.target.value;
    this.setState({
      value: value,
      count: value.length
    });
    this.props.onUpdate({
      article: {
        title: value
      }
    });
  }

  limitCounter() {
    const limit = 50;
    let delta = limit - this.state.count;
    let counterClassName = cn({
      editor__counter: true,
      editor__counter_on: this.state.count > 0,
      editor__counter_limit: this.state.count >= limit - 1,
      editor__counter_warn: delta >= 0 && delta <= 3
    });

    return (
      <span className={counterClassName}>
        {this.state.count}/{limit}
      </span>
    );
  }


  render() {
    return (
      <div className={style.editor__header}>
        {this.limitCounter()}
        <Textarea
          autoFocus
          ref={this.state.name}
          onChange={this.handleChange}
          className={classNames(style.editor__subject, theme.news__subject)}
          value={this.state.value}
          spellCheck={false}
          placeholder={'Добавить заголовок'}
          tabIndex={1}
        />
      </div>
    );
  }
}

ContentHeader.propTypes = {
  article: React.PropTypes.object,
  onUpdate: React.PropTypes.func
};
