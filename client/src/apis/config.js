const hostname = window.location.hostname;
console.log('Current hostname:', hostname);
console.log('API URL used:', hostname === 'localhost' ? 'http://localhost:3001/api' : '/api');

const API_BASE_URL = hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

export default API_BASE_URL;