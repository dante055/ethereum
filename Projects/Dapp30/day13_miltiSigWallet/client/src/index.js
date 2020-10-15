import React from 'react';
import ReactDOM from 'react-dom';
import Load from './Load';
import './css/index.css';
import * as serviceWorker from './serviceWorker';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// ReactDOM.render(
//   <React.StrictMode>
//     <Load />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

ReactDOM.render(<Load />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
