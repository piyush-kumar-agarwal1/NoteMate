const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

export default API_BASE_URL;