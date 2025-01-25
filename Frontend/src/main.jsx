import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {Provider} from 'react-redux'
import store from './redux/store'
import './index.css'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
