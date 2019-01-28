import React from 'react';
import ReactDOM from 'react-dom';

import LeadsCalendar from './LeadsCalendar.jsx';
import Overlays from './overlays.jsx';
import store from './store';

import { Provider } from 'react-redux';

ReactDOM.render(<Provider store={store}><LeadsCalendar /></Provider>, document.getElementById('main'));
ReactDOM.render(<Provider store={store}><Overlays /></Provider>, document.getElementById('overlays'));
