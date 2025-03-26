import React, { useState, useEffect, useCallback } from 'react';
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
  // Initialize to false - don't show the template by default
  const [showNewNoteTemplate, setShowNewNoteTemplate] = useState(false);
  const location = useLocation();

  // Get the current URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const showTemplate = queryParams.get('newNote') === 'true';

  const { searchTerm = '', refreshTrigger = 0, triggerRefresh, initialLoad = false } = useOutletContext() || {};

  // Check if we should be in dashboard view
  const viewMode = utils.getFromLocalStorage('view_mode') || 'notes';
  const isDashboardView = viewMode === 'dashboard';

  // Watch for URL query parameter changes to show/hide the template
  useEffect(() => {
    if (showTemplate && !isDashboardView) {
      setShowNewNoteTemplate(true);

      // Clean up URL after setting the state (prevent re-displaying on refresh)
      // This will remove the parameter without causing a page reload
      if (window.history.replaceState) {
        const newUrl = window.location.pathname; // URL without query params
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, [showTemplate, isDashboardView]);

  // Add this ref at the top of your component
  const welcomeShown = React.useRef(false);

  // Then modify your welcome tour useEffect
  useEffect(() => {
    // If tour has already been shown during this component lifecycle, don't show again
    if (welcomeShown.current) {
      return;
    }

    // Check for welcome parameter in URL
    const queryParams = new URLSearchParams(location.search);
    const showWelcome = queryParams.get('welcome') === 'true';

    // Or check for welcome_tour timestamp (less than 2 minutes old)
    const welcomeTourTimestamp = utils.getFromLocalStorage('welcome_tour');
    const isRecentSignup = welcomeTourTimestamp &&
      (Date.now() - parseInt(welcomeTourTimestamp) < 2 * 60 * 1000);

    // Get user name
    const userName = utils.getFromLocalStorage('user_name') || 'there';

    // Show welcome tour if either condition is true
    if (showWelcome || isRecentSignup) {
      // Mark as shown immediately to prevent duplicate tours
      welcomeShown.current = true;

      // Clear the welcome tour timestamp
      utils.removeFromLocalStorage('welcome_tour');

      // Remove the welcome parameter from URL without page reload
      if (showWelcome) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }

      // Clear all existing toasts first
      toast.dismiss();

      // Add a slight delay before showing first toast
      const welcomeTimer1 = setTimeout(() => {
        toast.info(`👋 Welcome to NoteMate, ${userName}!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: "welcome-1" // Prevent duplicate toasts
        });
      }, 1000);

      const welcomeTimer2 = setTimeout(() => {
        toast.info("📝 Click the + button in the sidebar to create your first note", {
          position: "top-center",
          autoClose: 4000,
          toastId: "welcome-2"
        });
      }, 4500);

      const welcomeTimer3 = setTimeout(() => {
        toast.info("🎨 You can color-code your notes for better organization", {
          position: "top-center",
          autoClose: 4000,
          toastId: "welcome-3"
        });
      }, 9000);

      const welcomeTimer4 = setTimeout(() => {
        toast.info("📊 Switch to Dashboard view using the home icon to see your note stats", {
          position: "top-center",
          autoClose: 4000,
          toastId: "welcome-4"
        });
      }, 13500);

      // Clean up timers if component unmounts during welcome sequence
      return () => {
        clearTimeout(welcomeTimer1);
        clearTimeout(welcomeTimer2);
        clearTimeout(welcomeTimer3);
        clearTimeout(welcomeTimer4);
      };
    }
  }, [location.search]); // Keep dependency on location.search

  // Improved refreshNotes function with direct state update option
  const refreshNotes = useCallback((updatedNotesArray) => {
    if (updatedNotesArray) {
      // Clear any empty notes that might have been saved accidentally
      const cleanedNotes = updatedNotesArray.filter(note => note && note.text && note.text.trim());

      // If we already have the updated notes array, set it directly
      setNotes(cleanedNotes);

      // Update filtered notes based on search term
      if (!searchTerm || !searchTerm.trim()) {
        setFilteredNotes(cleanedNotes);
      } else {
        const filtered = cleanedNotes.filter(note =>
          note.text && note.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredNotes(filtered);
      }

      // Save the cleaned notes to localStorage
      const allStoredNotes = utils.getFromLocalStorage(types.NOTES_DATA) || [];
      const userId = utils.getFromLocalStorage('user_id');
      const otherUserNotes = allStoredNotes.filter(note =>
        note && note.userId && String(note.userId) !== String(userId)
      );

      utils.addToLocalStorage(types.NOTES_DATA, [...cleanedNotes, ...otherUserNotes]);

      // REMOVED: Don't automatically show a new template after refresh
    } else {
      // Trigger a refresh cycle by updating the trigger state
      setLocalRefreshTrigger(prev => prev + 1);
    }

    // Call parent's refresh if available
    if (triggerRefresh) {
      triggerRefresh();
    }
  }, [searchTerm, triggerRefresh]);

  // Fetch notes when component mounts or refresh is triggered
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      // CHANGE: Use helper methods for auth data
      const token = utils.getAuthToken();
      const userId = utils.getUserId();

      if (!userId) {
        console.error("No user ID found - cannot load notes");
        setLoading(false);
        return;
      }

      // Get ALL notes from localStorage first
      const allStoredNotes = utils.getFromLocalStorage(types.NOTES_DATA) || [];

      // Ensure consistent ID type for comparison (string) and filter out empty notes
      const userNotes = allStoredNotes.filter(note =>
        note &&
        String(note.userId) === String(userId) &&
        note.text &&
        note.text.trim()
      );

      if (userNotes.length) {
        // Ensure all notes have userId field and validate structure
        const updatedNotes = userNotes.map(note => ({
          ...note,
          userId: userId,
          // Use existing ID or create a string-based ID (not using timestamp + random)
          id: note.id || `client-note-${Math.random().toString(36).substr(2, 9)}`,
          text: note.text || "",
          createdAt: note.createdAt || new Date().toISOString(),
          color: note.color || "#FBEB95"
        }));

        // Update localStorage if we fixed any notes
        if (updatedNotes.some((note, i) => JSON.stringify(note) !== JSON.stringify(userNotes[i]))) {
          utils.addToLocalStorage(types.NOTES_DATA, [
            ...updatedNotes,
            ...allStoredNotes.filter(note => note.userId && String(note.userId) !== String(userId)) // Keep other users' notes
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
            // Filter out empty notes from server
            const nonEmptyServerNotes = serverNotes.filter(note => note.text && note.text.trim());

            // Ensure all server notes have userId and proper structure
            const processedServerNotes = nonEmptyServerNotes.map(note => ({
              ...note,
              userId: userId,
              // For server notes, preserve the MongoDB ObjectId as id
              id: note._id || note.id || `server-note-${Math.random().toString(36).substr(2, 9)}`,
              text: note.text || "",
              createdAt: note.createdAt || new Date().toISOString(),
              color: note.color || "#FBEB95"
            }));

            // Update state with server notes
            setNotes(processedServerNotes);
            setFilteredNotes(processedServerNotes);

            // Update localStorage with server notes while preserving others' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...processedServerNotes,
              ...allStoredNotes.filter(note => note.userId && String(note.userId) !== String(userId))
            ]);

            toast.success("Notes loaded from server", { autoClose: 2000 });
          } else if (!initialLoad) {
            // If no server notes and not initial load, initialize with sample data
            const sampleNotesWithUserId = notesData.map(note => ({
              ...note,
              userId: userId,
              id: note.id || `sample-note-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: note.createdAt || new Date().toISOString()
            }));

            // Add sample notes to localStorage but preserve other users' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...sampleNotesWithUserId,
              ...allStoredNotes.filter(note => note.userId && String(note.userId) !== String(userId))
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
              userId: userId,
              id: note.id || `sample-note-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: note.createdAt || new Date().toISOString()
            }));

            // Add sample notes to localStorage but preserve other users' notes
            utils.addToLocalStorage(types.NOTES_DATA, [
              ...sampleNotesWithUserId,
              ...allStoredNotes.filter(note => note.userId && String(note.userId) !== String(userId))
            ]);

            setNotes(sampleNotesWithUserId);
            setFilteredNotes(sampleNotesWithUserId);
          }
        }
      }

      setLoading(false);
    };

    fetchNotes();
  }, [refreshTrigger, localRefreshTrigger, location, initialLoad, isDashboardView]);

  // Filter notes by search term
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note =>
      note.text && note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  // Handle new note creation 
  const handleNewNoteSave = useCallback(() => {
    // When a new note is saved, hide the template 
    setShowNewNoteTemplate(false);
  }, []);

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
          {/* Empty note template for creating new notes - only show when requested */}
          {showNewNoteTemplate && (
            <Note
              key="new-note-template"
              refreshNotes={refreshNotes}
              userId={utils.getFromLocalStorage('user_id')}
              onSave={handleNewNoteSave}
              isTemplate={true}
            />
          )}

          {/* Render all filtered notes */}
          {filteredNotes.map((note) => (
            <Note
              key={`note-${note.id}`}
              id={note.id}
              text={note.text}
              date={note.createdAt}
              color={note.color}
              refreshNotes={refreshNotes}
              userId={note.userId}
            />
          ))}

          {/* Show message when search returns no results */}
          {filteredNotes.length === 0 && searchTerm && (
            <div className={styles.noResults}>
              <Icon icon="mingcute:search-line" className={styles.searchIcon} />
              <h3>No notes match your search</h3>
              <p>Try a different search term</p>
            </div>
          )}

          {/* Show message when user has no notes */}
          {filteredNotes.length === 0 && !searchTerm && (
            <div className={styles.noNotes}>
              <Icon icon="mdi:notebook-outline" className={styles.emptyIcon} />
              <h3>No notes yet</h3>
              <p>Start by creating a new note using the sidebar</p>
            </div>
          )}
        </main>
      )}
    </section>
  );
}

export default Wrapper(Notes);