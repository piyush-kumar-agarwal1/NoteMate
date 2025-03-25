const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const signup = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users/signup`, {
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
        const response = await fetch(`${API_URL}/users/login`, {
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