import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './notes.module.scss';
import Greeting from '../../components/atoms/greeting';
import Note from '../../components/cards/note';
import Dashboard from '../../components/dashboard';
import Wrapper from '../../components/hoc/wrapper';
import utils from '../../utils/localStorage';
import types from '../../config/types';
import notesData from '../../data/notes.json';
import { toast } from 'react-toastify';
import { getAllNotes } from '../../apis/notes';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  const location = useLocation();

  const { searchTerm = '', refreshTrigger = 0, triggerRefresh, initialLoad = false } = useOutletContext() || {};

  // Check if we should be in dashboard view
  const viewMode = utils.getFromLocalStorage('view_mode') || 'notes';
  const isDashboardView = viewMode === 'dashboard';

  // Improved refreshNotes function with direct state update option
  const refreshNotes = (updatedNotesArray) => {
    // If we already have the updated notes array, set it directly
    if (updatedNotesArray) {
      setNotes(updatedNotesArray);
      // Also update filtered notes to maintain search results
      if (!searchTerm.trim()) {
        setFilteredNotes(updatedNotesArray);
      } else {
        const filtered = updatedNotesArray.filter(note =>
          note.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredNotes(filtered);
      }
    } else {
      // Still trigger the regular refresh cycle
      setLocalRefreshTrigger(prev => prev + 1);
    }

    // Call parent's refresh if available
    if (triggerRefresh) {
      triggerRefresh();
    }
  };

  // Fetch notes when component mounts or refresh is triggered
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const token = utils.getFromLocalStorage('auth_key');
      const userId = utils.getFromLocalStorage('user_id');

      if (!userId) {
        console.error("No user ID found - cannot load notes");
        setLoading(false);
        return;
      }

      // Get ALL notes from localStorage first
      const allStoredNotes = utils.getFromLocalStorage(types.NOTES_DATA) || [];

      // Strict filtering: Only include notes with exact userId match
      const userNotes = allStoredNotes.filter(note =>
        String(note.userId) === String(userId)
      );

      if (userNotes.length) {
        // Ensure all notes have userId field
        const updatedNotes = userNotes.map(note => ({
          ...note,
          userId: userId // Ensure userId is set
        }));

        // Update localStorage if we fixed any notes
        if (updatedNotes.some(note => !note.userId)) {
          utils.addToLocalStorage(types.NOTES_DATA, [
            ...updatedNotes,
            ...allStoredNotes.filter(note => note.userId && note.userId !== userId) // Keep other users' notes
          ]);
        }

        // Set the notes state
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes);
      } else if (token && !userNotes.length && !initialLoad) {
        // If user has no notes, try to fetch from server first
        try {
          const serverNotes = await getAllNotes(token);

          if (serverNotes && Array.isArray(serverNotes) && serverNotes.length > 0) {
            // Ensure all server notes have userId
            const processedServerNotes = serverNotes.map(note => ({
              ...note,
              userId: userId
            }));

            // Update state with server notes
            setNotes(processedServerNotes);
            setFilteredNotes(processedServerNotes);

            // Update localStorage with server notes while preserving others' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...processedServerNotes,
              ...allStoredNotes.filter(note => note.userId && note.userId !== userId)
            ]);

            toast.success("Notes loaded from server", { autoClose: 2000 });
          } else if (!initialLoad) {
            // If no server notes and not initial load, initialize with sample data
            const sampleNotesWithUserId = notesData.map(note => ({
              ...note,
              userId: userId
            }));

            // Add sample notes to localStorage but preserve other users' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...sampleNotesWithUserId,
              ...allStoredNotes.filter(note => note.userId && note.userId !== userId)
            ]);

            setNotes(sampleNotesWithUserId);
            setFilteredNotes(sampleNotesWithUserId);
          }
        } catch (error) {
          console.error("Failed to fetch notes from server:", error);

          // Use sample data as fallback if not initial load
          if (!initialLoad) {
            const sampleNotesWithUserId = notesData.map(note => ({
              ...note,
              userId: userId
            }));

            // Add sample notes to localStorage but preserve other users' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...sampleNotesWithUserId,
              ...allStoredNotes.filter(note => note.userId && note.userId !== userId)
            ]);

            setNotes(sampleNotesWithUserId);
            setFilteredNotes(sampleNotesWithUserId);
          }
        }
      }

      setLoading(false);
    };

    fetchNotes();
  }, [refreshTrigger, localRefreshTrigger, location, initialLoad]);

  // Filter notes by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note =>
      note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  return (
    <section className={styles.container}>
      <Greeting />

      {loading ? (
        <div className={styles.loading}>
          <Icon icon="svg-spinners:270-ring" className={styles.loadingIcon} />
          <p>Loading your notes...</p>
        </div>
      ) : isDashboardView ? (
        <Dashboard notes={notes} refreshNotes={refreshNotes} />
      ) : (
        <main className={styles.notesGrid}>
          <Note
            refreshNotes={refreshNotes}
            userId={utils.getFromLocalStorage('user_id')}
          />
          {filteredNotes.map((note) => (
            <Note
              key={note.id}
              id={note.id}
              text={note.text}
              date={note.createdAt}
              color={note.color}
              refreshNotes={refreshNotes}
              userId={note.userId}
            />
          ))}
          {filteredNotes.length === 0 && searchTerm && (
            <div className={styles.noResults}>
              <Icon icon="mingcute:search-line" className={styles.searchIcon} />
              <h3>No notes match your search</h3>
              <p>Try a different search term</p>
            </div>
          )}
          {filteredNotes.length === 0 && !searchTerm && (
            <div className={styles.noNotes}>
              <Icon icon="mdi:notebook-outline" className={styles.emptyIcon} />
              <h3>No notes yet</h3>
              <p>Start by creating a new note above</p>
            </div>
          )}
        </main>
      )}
    </section>
  );
}

export default Wrapper(Notes);