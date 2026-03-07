import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';

// Point d’entrée de l’application React.
// On monte le composant principal App dans l’élément HTML #root.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);