import React from 'react';
import { createRoot } from 'react-dom/client';
import Marketplace from './marketplace';
import './style.css';
import './marketplace.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><Marketplace /></React.StrictMode>);
