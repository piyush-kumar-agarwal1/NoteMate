import API_BASE_URL from './config.js';

export const getMe = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
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