import React from 'react';
import MultiSelect from 'react-widgets/lib/Multiselect';
import debounce from 'lodash.debounce';

import styl from './styles/tagline';

export default class Tagline extends React.Component {
  static propTypes = {
    taglineList: React.PropTypes.array,
    tagline: React.PropTypes.array,
    onChange: React.PropTypes.func,
    onTagsSearch: React.PropTypes.func
  };

  onChange = value => {
    this.props.onChange('tagline', value);
  };

  onSearch = value => {
    this.props.onTagsSearch(value);
  };

  render() {
    return (
      <div className={styl.tagline}>
        <div className={styl.tagline__title}>Теги</div>
        <MultiSelect
          className={styl.tagline__select}
          data={this.props.taglineList}
          value={this.props.tagline}
          filter='startsWith'
          onSearch={debounce(this.onSearch, 1000)}
          duration={50}
          minLength={2}
          onChange={this.onChange}
          placeholder='Добавить'
          textField='text'
          valueField='id'/>
      </div>
    );
  }
}
