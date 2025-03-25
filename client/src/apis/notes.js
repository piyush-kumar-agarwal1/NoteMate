const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAllNotes = async (token) => {
    try {
        const response = await fetch(`${API_URL}/notes/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Notes API error:', error);
        return { error: true };
    }
};

export const createNote = async (noteData, token) => {
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(noteData),
        });
        return response.json();
    } catch (error) {
        console.error('Notes API error:', error);
        return { error: true };
    }
};

export const updateNote = async (noteData, token) => {
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(noteData),
        });
        return response.json();
    } catch (error) {
        console.error('Notes API error:', error);
        return { error: true };
    }
};

export const deleteNote = async (noteId, token) => {
    try {
        const response = await fetch(`${API_URL}/notes?id=${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Notes API error:', error);
        return { error: true };
    }
};