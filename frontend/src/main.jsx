import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements, 
  Route
} from "react-router-dom";

import "./main.css";
import "./inputStyles.css";

import WebsiteWrapper from './pages/WebsiteWrapper.jsx';
import Index from './pages/public/Index.jsx';
import Login from './pages/public/Login.jsx';
import Signup from './pages/public/Signup.jsx';
import Error from './pages/public/Error.jsx';
import NotFound404 from './pages/public/404.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import Scan from './pages/user/Scan.jsx';
import CreateScan from './pages/user/CreateScan.jsx';
import ProtectedPage from './components/ProtectedPage.jsx';

import "./util/fixBackground.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<WebsiteWrapper/>}>
      <Route path='/' errorElement={<Error />}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/createScan" element={<ProtectedPage><CreateScan /></ProtectedPage>} />
        <Route path="/scan/:id" element={<ProtectedPage><Scan /></ProtectedPage>} />
        <Route path='*' element={<NotFound404/>} />
      </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
