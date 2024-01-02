import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode'; 

const isAuthenticated = () => {
    const token = localStorage.getItem('token'); 

    if (token) {
        try {
            const decodedToken = jwtDecode(token);

            // Check if the token has expired
            const isTokenExpired = Date.now() >= decodedToken.exp * 1000;

            return !isTokenExpired; // Return true if the token is not expired, otherwise false
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    return false; // Return false if there's no token or an error occurred
};
