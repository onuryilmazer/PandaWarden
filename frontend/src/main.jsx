import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements, 
  Route
} from "react-router-dom";

import "./main.css";

import WebsiteWrapper from './pages/WebsiteWrapper.jsx';
import Index from './pages/Index.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scan from './pages/Scan.jsx';
import CreateScan from './pages/CreateScan.jsx';
import Login from './pages/Login.jsx';
import ProtectedPage from './components/ProtectedPage.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<WebsiteWrapper/>}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/createScan" element={<ProtectedPage><CreateScan /></ProtectedPage>} />
        <Route path="/scan/:id" element={<ProtectedPage><Scan /></ProtectedPage>} />
      </Route>      
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
