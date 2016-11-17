import React from 'react';
import { render } from 'react-dom';

const App = ({ children }) => (
  <div>{children}</div>
);

App.propTypes = {
  children: React.PropTypes.node,
};

render(
  <App>Main App</App>,
  document.getElementById('root'),
);
