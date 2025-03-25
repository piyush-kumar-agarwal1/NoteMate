import React, { useState, useContext, useEffect, useRef } from 'react'
import styles from './navbar.module.scss';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ThemeContext } from '../../../context/ThemeContext';
import utils from '../../../utils/localStorage';

function Navbar({ onSearch }) {
    const [searchText, setSearchText] = useState('');
    const [focused, setFocused] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const searchRef = useRef(null);
    const viewMode = utils.getFromLocalStorage('view_mode') || 'notes';

    // Initialize search text from localStorage if exists
    useEffect(() => {
        const savedSearch = utils.getFromLocalStorage('search_term');
        if (savedSearch) {
            setSearchText(savedSearch);
        }

        // Add keyboard shortcut for search focus
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K (Mac) to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchText('');
        onSearch('');
        searchRef.current.focus();
    };

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    return (
        <header className={styles.header}>
            <div className={styles.navContent}>
                <div className={`${styles.searchContainer} ${focused ? styles.focused : ''}`}>
                    <Icon icon="bx:bx-search" className={styles.searchIcon} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search notes (Ctrl+K)"
                        value={searchText}
                        onChange={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={styles.searchInput}
                    />
                    {searchText && (
                        <button
                            className={styles.clearButton}
                            onClick={clearSearch}
                            title="Clear search"
                        >
                            <Icon icon="mdi:close-circle" />
                        </button>
                    )}
                </div>

                <div className={styles.navActions}>
                    <div className={styles.viewMode}>
                        <Icon
                            icon={viewMode === 'dashboard' ? "mdi:view-dashboard" : "mdi:note-text-outline"}
                            className={styles.viewIcon}
                        />
                        <span>{viewMode === 'dashboard' ? 'Dashboard' : 'Notes'} View</span>
                    </div>

                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        <div className={styles.toggleTrack}>
                            <div className={`${styles.toggleKnob} ${theme === 'dark' ? styles.dark : ''}`}>
                                <Icon
                                    icon={theme === 'light' ? "ph:sun-bold" : "ph:moon-stars-bold"}
                                    className={styles.themeIcon}
                                />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar