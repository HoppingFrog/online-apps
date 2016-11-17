import React from 'react';
import { render } from 'react-dom';

const App1 = ({ children }) => (
  <div>{children}</div>
);

App1.propTypes = {
  children: React.PropTypes.node,
};

render(
  <App1>App `A`</App1>,
  document.getElementById('root'),
);
