import React, {PropTypes} from 'react';

import classNames from 'classnames/bind';

import IconH2 from './icons/toolbox/h2.svg';
import IconH3 from './icons/toolbox/h3.svg';
import IconBold from './icons/toolbox/bold.svg';
import IconItalic from './icons/toolbox/italic.svg';
import IconOL from './icons/toolbox/ol.svg';
import IconUL from './icons/toolbox/ul.svg';
import IconImage from './icons/toolbox/image.svg';
import IconVideo from './icons/toolbox/video.svg';
import IconLink from './icons/toolbox/link.svg';
import IconUnlink from './icons/toolbox/unlink.svg';

import style from './styles/editor.styl';

const cn = classNames.bind(style);

class StyleButton extends React.Component {
  static propTypes = {
    editorState: PropTypes.object,
    onToggle: PropTypes.func,
    active: PropTypes.bool,
    label: PropTypes.string,
    className: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    onUpdate: PropTypes.func
  }

  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.name);
    };
  }

  render() {
    let CLASSNAMES = {
      toolbar: cn({
        editor__toolbar_button: true,
        editor__toolbar_button_active: this.props.active
      }),
      sidebar: cn({
        editor__sidebar_button: true,
        editor__sidebar_button_active: this.props.active
      })
    };

    return (
      <div className={CLASSNAMES[this.props.type]} onMouseDown={this.onToggle}>
        {this.props.children}
      </div>
    );
  }
}

const BLOCK_TYPES = [
  {
    icon: <IconH2 width={44} height={44}/>,
    name: 'header-two'
  },
  {
    icon: <IconH3 width={44} height={44}/>,
    name: 'header-three'
  },
  {
    icon: <IconUL width={44} height={44}/>,
    name: 'unordered-list-item'
  },
  {
    icon: <IconOL width={44} height={44}/>,
    name: 'ordered-list-item'
  },
];

export const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className={style.editor__toolbar_section}>
      {BLOCK_TYPES.map((type, index) =>
        <StyleButton
          key={index.toString()}
          active={type.name === blockType}
          type={'toolbar'}
          onToggle={props.onToggle}
          name={type.name}>
          {type.icon}
        </StyleButton>
      )}
    </div>
  );
};

BlockStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

const INLINE_STYLES = [
  {
    icon: <IconBold width={44} height={44}/>,
    name: 'BOLD'
  },
  {
    icon: <IconItalic width={44} height={44}/>,
    name: 'ITALIC'
  }
];

export const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className={style.editor__toolbar_section}>
      {INLINE_STYLES.map((type, index) =>
        <StyleButton
          key={index.toString()}
          active={currentStyle.has(type.name)}
          type={'toolbar'}
          onToggle={props.onToggle}
          name={type.name}>
          {type.icon}
        </StyleButton>
      )}
    </div>
  );
};

InlineStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

const LINK_ICONS = {
  link: <IconLink width={44} height={44}/>,
  unlink: <IconUnlink width={44} height={44}/>
};

export const LinkControls = (props) => {
  return (
    <div className={style.editor__toolbar_section}>
      <StyleButton
        active={props.active}
        type={'toolbar'}
        onToggle={props.onToggle}>
        {LINK_ICONS[props.name]}
      </StyleButton>
      {props.children}
    </div>
  );
};

LinkControls.propTypes = {
  active: PropTypes.bool,
  name: PropTypes.string,
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

const MEDIA_ICONS = {
  image: <IconImage width={44} height={44}/>,
  video: <IconVideo width={44} height={44}/>
};

export const MediaControls = (props) => {
  return (
    <div className={style.editor__wrapper}>
      <StyleButton
        active={props.active}
        type={'sidebar'}
        onToggle={props.onToggle}>
        {MEDIA_ICONS[props.name]}
      </StyleButton>
      {props.children}
    </div>
  );
};

MediaControls.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

