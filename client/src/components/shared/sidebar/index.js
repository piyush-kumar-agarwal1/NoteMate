import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';

import styles from './sidebar.module.scss';
import BrandLogo from '../brand';

import sidebarData from '../../../data/sidebar.json';

import utils from '../../../utils/localStorage';
import types from '../../../config/types';
import { toast } from 'react-toastify';

function Sidebar({ onRefresh }) {
    const navigate = useNavigate();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Use effect to mark initial load complete after component mounts
    useEffect(() => {
        // Set a small delay to mark initial load as complete
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleClick = (item) => {
        // In the handleClick function:
        if (item.title === "Home") {
            // Toggle between dashboard and notes view
            const currentMode = utils.getFromLocalStorage('view_mode') || 'notes';
            const newMode = currentMode === 'notes' ? 'dashboard' : 'notes';
            utils.addToLocalStorage('view_mode', newMode);

            // Show dashboard stats when switching to dashboard view
            if (newMode === 'dashboard') {
                const allNotes = utils.getFromLocalStorage(types.NOTES_DATA) || [];
                const userId = utils.getFromLocalStorage('user_id');

                // Filter notes to only include those belonging to the current user
                const userNotes = allNotes.filter(note =>
                    note && String(note.userId) === String(userId)
                );

                displayNoteStatsSummary(userNotes);
            }

            navigate('/notes', { replace: true });
            if (onRefresh) onRefresh();
        } else if (item.title === "Add Note") {
            // Prevent creating notes on initial load or reload
            if (isInitialLoad) return;

            // Prevent creating multiple notes in quick succession
            const lastCreatedTime = utils.getFromLocalStorage('last_note_created');
            const now = Date.now();

            // If we created a note in the last 2 seconds, don't create another
            if (lastCreatedTime && now - lastCreatedTime < 2000) {
                return;
            }

            // Store the timestamp to prevent rapid clicks
            utils.addToLocalStorage('last_note_created', now);

            // Switch to notes view if in dashboard
            utils.addToLocalStorage('view_mode', 'notes');

            // Navigate to notes with a query parameter to show template
            navigate('/notes?newNote=true', { replace: true });

            // Trigger refresh
            if (onRefresh) {
                onRefresh();
            }
        }
    }

    // Now using this function when toggling to dashboard view
    const displayNoteStatsSummary = (notes) => {
        if (!notes || !notes.length) return;

        let totalNotes = notes.length;
        let emptyNotes = notes.filter(note => !note.text || !note.text.trim()).length;
        let colorCounts = {};

        notes.forEach(note => {
            if (note && note.color) {
                colorCounts[note.color] = (colorCounts[note.color] || 0) + 1;
            }
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

        // Clear BOTH sessionStorage and localStorage to ensure logout works
        utils.removeFromSessionStorage('auth_key');
        utils.removeFromSessionStorage('user_id');
        utils.removeFromSessionStorage('user_name');
        utils.removeFromSessionStorage('welcome_tour');

        // Also clear localStorage auth data for good measure
        utils.removeFromLocalStorage('auth_key');
        utils.removeFromLocalStorage('user_id');
        utils.removeFromLocalStorage('user_name');

        // Navigate to login page
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