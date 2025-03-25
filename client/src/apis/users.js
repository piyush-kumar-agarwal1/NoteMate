import API_BASE_URL from './config.js';

export const signup = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    } catch (error) {
        console.error('User API error:', error);
        return { error: true };
    }
};

export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return response.json();
    } catch (error) {
        console.error('User API error:', error);
        return { error: true };
    }
};