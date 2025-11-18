import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import store from './store';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'https://automechbackend.dockyardsoftware.com/';
//axios.defaults.baseURL = 'http://localhost:60748/';
axios.defaults.headers.common['Content-Type'] = 'application/json';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);