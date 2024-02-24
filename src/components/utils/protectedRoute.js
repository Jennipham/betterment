import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import NoPermissions from '../views/noPermissions';

const isAuthenticated = () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return false; // No token present
    }

    try {
        const decodedToken = jwtDecode(token);

        // Check if the token has expired
        const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
        return !isTokenExpired; // Return true if the token is not expired, otherwise false
    } catch (error) {
        console.error('Error decoding token:', error);
        return false; // Return false in case of any decoding errors
    }
};

function ProtectedRoute({ children }) {
    const navigate = useNavigate();

    if (!isAuthenticated()) {
        navigate('/error', {replace : true});
        return <NoPermissions />; 
    }

    return children;
}

export default ProtectedRoute;
