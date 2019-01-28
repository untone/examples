import React, {PropTypes} from 'react';
import SourceMenu from './sourceMenu';
import SimplePopup from 'common/popups/simple';
import NewSource from './newSource';
import {bindAll} from 'common/utils';

import style from './styles/widget';

import IconHead from './icons/menu/set';

export default class ImageSource extends React.Component {
  static propTypes = {
    active: PropTypes.bool,
    cluster: PropTypes.number,
    current: PropTypes.object,
    images: PropTypes.array,
    onSwitch: PropTypes.func,
    dataList: PropTypes.array,
    onSourceEdited: PropTypes.func,
    onSourceChanged: PropTypes.func,
    updateHead: PropTypes.func,
    removeImage: PropTypes.func,
    disrankImage: PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['toggleNewSourcePopup', 'sourceEdited']);
  }

  state = {
    sourcePopupOpen: false
  };

  toggleNewSourcePopup() {
    this.setState({sourcePopupOpen: !this.state.sourcePopupOpen});
  }

  sourceEdited(data) {
    this.props.onSourceEdited(data);
    this.toggleNewSourcePopup();
  }

  render() {
    const current = this.props.current;
    const props = this.props;
    let currentSource = 'не задан';
    const simplePopup = (
      <SimplePopup displayCenter close={this.toggleNewSourcePopup}>
        <NewSource onSourceChanged={props.onSourceChanged}
                   onSave={this.sourceEdited}
                   current={current}
                   dataList={props.dataList}
        />
      </SimplePopup>
    );

    let newSourcePopup = this.state.sourcePopupOpen ? simplePopup : null;

    if (current.copy_title) {
      currentSource = current.copy_title;
    } else if (current.copy_url) {
      currentSource = current.copy_url;
    } else if (current.source_id) {
      currentSource = props.dataList && props.dataList.find(source => {
        return current.source_id === source.id;
      }).title;
    }

    return (
      <footer className={style.widget__footer}>
        {newSourcePopup}
        <div className={style.widget__source}>
          Источник:
        </div>
        {currentSource}
        {current.head ? <IconHead className={style.widget__dropdown_icon}/> : null}
        <SourceMenu cluster={props.cluster}
                    current={current}
                    removeImage={props.removeImage}
                    images={props.images}
                    openNewSourcePopup={this.toggleNewSourcePopup}
                    onSwitch={props.onSwitch}
                    updateHead={props.updateHead}
                    disrankImage={props.disrankImage}
        />
      </footer>
    );
  }
}
