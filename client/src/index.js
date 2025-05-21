import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createBrowserRouter, RouterProvider } from "react-router-dom" ;

import Client from './pages/Client';
import Admin from './pages/Admin';

const router = createBrowserRouter([
    {
        path: "/admin",
        element: <Admin />
    },
    {
        path: "/client",
        element: <Client />
    },
    {
        path: "/app",
        element: <App />
    }
    ,
    {
        path: "/test",
        element: <test />
    }

])

ReactDOM.render(<RouterProvider router={router} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
