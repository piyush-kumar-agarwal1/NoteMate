// Complete update to utils/localStorage.js to properly handle separate tab sessions

// Existing localStorage methods
const addToLocalStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

const getFromLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
    }
    return null;
};

const removeFromLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

// SessionStorage methods (tab-specific)
const addToSessionStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(value));
    }
};

const getFromSessionStorage = (key) => {
    if (typeof window !== 'undefined') {
        const value = sessionStorage.getItem(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
    }
    return null;
};

const removeFromSessionStorage = (key) => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
    }
};

// Helper methods that prioritize sessionStorage for auth data
const getAuthToken = () => {
    return getFromSessionStorage('auth_key');
};

const getUserId = () => {
    return getFromSessionStorage('user_id');
};

const getUserName = () => {
    return getFromSessionStorage('user_name');
};

// Export all methods
const localStorageUtils = {
    addToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    addToSessionStorage,
    getFromSessionStorage,
    removeFromSessionStorage,
    getAuthToken,
    getUserId,
    getUserName
};

export default localStorageUtils;