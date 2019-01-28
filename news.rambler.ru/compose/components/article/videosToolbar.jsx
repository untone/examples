/* CONSTRUCTORS */
import React from 'react';
import SimplePopup from 'common/popups/simple';
import MenuActions from './menuActions';
import {bindAll} from 'common/utils';
import IconHead from './icons/menu/set';

/* STYLES */
import styl from './styles/videoToolbar';

/* ICONS */
import MenuIcon from './icons/menu/dots';

export default class VideosToolbar extends React.Component {
  static propTypes = {
    togglePopup: React.PropTypes.func,
    head: React.PropTypes.bool,
    setHeadVideo: React.PropTypes.func,
    removeVideo: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    bindAll(this, ['toggleMenu']);
  }

  state = {
    isMenuOpen: false
  };

  toggleMenu() {
    this.setState({isMenuOpen: !this.state.isMenuOpen});
  }

  render() {
    let menu = (
      <SimplePopup className={styl.popup_wrapper} close={this.toggleMenu}>
        <MenuActions setHeadVideo={this.props.setHeadVideo}
                     togglePopup={this.props.togglePopup}
                     removeVideo={this.props.removeVideo}
        />
      </SimplePopup>
    );

    return (
      <div className={styl.video_toolbar}>
        {this.props.head ? <IconHead className={styl.video_toolbar__icon}/> : null}
        <MenuIcon onClick={this.toggleMenu} className={styl.video_toolbar__menu}/>
        {this.state.isMenuOpen ? menu : null}
      </div>
    );
  }
}
