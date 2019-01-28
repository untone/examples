import React from 'react';
import Spiner from '../../../../common/spinner/index';
import styl from './styles/index';
import cn from 'classnames';
import API from '../../../../common/api';
import WEBAPI from '../../../../common/webapi';
import Rubrics from './rubrics';
import Regions from './regions';
import Tagline from './tagline';
import Notification from 'common/notifications/index';

export default class Setting extends React.Component {
  static propTypes = {
    closePopup: React.PropTypes.func,
    settings: React.PropTypes.object
  };

  state = {
    ...this.props.settings,
    notification: null,
    tagsQuery: ''
  };

  componentDidMount() {
    Promise.all([API.Topic.fetch(), API.Region.fetch(), this.fetchTags()])
      .then(response => {
        this.setState({
          rubrics: response[0],
          regions: response[1],
          fetched: true
        });
      });
  }

  fetchTags = () => {
    return API.Tag.fetch({q: this.state.tagsQuery})
      .then(({result}) => {
        this.setState({tagline: result});
      });
  };

  onTagsSearch = value => {
    this.setState({tagsQuery: value}, this.fetchTags);
  };

  hideNotification = () => {
    this.setState({notification: null});
  };

  onFormChange = (field, value) => {
    if (field === 'regions') {
      this.setState({region_ids: value});
    } else if (field === 'tagline') {
      this.setState({tags: value});
    } else if (field === 'rubrics') {
      let head = value.rubrics.find(rubric => {
        return rubric.id === value.headItem;
      });

      const rubrics = value.rubrics
       .filter(rubric => (rubric.rubricId !== undefined))
       .map(rubric => (rubric.rubricId));

      this.setState({topic_ids: rubrics, topic_id: head && head.rubricId});
    }
  };

  closePopup = () => {
    this.props.closePopup();
  };

  onClick = event => {
    if (event.target.dataset.event === 'save') {
      this.setState({saving: true}, () => {
        const data = {
          clid: this.state.id,
          main_topic: this.state.topic_id,
          topics: this.state.topic_ids.filter(topic => (topic !== this.state.topic_id)),
          regions: this.state.region_ids,
          tags: this.state.tags.map(tag => tag.id)
        };

        WEBAPI.ClusterRelations.fetchJson(data)
          .then(({result}) => {
            let notification = null;

            if (result === 'ok') {
              notification = {
                message: 'Настройки успешно сохранены'
              };
            }

            this.setState({saving: false, notification});
          });
      });

      return;
    }

    this.props.closePopup();
  };

  render() {
    const {state} = this;
    if (!state.fetched || state.saving) {
      return (
        <div className={styl.container}>
          <Spiner/>
        </div>
      );
    }

    const notification = !state.notification ? null : (
      <Notification hide={this.hideNotification} {...state.notification}/>
    );

    return (
        <div className={styl.container}>
          <Rubrics rubrics={state.topic_ids}
                   head={state.topic_id}
                   rubricsList={state.rubrics.result}
                   onChange={this.onFormChange}/>
          <Regions onChange={this.onFormChange}
                   regions={state.region_ids}
                   regionsList={state.regions.result}/>
          <Tagline tagline={state.tags}
                   onChange={this.onFormChange}
                   onTagsSearch={this.onTagsSearch}
                   taglineList={state.tagline}/>
          <div className={styl.buttons_container}>
            <div onClick={this.onClick} data-event='save'
                 className={cn(styl.button, styl.button_save)}>Сохранить</div>
            <div onClick={this.onClick} data-event='close'
                 className={cn(styl.button, styl.button_cancel)}>Отменить</div>
          </div>
          {notification}
        </div>
    );
  }
}
