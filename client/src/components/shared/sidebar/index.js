import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';

import styles from './sidebar.module.scss';
import BrandLogo from '../brand';

import sidebarData from '../../../data/sidebar.json';

import utils from '../../../utils/localStorage';
import types from '../../../config/types';
import { toast } from 'react-toastify';

function Sidebar({ onRefresh, initialLoad }) {
    const navigate = useNavigate();

    const handleClick = (item) => {
        if (item.title === "Home") {
            // Your existing Home code...
        } else if (item.title === "Add Note") {
            // Check if this is initial load - if so, don't create a new note
            if (initialLoad) return;

            // Create a new empty note
            let data = utils.getFromLocalStorage(types.NOTES_DATA) || [];
            const userId = utils.getFromLocalStorage('user_id');

            if (!userId) {
                toast.error("You must be logged in to create notes");
                return;
            }

            // Create a unique ID for the new note
            const newNote = {
                id: Date.now(),
                text: "",
                createdAt: new Date().toISOString(),
                color: "#FBEB95",
                userId: userId
            };

            // Add new note to beginning
            let updatedData = [newNote, ...data];

            // Save to localStorage
            utils.addToLocalStorage(types.NOTES_DATA, updatedData);

            // Switch to notes view if in dashboard
            utils.addToLocalStorage('view_mode', 'notes');

            // Navigate to ensure we're in notes view
            navigate('/notes', { replace: true });

            // Trigger refresh
            if (onRefresh) {
                onRefresh();
            }
        }
    }

    // Renamed function to avoid confusion and actually use it
    const displayNoteStatsSummary = (notes) => {
        if (!notes || !notes.length) return;

        let totalNotes = notes.length;
        let emptyNotes = notes.filter(note => !note.text.trim()).length;
        let colorCounts = {};

        notes.forEach(note => {
            colorCounts[note.color] = (colorCounts[note.color] || 0) + 1;
        });

        // Find most used color
        let mostUsedColor = '';
        let maxCount = 0;

        Object.entries(colorCounts).forEach(([color, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostUsedColor = color;
            }
        });

        // Only show toast if we have useful information
        if (totalNotes > 0) {
            toast.info(`📝 ${totalNotes} notes total (${emptyNotes} empty) | Most used color: ${getColorName(mostUsedColor)}`, {
                position: "bottom-center",
                autoClose: 3000
            });
        }
    }

    // Now used by the displayNoteStatsSummary function
    const getColorName = (hex) => {
        const colorMap = {
            "#FBEB95": "Yellow",
            "#97D2BC": "Green",
            "#FDBAA3": "Coral",
            "#AED8FE": "Blue",
            "#E8E8E8": "Grey"
        };
        return colorMap[hex] || hex;
    }

    const handleLogout = () => {
        // Clean up empty notes before logout
        const notesData = utils.getFromLocalStorage(types.NOTES_DATA) || [];
        if (notesData.length) {
            // Filter out notes with empty text
            const filteredNotes = notesData.filter(note => note.text && note.text.trim().length > 0);

            // If we removed any notes, update localStorage
            if (filteredNotes.length < notesData.length) {
                utils.addToLocalStorage(types.NOTES_DATA, filteredNotes);
                toast.info(`Cleaned up ${notesData.length - filteredNotes.length} empty notes`, {
                    position: "bottom-center",
                    autoClose: 2000
                });
            }
        }

        // Proceed with normal logout
        utils.removeFromLocalStorage('auth_key');
        navigate('/');
    }

    // Determine if we're in dashboard view
    const viewMode = utils.getFromLocalStorage('view_mode') || 'notes';
    const isDashboardView = viewMode === 'dashboard';

    return (
        <aside className={styles.sidebar}>
            <BrandLogo logoOnly={true} type={"dark"} className={styles.logo} />
            <section>
                {
                    sidebarData.map((item, index) => {
                        const isHomeBtn = item.title === "Home";
                        return (
                            <article
                                key={index}
                                className={`${styles.item} ${isHomeBtn && isDashboardView ? styles.active : ''}`}
                                onClick={() => handleClick(item)}
                                title={isHomeBtn ? `${isDashboardView ? 'Notes View' : 'Dashboard View'}` : item.title}
                            >
                                <Icon icon={item.icon} />
                            </article>
                        );
                    })
                }
            </section>
            <article
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Logout"
            >
                <Icon icon={"material-symbols:logout"} />
            </article>
        </aside>
    )
}

export default Sidebar;