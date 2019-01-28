import React from 'react';

import styl from './styles/regions';

import MultiSelect from 'react-widgets/lib/Multiselect';

export default class Regions extends React.Component {
  static propTypes = {
    regionsList: React.PropTypes.array,
    regions: React.PropTypes.array,
    onChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChange('regions', value.map(item => (item.id)));
  }

  render() {
    return (
      <div className={styl.regions}>
        <div className={styl.regions__title}>Регионы</div>
        <MultiSelect
          className={styl.regions__select}
          data={this.props.regionsList}
          defaultOpen={false}
          value={this.props.regions}
          filter='startsWith'
          duration={50}
          minLength={2}
          onChange={this.onChange}
          placeholder='Добавить'
          textField='name'
          valueField='id'/>
      </div>
    );
  }
}
