import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import URI from 'urijs';
import {Editor, EditorState, CompositeDecorator, Entity, RichUtils} from 'draft-js';
import {convertFromHTML} from 'draft-convert';
import {stateToHTML} from 'draft-js-export-html';
import {BlockStyleControls, InlineStyleControls, LinkControls, MediaControls} from './contentToolbar';
import ImageSlider from './imageSlider';
import utils from 'draftjs-utils';
import {getSelectionRange, getSelectionCoords, getSelectedBlockElement} from './utils';
import Switch from 'common/switch/index';
import 'setimmediate';
import style from './styles/editor.styl';
import theme from './styles/theme.styl';

const cn = classNames.bind(style);

function mediaBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false,
    };
  }
  return null;
}

const Image = props => {
  return (
    <img src={props.src} style={style.media} />
  );
};

const Video = props => {
  return (
    <video
      controls
      src={props.src}
      style={style.media}
    />);
};

Image.propTypes = {
  src: PropTypes.string
};

Video.propTypes = {
  src: PropTypes.string
};

const Media = props => {
  let entity = Entity.get(props.block.getEntityAt(0));
  let {src} = entity.getData();
  let type = entity.getType();

  let media;
  if (type === 'image') {
    media = <Image src={src} />;
  } else if (type === 'video') {
    media = <Video src={src} />;
  }

  return media;
};

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      let entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = props => {
  let {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url}>{props.children}</a>
  );
};

Link.propTypes = {
  children: PropTypes.array,
  entityKey: PropTypes.string,
  decoratedText: PropTypes.string,
};

export default class ContentEditor extends Component {
  static propTypes = {
    article: PropTypes.object,
    images: React.PropTypes.array,
    context: React.PropTypes.string,
    editorState: PropTypes.object,
    onToggle: PropTypes.func,
    onUpdate: PropTypes.func
  };

  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    let {text} = this.props.article || '';
    let articleState = text.length
      ? EditorState.createWithContent(convertFromHTML(text), decorator)
      : EditorState.createEmpty(decorator);

    this.state = {
      toolbar: false,
      toolbarTop: 0,
      toolbarOpacity: 0,
      sidebar: false,
      sidebarTop: 0,
      sidebarOpacity: 0,
      showImageForm: false,
      showLinkForm: false,
      link: {
        url: '',
        target: '_blank',
        rel: 'external'
      },
      image: '',
      video: '',
      editorState: articleState,
      coords: {}
    };

    this.focus = (event) => this._handleFocus(event);
    this.blur = (event) => this._handleBlur(event);
    this.onChange = (editorState) => this._handleChange(editorState);
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (name) => this._toggleInlineStyle(name);

    this.getCurrentEntityKey = this._getCurrentEntityKey.bind(this);
    this.getCurrentEntity = this._getCurrentEntity.bind(this);
    this.hasEntity = this._hasEntity.bind(this);

    this.hadleLink = this._hadleLink.bind(this);
    this.handleURL = this._handleURL.bind(this);
    this.confirmLink = this._confirmLink.bind(this);
    this.cancelLink = this._cancelLink.bind(this);
    this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
    this.removeLink = this._removeLink.bind(this);

    this.handleDocumentClick = this._handleDocumentClick.bind(this);
    this.handleUpdate = this._handleUpdate.bind(this);
    this.handleToolbar = this._handleToolbar.bind(this);
    this.handleTarget = this._handleTarget.bind(this);
    this.resetLink = this._resetLink.bind(this);
    this.handleImage = this._handleImage.bind(this);
    this.handleImageSlider = this._handleImageSlider.bind(this);
    this.handleSidebar = this._handleSidebar.bind(this);
  }

  componentDidMount() {
    this.toolbar = ReactDOM.findDOMNode(this.refs.toolbar);
    this.sidebar = ReactDOM.findDOMNode(this.refs.sidebar);
    this.slider = ReactDOM.findDOMNode(this.refs.slider);
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.toolbar !== this.state.toolbar) {
      this.handleToolbar();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  _handleDocumentClick() {
    this.setState({
      toolbar: false
    });
  }

  _getCurrentEntityKey() {
    let {editorState} = this.state;
    let selection = editorState.getSelection();
    let anchorKey = selection.getAnchorKey();
    let contentState = editorState.getCurrentContent();
    let anchorBlock = contentState.getBlockForKey(anchorKey);
    let offset = selection.anchorOffset;
    let index = selection.isBackward ? offset - 1 : offset;
    return anchorBlock.getEntityAt(index);
  }

  _getCurrentEntity() {
    let entityKey = this.getCurrentEntityKey();
    if (entityKey) {
      return Entity.get(entityKey);
    }
    return null;
  }

  _hasEntity(entityType) {
    let entity = this.getCurrentEntity();
    if (entity && entity.getType() === entityType) {
      return true;
    }
    return false;
  }

  _handleFocus() {
    this.setState({
      toolbar: true
    });
    this._handleToolbar();
    this.refs.editor.focus();
  }

  _handleBlur() {
    this.setState({
      toolbar: false
    });
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _hadleLink() {
    let {editorState} = this.state;
    let {link} = this.state;
    let selection = editorState.getSelection();
    let entity;
    if (this.hasEntity('LINK')) {
      entity = this.getCurrentEntity();
      link = entity.getData();
    }
    if (!selection.isCollapsed()) {
      this.setState({
        showLinkForm: true,
        toolbar: true,
        link: link
      }, () => {
        setTimeout(() => {
          this.refs.urlInput.style.top = this.state.coords.offsetTop + 'px';
          this.refs.url.focus();
        }, 0);
      });
    }
  }

  _handleTarget() {
    let {target} = this.state.link;
    let newTarget;
    if (target === '_blank') {
      newTarget = '';
    } else {
      newTarget = '_blank';
    }
    this.setState({
      link: merge(this.state.link, {target: newTarget})
    });
  }

  _handleURL(event) {
    this.setState({
      link: merge(this.state.link, {url: event.target.value})
    });
  }

  _confirmLink() {
    let {editorState, link} = this.state;
    let data = {
      url: link.url,
      target: link.target === '_blank' ? link.target : null,
      rel: new URI(link.url).domain() !== 'news.rambler.ru' ? 'external' : null
    };
    let entityKey = Entity.create('LINK', 'MUTABLE', data);
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
      showLinkForm: false,
      link: {
        url: '',
        target: true,
        rel: 'external'
      }
    });
    this.handleUpdate();
  }

  _cancelLink() {
    this.resetLink();
  }

  _resetLink() {
    this.setState({
      showLinkForm: false,
      link: {
        url: '',
        target: true,
        rel: 'external'
      },
    });
  }

  _onLinkInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmLink(e);
    }
  }

  _removeLink() {
    let {editorState} = this.state;
    let selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }

  _handleToolbar() {
    if (this.toolbar) {
      let range = getSelectionRange();
      let coords = range && getSelectionCoords(getSelectionRange());
      this.setState({
        coords: coords
      }, () => {
        setTimeout(() => {
          if (range && !range.collapsed) {
            this.setState({
              toolbarTop: coords.offsetTop,
              toolbarOpacity: 1
            });
          } else {
            this.setState({
              toolbarOpacity: 0
            });
          }
        }, 50);
      });
    }
  }

  _handleSidebar() {
    let sidebar;
    let element;
    if (this.props.context === 'cluster' && !this.state.showImageForm) {
      sidebar = ReactDOM.findDOMNode(this.refs.sidebar);
      element = getSelectedBlockElement();
      if (!element || !sidebar) {
        return;
      }
      this.setState({
        sidebarTop: getSelectionCoords(element).offsetTop,
        sidebarOpacity: 1
      });
    }
  }

  _handleKeyCommand(command) {
    let {editorState} = this.state;
    let newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _handleChange(editorState) {
    let selection = editorState.getSelection();
    let selectedBlock = utils.getSelectedBlock(editorState);
    this.setState({
      editorState: editorState,
      toolbar: selection && !selection.isCollapsed(),
      sidebar: !selectedBlock.text.length
    }, () => {
      this.handleUpdate();
      this.handleSidebar();
    });
  }

  _handleUpdate() {
    // const selectedBlock = utils.getSelectedBlock(editorState);
    this.props.onUpdate({
      article: {
        text: stateToHTML(this.state.editorState.getCurrentContent())
      }
    });
  }

  _handleImage() {
    this.setState({
      showImageForm: !this.state.showImageForm
    });
  }

  _handleImageSlider(index) {
    this.setState({image: this.props.images[index]});
  }

  render() {
    let {editorState} = this.state;

    let toolbarClassName = cn({
      editor__toolbar: true,
      editor__toolbar_visible: this.state.toolbar
    });

    let sidebarClassName = cn({
      editor__sidebar: true,
      editor__sidebar_visible: this.state.sidebar
    });

    let isURL = new URI(this.state.link.url).domain();

    let urlClassName = cn({
      editor__popup_input: true,
      invalid: !isURL
    });

    let urlPopupClassName = cn({
      editor__popup: true,
      editor__popup_visible: this.state.showLinkForm
    });

    let imgPopupClassName = cn({
      editor__slider: true,
      'widget': true,
      editor__slider_visible: this.state.showImageForm
    });

    let urlInput;
    let imageInput;

    if (this.state.showLinkForm) {
      urlInput = (
        <form ref='urlInput' className={urlPopupClassName}>
          <div className={style.editor__popup_title}>
            Создать ссылку
          </div>
          <div className={style.editor__popup_form}>
            <input
              ref='url'
              className={urlClassName}
              type='text'
              tabIndex={1}
              value={this.state.link.url}
              onChange={this.handleURL}
              autoComplete='off'
              onKeyDown={this.onLinkInputKeyDown}
            />
            <Switch
              label={'В новом окне'}
              initChecked={this.state.link.target === '_blank'}
              tabIndex={1}
              onChange={this.handleTarget}
            />
          </div>
          <div className={style.editor__popup_footer}>
            <button
              className={cn(style.editor__popup_button, style.editor__popup_button_save)}
              onMouseDown={this.confirmLink}>
              Создать ссылку
            </button>
            <button
              className={cn(style.editor__popup_button, style.editor__popup_button_cancel)}
              onMouseDown={this.cancelLink}>
              Отменить
            </button>
          </div>
        </form>
      );
    }

    if (this.state.showImageForm) {
      imageInput = (
        <div
          ref='slider'
          className={imgPopupClassName}
          style={{top: `${this.state.sidebarTop}px`}}>
          <div className={style.editor__widget}>
            <ImageSlider
              images={this.props.images}
              onUpdate={this.handleImageSlider}
            />
          </div>
        </div>
      );
    }

    return (
      <div id='editor' className={style.editor}>
        <aside
          ref='toolbar'
          className={toolbarClassName}
          style={{top: `${this.state.toolbarTop}px`, opacity: this.state.toolbarOpacity}}>
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <LinkControls
            name='link'
            active={this.hasEntity('LINK')}
            editorState={editorState}
            onToggle={this.hadleLink}
          />
          <LinkControls
            name='unlink'
            active={this.hasEntity('LINK')}
            editorState={editorState}
            onToggle={this.removeLink}
          />
        </aside>
        <aside
          ref='sidebar'
          style={{top: `${this.state.sidebarTop}px`, opacity: this.state.sidebarOpacity}}
          className={sidebarClassName}>
          <MediaControls
            name='image'
            active={this.state.showImageForm}
            editorState={editorState}
            onToggle={this.handleImage}
          />
          <MediaControls
            name='video'
            editorState={editorState}
            onToggle={this.handleVideo}
          />
        </aside>
        {urlInput}
        {imageInput}
        <div className={classNames(style.editor__body, theme.news__editor)}
          onClick={this.focus}>
          <Editor
            editorState={editorState}
            blockRendererFn={mediaBlockRenderer}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            ref='editor'
            spellCheck={false}
          />
        </div>
      </div>
    );
  }
}
