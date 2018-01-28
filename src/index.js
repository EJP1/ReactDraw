import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import Draw from './draw';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Draw />, document.getElementById('root'));
registerServiceWorker();
