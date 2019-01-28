/* CONSTRUCTORS */
import React from 'react';
import cn from 'classnames';
import Dropdown from 'react-widgets/lib/DropdownList';
import {bindAll} from 'common/utils';

/* STYLES */
import styl from './styles/newSource';

export default class NewSource extends React.Component {
  static propTypes = {
    onSave: React.PropTypes.func,
    closePopup: React.PropTypes.func,
    dataList: React.PropTypes.array,
    current: React.PropTypes.object,
    onSourceChanged: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['listValueChanged', 'onUpdate']);
  }

  state = {
    copy_title: this.props.current.copy_title || '',
    copy_url: this.props.current.copy_url || '',
    source_id: this.props.current.source_id || 0,
    id: this.props.current.id
  };

  onUpdate(event) {
    const field = event.target.dataset.id;
    this.setState({[field]: event.target.value});
  }

  listValueChanged(value) {
    this.setState({source_id: value.id});
  }

  render() {
    return (
      <div className={styl.new_source__container}>
        <div className={styl.new_source__title}>
          Редактирование источника
        </div>
        <div className={styl.new_source__row}>
          <div className={styl.new_source__title_input}>Наименование</div>
          <input autoFocus
                 className={styl.input}
                 value={this.state.copy_title}
                 data-id='copy_title'
                 onChange={this.onUpdate}
                 placeholder='Добавить наименование'/>
        </div>
        <div className={styl.new_source__row}>
          <div className={styl.new_source__title_input}>URL</div>
          <input data-id='copy_url'
                 className={styl.input}
                 value={this.state.copy_url}
                 placeholder='Добавить URL'
                 onChange={this.onUpdate}/>
        </div>
        <div className={styl.new_source__row}>
          <div className={styl.new_source__title_input}>Источники</div>
          <Dropdown
            data={this.props.dataList}
            duration={50}
            value={this.state.source_id}
            placeholder='Добавить'
            textField='title'
            valueField='id'
            onChange={this.listValueChanged}
          />
        </div>
        <div className={styl.new_source__buttons_bar}>
          <div onClick={() => this.props.onSave(this.state)}
               className={cn(styl.button, styl.button_save)}>
            Сохранить
          </div>
          <div onClick={this.props.closePopup}
               className={cn(styl.button, styl.button_cancel)}>
            Отменить
          </div>
        </div>
        </div>
    );
  }
}
