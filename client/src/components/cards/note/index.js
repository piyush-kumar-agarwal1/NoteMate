import React from 'react';
import styles from './note.module.scss';
import { formatDate } from '../../../utils/formatDate';
import { useState, useRef, useEffect } from 'react';
import utils from '../../../utils/localStorage';
import types from '../../../config/types';
import { createNote, deleteNote, updateNote } from '../../../apis/notes';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'react-toastify';

function Note(props) {
    const { text = "", date, color, id, refreshNotes, userId: propUserId } = props;
    const [expand, setExpand] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [editableText, setEditableText] = useState(text);
    const [selectedColor, setSelectedColor] = useState(color || "#FBEB95");
    const [isEditing, setIsEditing] = useState(false);
    const colorOptions = ["#FBEB95", "#97D2BC", "#FDBAA3", "#AED8FE", "#E8E8E8"];
    const noteRef = useRef(null);
    const expandedNoteRef = useRef(null);
    const currentUserId = utils.getFromLocalStorage('user_id');

    // Check if user owns this note
    const isOwnedByUser = !propUserId || propUserId === currentUserId;

    // Animation effect when note renders
    useEffect(() => {
        if (noteRef.current) {
            noteRef.current.style.opacity = '0';
            noteRef.current.style.transform = 'translateY(20px)';

            setTimeout(() => {
                if (noteRef.current) {
                    noteRef.current.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    noteRef.current.style.opacity = '1';
                    noteRef.current.style.transform = 'translateY(0)';
                }
            }, Math.random() * 300); // Staggered animation
        }

        return () => {
            if (noteRef.current) {
                noteRef.current.style.transition = '';
            }
        };
    }, []);

    // Prevent background scrolling when note is expanded
    useEffect(() => {
        if (expand) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [expand]);

    // Handle clicking outside the expanded note
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (expand &&
                expandedNoteRef.current &&
                !expandedNoteRef.current.contains(event.target)) {
                setExpand(false);
            }
        };

        if (expand) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [expand]);

    // Add animation effect when a note is saved
    const triggerSaveAnimation = () => {
        if (noteRef.current) {
            noteRef.current.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.03)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-in-out'
            });
        }
    };

    // Toggle expand state
    const toggleExpand = (e) => {
        if (e) e.stopPropagation();
        setExpand(prev => !prev);
    };

    // Backdrop click handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setExpand(false);
        }
    };

    const handleSave = () => {
        // Validate content
        if (!text && !noteText.trim()) return;
        const updatedText = text ? editableText : noteText;
        if (!updatedText.trim()) return;

        try {
            // Get current notes
            const notesData = utils.getFromLocalStorage(types.NOTES_DATA) || [];

            // Create note object with userId to track ownership
            const newNote = {
                id: props.id || Date.now(),
                text: updatedText,
                createdAt: props.date || new Date().toISOString(),
                color: selectedColor,
                userId: currentUserId
            };

            // If editing existing note, update it
            const updatedNotes = props.id
                ? notesData.map(note => String(note.id) === String(props.id) ? newNote : note)
                : [newNote, ...notesData];

            // Update localStorage
            utils.addToLocalStorage(types.NOTES_DATA, updatedNotes);

            // Sync with backend if logged in
            const token = utils.getFromLocalStorage('auth_key');
            if (token) {
                if (props.id) {
                    updateNote(newNote, token);
                } else {
                    createNote(newNote, token);
                }
            }

            // Clear input fields and exit edit mode
            setNoteText("");
            setEditableText(updatedText); // Keep the text in view mode
            setIsEditing(false);
            setExpand(false);

            // Trigger save animation
            triggerSaveAnimation();

            // Show success toast
            toast.success(props.id ? "Note updated!" : "Note created!");

            // Use refreshNotes prop if available
            if (refreshNotes) {
                refreshNotes();
            }
        } catch (error) {
            toast.error("Failed to save note. Please try again.");
            console.error("Save note error:", error);
        }
    };

    const handleDelete = () => {
        // Check permission
        if (!isOwnedByUser) {
            toast.error("You don't have permission to delete this note");
            return;
        }

        // Add fade out animation before delete
        if (noteRef.current) {
            noteRef.current.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            noteRef.current.style.opacity = '0';
            noteRef.current.style.transform = 'scale(0.9)';

            // Wait for animation to complete before actual deletion
            setTimeout(() => {
                try {
                    const notesData = utils.getFromLocalStorage(types.NOTES_DATA) || [];

                    // Only proceed if the note actually exists
                    if (id) {
                        // Convert ids to strings for comparison
                        const updatedNotes = notesData.filter(note => String(note.id) !== String(id));
                        utils.addToLocalStorage(types.NOTES_DATA, updatedNotes);

                        // Delete from backend if logged in
                        const token = utils.getFromLocalStorage('auth_key');
                        if (token) {
                            deleteNote(id, token);
                        }

                        // Show success toast
                        toast.success("Note deleted successfully");
                    }

                    // Use refreshNotes prop if available
                    if (refreshNotes) {
                        refreshNotes();
                    }
                } catch (error) {
                    toast.error("Failed to delete note. Please try again.");
                    console.error("Delete note error:", error);

                    // Restore note visibility on error
                    if (noteRef.current) {
                        noteRef.current.style.opacity = '1';
                        noteRef.current.style.transform = 'scale(1)';
                    }
                }
            }, 300);
        }
    };

    const handleColorChange = (newColor) => {
        // Check permission for existing notes
        if (text && id && !isOwnedByUser) {
            toast.error("You don't have permission to modify this note");
            return;
        }

        setSelectedColor(newColor);

        // If we're viewing an existing note, update its color
        if (text && id) {
            try {
                const notesData = utils.getFromLocalStorage(types.NOTES_DATA) || [];
                const updatedNotes = notesData.map(note =>
                    String(note.id) === String(id)
                        ? { ...note, color: newColor }
                        : note
                );
                utils.addToLocalStorage(types.NOTES_DATA, updatedNotes);

                // Sync with backend
                const token = utils.getFromLocalStorage('auth_key');
                if (token) {
                    updateNote({ id, color: newColor }, token);
                }

                // Add color transition effect
                if (noteRef.current) {
                    noteRef.current.style.transition = 'background-color 0.5s ease';
                }

                // Refresh the UI
                if (refreshNotes) {
                    refreshNotes();
                }
            } catch (error) {
                toast.error("Failed to change note color");
                console.error("Change color error:", error);
            }
        }
    };

    return (
        <>
            {expand && (
                <div className={styles.backdropOverlay} onClick={handleBackdropClick}></div>
            )}

            <article
                ref={noteRef}
                className={`${styles.container} ${expand ? styles.expanded : ''}`}
                style={{ backgroundColor: text ? color : selectedColor }}
            >
                <div className={styles.content} ref={expand ? expandedNoteRef : null}>
                    {
                        !text ? (
                            // New note
                            <>
                                <textarea
                                    placeholder="Start typing..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    className={styles.textarea}
                                />
                                <div className={styles.colorPicker}>
                                    {colorOptions.map(colorOption => (
                                        <div
                                            key={colorOption}
                                            className={`${styles.colorOption} ${selectedColor === colorOption ? styles.selected : ''}`}
                                            style={{ backgroundColor: colorOption }}
                                            onClick={() => handleColorChange(colorOption)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : isEditing ? (
                            // Edit mode for existing notes
                            <>
                                <textarea
                                    value={editableText}
                                    onChange={(e) => setEditableText(e.target.value)}
                                    className={styles.textarea}
                                    autoFocus
                                />
                                <div className={styles.colorPicker}>
                                    {colorOptions.map(colorOption => (
                                        <div
                                            key={colorOption}
                                            className={`${styles.colorOption} ${selectedColor === colorOption ? styles.selected : ''}`}
                                            style={{ backgroundColor: colorOption }}
                                            onClick={() => handleColorChange(colorOption)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            // View mode for existing notes
                            <>
                                <p className={expand ? styles.expanded : styles.truncated}>{text}</p>
                                {text.length > 150 && (
                                    <button
                                        onClick={toggleExpand}
                                        className={styles.readMoreBtn}
                                    >
                                        Read {expand ? "less" : "more"}
                                    </button>
                                )}
                                <div className={styles.colorPicker}>
                                    {colorOptions.map(colorOption => (
                                        <div
                                            key={colorOption}
                                            className={`${styles.colorOption} ${selectedColor === colorOption ? styles.selected : ''}`}
                                            style={{ backgroundColor: colorOption }}
                                            onClick={() => handleColorChange(colorOption)}
                                        />
                                    ))}
                                </div>
                            </>
                        )
                    }
                </div>
                <footer className={styles.footer}>
                    <div>{formatDate(date || new Date())}</div>
                    <div className={styles.actions}>
                        {text && !isEditing && isOwnedByUser && (
                            <button
                                className={styles.editBtn}
                                onClick={() => setIsEditing(true)}
                                title="Edit note"
                            >
                                <Icon icon="material-symbols:edit" />
                            </button>
                        )}

                        {isEditing ? (
                            // Save button for edit mode
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={!editableText.trim()} // Disable if empty
                            >
                                Save
                            </button>
                        ) : noteText.trim() ? (
                            // Save button for new notes - only show if there's content
                            <button className={styles.saveBtn} onClick={handleSave}>
                                Save
                            </button>
                        ) : text ? (
                            // Delete button for existing notes (only show for owned notes)
                            isOwnedByUser && (
                                <button className={styles.deleteBtn} onClick={handleDelete}>
                                    Delete
                                </button>
                            )
                        ) : (
                            // Delete button for empty new notes
                            <button className={styles.deleteBtn} onClick={handleDelete}>
                                Delete
                            </button>
                        )}

                        {expand && (
                            <button
                                className={styles.closeBtn}
                                onClick={() => setExpand(false)}
                                title="Close"
                            >
                                <Icon icon="mdi:close" />
                            </button>
                        )}
                    </div>
                </footer>
            </article>
        </>
    );
}

export default Note;