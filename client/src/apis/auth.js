const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getMe = async (token) => {
    try {
        const response = await fetch(`${API_URL}/auth`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Auth API error:', error);
        return { error: true };
    }
};