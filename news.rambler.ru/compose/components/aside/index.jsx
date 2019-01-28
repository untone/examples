/* CONSTRUCTORS */
import React from 'react';

/* COMPONENTS */
import Toolbox from '../toolbox';
import TextArea from 'common/editors/textarea/index';
import AsideSource from './asideSource';

/* STYLES */
import aside from './style';

export default class Aside extends React.Component {
  static propTypes = {
    article: React.PropTypes.object,
    context: React.PropTypes.string,
    onArticleUpdate: React.PropTypes.func,
    onTogglesUpdate: React.PropTypes.func,
    toggles: React.PropTypes.object,
  };

  handleUpdate = value => {
    this.props.onArticleUpdate({
      article: {
        ...this.props.article,
        [Object.keys(value)[0]]: Object.values(value)[0]
      },
    });
  };

  render() {
    const {article, toggles, context} = this.props;
    const {ctime, ptime, mtime, id, region_ids, tags, topic_id, topic_ids} = article;
    const time = {ctime, ptime, mtime};
    const settings = {id, region_ids, tags, topic_id, topic_ids};

    return (
      <div className={aside.aside}>
        {article.original_title !== undefined &&
          <TextArea
            id={'title'}
            placeholder={'Оригинальный заголовок'}
            readonly
            value={article.title}
          />
        }
        {article.short_title !== undefined &&
          <TextArea
            id={'short_title'}
            limit={50}
            placeholder={'Короткий заголовок'}
            value={article.short_title}
            onChange={this.handleUpdate}
          />
        }
        <TextArea
          id={'annotation'}
          limit={100}
          placeholder={'Аннотация'}
          onChange={this.handleUpdate}
          value={article.annotation}
        />
        <AsideSource
          id={'resource'}
          article={this.props.article}
          label={'Источник'}
          defaultQuery={{limit: 500, status: 'active'}}
          placeholder={'Добавить источник'}
          onUpdate={this.props.onArticleUpdate}
          value={article.resource}
        />
        <TextArea
          id={'url'}
          placeholder={'Ссылка на источник'}
          limit={255}
          value={article.url}
          required
          errorMessage={'Поле обязательно для заполнения'}
          onChange={this.handleUpdate}
        />
        <Toolbox
          time={time}
          settings={settings}
          toggles={toggles}
          context={context}
          onUpdate={this.props.onTogglesUpdate}
        />
      </div>
    );
  }
}
