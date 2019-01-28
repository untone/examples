import React from 'react';
import ReactDOM from 'react-dom';

import CalendarKanban from './CalendarKanban.jsx';
import Overlays from './Overlays.jsx';
import Clock from './Clock.jsx';

import store from './store/';

import { Provider } from 'react-redux';

ReactDOM.render(<Provider store={store}><CalendarKanban /></Provider>, document.getElementById('main'));
ReactDOM.render(<Provider store={store}><Overlays /></Provider>, document.getElementById('overlays'));
ReactDOM.render(<Clock />, document.getElementById('clock'));
