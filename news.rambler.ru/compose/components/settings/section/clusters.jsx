import React from 'react';

import classNames from 'classnames/bind';
import styl from './styles/clusters';

import Dropdown from 'react-widgets/lib/DropdownList';

const cn = classNames.bind(styl);

const toggles = {
  selectedOption: 'new'
};

export default class Regions extends React.Component {
  constructor(props) {
    super(props);
    this.state = toggles;

    this.selectOption = this.selectOption.bind(this);
  }

  onChange(value) {
    this.setState({value: value});
  }

  handleSearch() {

  }

  selectOption(event) {
    this.setState({selectedOption: event.target.dataset.value});
  }

  render() {
    const addNewClassNames = cn({
      clusters__switcher__item: true,
      clusters__switcher__item_selected: this.state.selectedOption === 'new'
    });

    const useExistingClassNames = cn({
      clusters__switcher__item: true,
      clusters__switcher__item_selected: this.state.selectedOption === 'existing'
    });

    return (
      <div className={styl.clusters}>
        <div className={styl.clusters__title}>Кластеры</div>
        <div className={styl.clusters__switcher}>
          <div onClick={this.selectOption} data-value='new'
               className={addNewClassNames}>Создать новый</div>
          <div onClick={this.selectOption} data-value='existing'
               className={useExistingClassNames}>Добавить в существуюший</div>
        </div>
        {this.state.selectedOption === 'existing' ?
        <Dropdown
          className={styl.clusters__select}
          data={[
            {text: 'Политика', value: 0},
            {text: 'Мир', value: 1},
            {text: 'Игры', value: 2},
            {text: 'Китай', value: 3},
            {text: 'США', value: 4}
          ]}
          filter='startsWith'
          duration={50}
          value={this.state.value}
          placeholder='Выбрать рубрику'
          textField='text'
          valueField='value'
          defaultOpen={false}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
        /> : null}
      </div>
    );
  }
}
