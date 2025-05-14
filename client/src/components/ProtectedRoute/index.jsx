import React from 'react';
import {Navigate} from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({children}) => {
    let token = Cookies.get('jwtToken');

    return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;