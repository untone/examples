import React from 'react';
import Dropdown from 'react-widgets/lib/DropdownList';
import API from 'common/api.jsx';
import style from './asideSource.styl';

export default class AsideSource extends React.Component {
  static propTypes = {
    defaultQuery: React.PropTypes.object,
    id: React.PropTypes.string,
    label: React.PropTypes.string,
    value: React.PropTypes.object,
    onUpdate: React.PropTypes.func,
    article: React.PropTypes.object
  };

  state = {
    resources: [this.props.value],
    value: this.props.value
  };

  componentDidMount() {
    return this.fetchResources(this.props.defaultQuery);
  }

  handleSearch = searchStr => {
    let query = Object.assign(this.props.defaultQuery, {q: searchStr});
    return this.fetchResources(query);
  };

  handleChange = value => {
    this.setState({value});
    this.props.onUpdate({
      article: {
        ...this.props.article,
        resource_id: value.id,
        url: ''
      }
    });
  };

  fetchResources(query) {
    return API.Resource.fetch(query)
      .then(response => {
        const data = Object.assign(this.state, {resources: response.result});
        this.setState(data);
      });
  }

  render() {
    return (
      <fieldset className={style.aside__fieldset}>
        <label className={style.aside__label}>
          {this.props.label}
        </label>
        <Dropdown
          data={this.state.resources}
          filter='startsWith'
          duration={50}
          minLength={2}
          value={this.state.value}
          placeholder='Добавить'
          textField='name'
          valueField='id'
          defaultOpen={false}
          defaultValue={[this.props.value]}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
        />
      </fieldset>
    );
  }
}
