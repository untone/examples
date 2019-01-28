import React from 'react';
import cn from 'classnames';
import Tooltip from 'react-tooltip';
import Dropdown from 'react-widgets/lib/DropdownList';
import {bindAll} from 'common/utils';
import uniqueId from 'lodash.uniqueid';

import styl from './styles/rubrics';

import ActiveIcon from './icons/active';
import DefaultIcon from './icons/default';
import RemoveIcon from './icons/remove';

class Rubric extends React.Component {
  static propTypes = {
    rubrics: React.PropTypes.array,
    editRubric: React.PropTypes.func,
    head: React.PropTypes.bool,
    setHead: React.PropTypes.func,
    rubricId: React.PropTypes.number,
    index: React.PropTypes.number,
    id: React.PropTypes.string,
    remove: React.PropTypes.func,
    rubricsList: React.PropTypes.array
  };

  constructor(props) {
    super(props);
    let {head, rubricId, index, id} = props;
    this.state = {head, rubricId, index, id};

    bindAll(this, ['handleChange', 'toggleHead', 'remove']);
  }

  handleChange(value) {
    this.setState({rubricId: value.id}, () => this.props.editRubric(this.state));
  }

  toggleHead() {
    if (!this.state.head && this.state.rubricId !== undefined) this.props.setHead(this.props.id);
  }

  remove() {
    const rubrics = this.props.rubrics;
    let itemIndex = rubrics.findIndex(rubric => {
      return rubric.id === this.props.id;
    });

    this.props.remove(this.props.id);

    if (itemIndex > 0) {
      this.props.setHead(rubrics[itemIndex - 1].id);
    }
  }

  render() {
    return (
      <div className={styl.rubrics__container}>
        <Dropdown
          data={this.props.rubricsList}
          filter='startsWith'
          duration={50}
          value={this.state.rubricId}
          placeholder='Выбрать рубрику'
          textField='name'
          valueField='id'
          defaultOpen={false}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
        />
        {this.state.head &&
          <ActiveIcon
            data-tip='Главная рубрика'
            data-for='rubricTooltip'
            onClick={this.toggleHead}
            className={cn(styl.rubric__icon, styl.rubric__icon_active)}
          />
        }
        {this.state.rubricId !== undefined && !this.state.head &&
          <DefaultIcon
            data-tip='Назначить главную рубрику'
            data-for='rubricTooltip'
            onClick={this.toggleHead}
            className={styl.rubric__icon}
          />
        }
        {this.state.rubricId !== undefined &&
          <RemoveIcon
            data-tip='Убрать из этой рубрики'
            data-for='rubricTooltip'
            onClick={this.remove}
            className={styl.rubric__icon_remove}/>
        }
        <Tooltip
          id='rubricTooltip'
          offset={{top: -5}}
          effect='solid'
          class='tooltip'
          place='bottom'
        />
      </div>
    );
  }
}

export default class Rubrics extends React.Component {
  static propTypes = {
    rubricsList: React.PropTypes.array,
    head: React.PropTypes.number,
    rubrics: React.PropTypes.array,
    onChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    const {head, rubrics} = props;
    this.state = {head, rubrics};
    this.state.rubrics = this.state.rubrics.map(item => {
      const itemId = uniqueId('rubrics-item-id-');

      if (item === this.state.head) {
        this.state.headItem = itemId;
      }

      return { rubricId: item, id: itemId };
    });

    bindAll(this, ['editRubric', 'addEmptyElement', 'remove', 'setHead']);
  }

  componentWillMount() {
    this.addEmptyElement();
  }

  componentWillUpdate(nextProps, nextState) {
    this.addEmptyElement(nextState);
  }

  remove(id) {
    const rubrics = this.state.rubrics.filter(rubric => {
      return rubric.id !== id;
    });

    this.setState({rubrics}, () => {
      this.props.onChange('rubrics', this.state);
    });
  }

  setHead(id) {
    this.setState({headItem: id}, () => {
      this.props.onChange('rubrics', this.state);
    });
  }

  addEmptyElement(nextState) {
    let state = nextState ? nextState : this.state;
    let needNewEmpty = true;

    state.rubrics.forEach(rubric => {
      if (rubric.rubricId === undefined) {
        needNewEmpty = false;
      }
    });

    if (needNewEmpty) {
      const rubrics = [...state.rubrics, {}];
      this.setState({rubrics});
    }
  }

  editRubric(newRubric) {
    const targetRubricIndex = newRubric.index;
    const updatedRubric = Object.assign({}, this.state.rubrics[targetRubricIndex], newRubric);
    const rubrics = this.state.rubrics.map((rubric, index) => {
      if (index === targetRubricIndex) {
        return updatedRubric;
      }

      return rubric;
    });

    this.setState({rubrics}, () => {
      this.props.onChange('rubrics', this.state);
    });
  }

  rubricFabric() {
    return this.state.rubrics.map((rubric, index) => {
      const id = rubric.id || uniqueId('rubrics-item-id-');
      let isHead = id === this.state.headItem;

      return (
        <Rubric editRubric={this.editRubric}
                rubrics={this.state.rubrics}
                remove={this.remove}
                setHead={this.setHead}
                key={uniqueId('rubric-key-')}
                index={index}
                id={id}
                rubricId={rubric.rubricId}
                head={isHead}
                rubricsList={this.props.rubricsList}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <div className={styl.rubric__title}>Рубрики</div>
        {this.rubricFabric()}
      </div>
    );
  }
}

