import React from 'react';
import ReactDOM from 'react-dom';
import uri from 'urijs';
import API from 'common/api';
import Ajax from 'common/webapi';
import styl from './style';
import Spinner from 'common/spinner/index';
import Toolbar from './components/toolbar/toolbar';
import List from './components/list/list';
import Pager from 'common/pager/index';
import Treeview from './components/treeview/treeview';
import IndexPopup from './components/popups/indexPopup';
import Simple from 'common/popups/simple';
import {toInt} from 'common/utils';
import Notification from 'common/notifications/index';

const clustersPageLimit = 20;
const uriArgs = uri(window.location).search(true);

class App extends React.Component {
  static defaultProps = {
    alias: 'head',
    visible: 1,
    page: 0
  };

  state = {...this.props, notification: null};

  componentDidMount = () => {
    this.getData();
  };

  history = () => {
    let path = uri(window.location).search(this.query());
    window.history.pushState(null, null, path);
  };

  query = () => {
    return {
      alias: this.state.alias,
      visible: this.state.visible,
      limit: clustersPageLimit,
      page: toInt(uriArgs.page) || this.state.page
    };
  };

  getData = () => {
    return API.Cluster.fetch(this.query(), 'default', {}, 'default', 'c160x90')
        .then(response => {
          this.history();
          this.setState({data: response.result});
        });
  };

  refreshData = () => {
    return this.getData()
      .then(() => this.setState({notification: {message: 'Список кластеров обновлен'} }))
      .catch(error => {
        this.setState({
          notification: {
            type: 'error',
            message: `Ошибка обновления ${error}`
          }
        });
      });
  };

  changeTreeViewFilter = alias => {
    this.setState({alias: alias}, this.getData);
  };

  changeToolbarFilter = visible => {
    this.setState({visible: visible}, this.getData);
  };

  routePage = (pager) => {
    this.setState({page: pager.page}, this.getData);
  };

  editCluster = (event, cluster) => {
    event.stopPropagation();
    const query = {
      id: cluster.id,
      context: 'cluster',
      back: window.location.href
    };
    window.location.href = uri('/compose').query(query).toString();
  };

  editClusterList = (event, cluster) => {
    window.location.href = uri('/cluster').query({clid: cluster.id, back: window.location.href});
  };

  changePosition = (event, cluster) => {
    event.stopPropagation();
    this.setState({
      indexPopup: true,
      clusterToUpdate: cluster
    });
  };

  closeChangePosition = () => {
    this.setState({indexPopup: false});
  };

  acceptChangePosition = (newIndex, cluster) => {
    Ajax.ClusterPosition.fetchJson({alias: this.state.alias, clusters: [{id: cluster.id, pos: newIndex}]})
      .then(this.getData);
  };

  toggleHide = clustedId => {
    Ajax.ClusterStatus.fetchJson({clid: clustedId, hide: this.state.visible === 1})
      .then(this.getData);
  };

  deleteCluster = event => {
    event.stopPropagation();
    console.log('handler for delete cluster click');
  };

  openInNewTab = event => {
    event.stopPropagation();
  };

  hideNotification = () => {
    this.setState({notification: null});
  };

  render() {
    let topicsList = [];
    let listRegion = (<Spinner />);
    let modalPopup = null;
    let simplePopup = null;

    if (this.state.data) {
      let clustersList = this.state.data.map((cluster, index) => {
        const topics = cluster.topics.map(topic => ({name: topic.name, id: topic.id}));
        let pageIndex = this.state.page * 20;

        return {
          title: cluster.title,
          id: cluster.id,
          index: pageIndex + index + 1,
          image: cluster.image && cluster.image.url,
          clickPeriod: cluster.clickPeriod,
          clickDelta: cluster.clickTimedelta,
          time: cluster.ctime,
          source: cluster.resource.title,
          topics: topics,
          status: cluster.status,
          link: cluster.external_link,
          items: cluster.citems
        };
      });

      listRegion = (
        <List onClick={this.editClusterList}
              list={clustersList}
              visible={this.state.visible}
              buttonsEvents={{
                editClusterList: this.editClusterList,
                editCluster: this.editCluster,
                changePosition: this.changePosition,
                toggleHide: this.toggleHide,
                deleteCluster: this.deleteCluster,
                openInNewTab: this.openInNewTab
              }}
        />
      );
    }

    if (this.state.topics) {
      topicsList = this.state.topics;
    }

    if (this.state.indexPopup) {
      simplePopup = (
        <Simple close={this.closeChangePosition}
                displayCenter>
          <IndexPopup onCancel={this.closeChangePosition}
                      onAccept={this.acceptChangePosition}
                      currentObject={this.state.clusterToUpdate}/>
        </Simple>
      );
    }

    const notification = !this.state.notification ? null : (
      <Notification
        {...this.state.notification}
        hide={this.hideNotification}
      />
    );

    return (
            <div>
              {modalPopup}
              {simplePopup}
              <Toolbar
                refreshData={this.refreshData}
                changeToolbarFilter={this.changeToolbarFilter}
              />
              <div className={styl.main_region}>
                <Treeview
                  onItemClick={this.changeTreeViewFilter}
                  selected={this.state.alias}
                  sourceData={topicsList}
                />
                {listRegion}
              </div>
              <Pager
                page={this.state.page}
                onUpdate={this.routePage}
              />
              {notification}
            </div>
    );
  }
}

API.TopicTree.fetch().then(({result}) => {
  const topics = result.map(({parent, childs}) => {
    return {
      parent: {
        text: parent.name,
        alias: parent.alias,
        status: parent.status
      },
      childs: childs.map(({name, alias, status}) => ({alias, text: name, status}))
    };
  });

  ReactDOM.render(
        <App topics={topics} />,
        document.getElementById('root-app')
    );
});
