import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Self-hosted rather than pulled from Google. The `wght` axis build, not the
// package root: these families also ship wdth/opsz/ytlc/full variants (Nunito
// Sans full is 81kB against 31kB here) and nothing on this site varies width
// or optical size. Google was already serving the variable files, so these
// are byte-identical to what the page fetched before — a move, not a re-cut.
import '@fontsource-variable/fredoka/wght.css';
import '@fontsource-variable/nunito-sans/wght.css';

import './styles/global.css';
import './styles/flavors.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
