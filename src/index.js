import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Draw from './draw';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Draw />, document.getElementById('root'));
registerServiceWorker();
