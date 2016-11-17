import React from 'react';
import { render } from 'react-dom';

const App2 = ({ children }) => (
  <div>{children}</div>
);

App2.propTypes = {
  children: React.PropTypes.node,
};

render(
  <App2>Sub App B</App2>,
  document.getElementById('root'),
);
