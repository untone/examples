import React from 'react';
import ReactDOM from 'react-dom';
import API from 'common/api';
import {capitalize} from 'common/utils';
import Spinner from 'common/spinner';
import constants from './constants';
import moment from 'moment';
import locale from 'moment/locale/ru';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import uri from 'urijs';
import 'core-js/library/fn/object/values';
import {List} from 'immutable';
import Notification from 'common/notifications/index';

import Article from './components/article';
import Aside from './components/aside';
import Footer from './components/footer';

import editor from './style';

const uriArgs = uri(window.location).search(true);

moment.updateLocale('ru', locale);
momentLocalizer(moment);
module.hot && module.hot.accept();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.today = new Date();
    this.state = {
      touched: false,
      new: {
        id: '',
        ctime: moment(this.today).unix(),
        ptime: moment(this.today).unix(),
        mtime: moment(this.today).unix(),
        title: '',
        image: {
        },
        annotation: '',
        resource_id: '',
        url: '',
        type: {
          id: '',
          name: ''
        },
        'text': ''
      },
      article: {},
      context: uriArgs.context !== undefined ? uriArgs.context : 'item',
      notification: null
    };
  }

  componentDidMount() {
    this.fetchArticle();
  }

  fetchArticle(clusterize, newClusterId) {
    const context = clusterize ? 'cluster' : this.state.context;
    const id = newClusterId ? newClusterId : uriArgs.id;
    let toggles = constants.toggles[context];

    if (id !== undefined) {
      return API[capitalize(context)].fetchOne(id, {}, 'full', '500x1000')
        .then(({result}) => {
          const article = result[0];
          toggles = {
            comments: {...toggles.comments, checked: !article.no_comments},
            export: {...toggles.export, checked: !article.to_rss},
            invisible: {...toggles.invisible, checked: !article.is_active},
            fulltext: {...toggles.fulltext, checked: article.fulltext_status}
          };

          this.setState({article, toggles, context});
          return {result: 'ok'};
        });
    }

    return Promise.resolve(this.setState({article: this.state.new}));
  }

  handleArticleUpdate = object => {
    const article = {...this.state.article, ...object.article};
    this.setState({article, touched: !this.state.touched});
  };

  handleImageUpload = image => {
    if (this.state.context === 'item') {
      this.setState({
        article: {
          ...this.state.article,
          image_id: image.id
        }
      });

      return;
    }

    const images = this.state.article.images || [];

    this.setState({
      article: {
        ...this.state.article,
        images: [...images, image]
      }
    });
  };

  disrankImage = imageId => {
    const images = this.state.article.images.map(image => {
      if (image.id === imageId) {
        return {
          ...image,
          from_item: false,
          disranked: true
        };
      }
      return image;
    });

    this.setState({
      article: {
        ...this.state.article,
        images
      }
    });
  };

  handleVideoUpload = videoId => {
    const immutableVideos = List(this.state.article.video_ids);
    const videos = immutableVideos.unshift(videoId).toArray();

    this.setState({
      article: {
        ...this.state.article,
        video_ids: videos
      }
    });
  };

  handleArticleSave = clusterize => {
    const {article, context, toggles} = this.state;
    const payload = {
      shared: {
        title: article.title,
        text: article.text,
        url: article.url,
        annotation: article.annotation,
        fulltext_status: toggles.fulltext.checked,
        resource_id: article.resource_id,
        is_active: !toggles.invisible.checked,
      },
      item: {
        item_id: article.id,
        make_cluster: clusterize || false,
        to_scraper: false,
        to_rss: toggles.export.checked,
        image_id: article.image_id
      },
      cluster: {
        clid: article.id,
        short_title: article.short_title,
        original_title: article.original_title,
        no_comments: !toggles.comments.checked,
        videos: article.video_ids,
        mvideo: article.mvideo_id,
        mimage: article.mimage,
        images: context === 'cluster' && article.images.filter(image => !image.from_item).map(image => image.id)
      }
    };

    API[capitalize(context)].update({...payload.shared, ...payload[context]})
      .then(response => {
        if (!response.ok) {
          this.setState({
            notification: {
              type: 'error',
              message: `Во время сохранения произошла ошибка.
              Повторите попытку или обратитесь к админинистратору`
            }
          });
        }

        return response.json();
      })
      .then(response => {
        const clusterId = response.cluster_id;

        if (response.result === 'ok') {
          const target = context === 'cluster' ? 'кластера' : 'новости';

          if (clusterize) {
            this.fetchArticle(clusterize, clusterId).then(fetchArticle => {
              if (fetchArticle.result === 'ok') {
                window.history.pushState({}, '', `compose?id=${clusterId}&context=cluster`);
                this.setState({
                  notification: {
                    message: `Сохранение ${target} прошло успешно, теперь эта новость стала кластером`
                  },
                  touched: false
                });
              }
            });
          } else {
            this.setState({
              notification: {
                message: `Сохранение ${target} прошло успешно`
              },
              touched: false
            });
          }
        }

        if (context === 'cluster') {
          let images = this.state.article.images;
          if (images.length > 0) {
            images = images.map(image => {
              if (image.disranked) {
                return {
                  ...image,
                  disranked: false
                };
              }

              return image;
            });

            this.setState({
              article: {
                ...this.state.article,
                images
              }
            });
          }
        }
      });
  };

  handleArticleReset = () => {
    this.setState({article: {}}, () => {
      this.fetchArticle();
    });
  };

  handleTogglesUpdate = state => {
    const toggles = {...this.state.toggles, ...state.toggles};
    this.setState({toggles});
  };

  handleRemoveVideo = videos => {
    this.setState({
      article: {
        ...this.state.article,
        video_ids: videos
      }
    });
  };

  hide = () => {
    this.setState({notification: null});
  };

  render() {
    const articleExists = Object.keys(this.state.article).length;
    const article = articleExists ? this.state.article : this.state.new;
    const toggles = {...constants.toggles[this.state.context], ...this.state.toggles};
    const context = this.state.context;
    const notification = !this.state.notification ? null : (
      <Notification
        {...this.state.notification}
        hide={this.hide}
      />
    );

    if (!articleExists) {
      return (
        <div className={editor.wrap}>
          <Spinner />
        </div>
      );
    }

    return (
      <div>
        <div className={editor.wrap}>
          <Article
            article={article}
            context={context}
            onVideoUpload={this.handleVideoUpload}
            handleRemoveVideo={this.handleRemoveVideo}
            onUpload={this.handleImageUpload}
            onUpdate={this.handleArticleUpdate}
            disrankImage={this.disrankImage}
          />
          <Aside
            article={article}
            toggles={toggles}
            context={context}
            onArticleUpdate={this.handleArticleUpdate}
            onTogglesUpdate={this.handleTogglesUpdate}
          />
          <Footer
            context={context}
            article={article}
            onSave={this.handleArticleSave}
            onReset={this.handleArticleReset}
          />
          {notification}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root-app')
);
