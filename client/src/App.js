import React from 'react';
import { Switch, Route } from 'react-router-dom';

import About from './components/about';
import Home from './components/home';

function App() {
  return (
    <div>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
      </Switch>
    </div>
  );
}

export default App;