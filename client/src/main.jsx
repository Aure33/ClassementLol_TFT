import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ClassementTFT from './components/ClassementTFT';
import ClassementLol from './components/ClassementLol';
import Menu from './components/Menu';
import './css/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route exact path="/ClassementIUT/" element={<Menu />} />
        <Route exact path="/ClassementIUT/LoL" element={<ClassementLol />} />
        <Route path="/ClassementIUT/TFT" element={<ClassementTFT />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
