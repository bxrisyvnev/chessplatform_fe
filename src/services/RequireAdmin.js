import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function RequireAdmin({ children }) {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isAdmin = Array.isArray(user?.roles) && user.roles.includes('Admin');

    return isAdmin
        ? children
        : React.createElement(Navigate, { to: '/', replace: true });
}

RequireAdmin.propTypes = {
    children: PropTypes.node.isRequired,
};
