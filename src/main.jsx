import React from 'react';
import { createRoot } from 'react-dom/client';
import KnowledgeHub from './KnowledgeHub.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KnowledgeHub />
  </React.StrictMode>
);
