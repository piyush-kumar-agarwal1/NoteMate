import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.scss';
import { Icon } from '@iconify/react/dist/iconify.js';

function Dashboard({ notes, refreshNotes }) {
    const [stats, setStats] = useState({
        totalNotes: 0,
        avgLength: 0,
        longestNote: '',
        shortestNote: '',
        colorDistribution: {},
        emptyNotes: 0,
        recentNotes: []
    });

    useEffect(() => {
        // Calculate statistics
        if (!notes || !notes.length) return;

        let totalChars = 0;
        let longestNoteIndex = 0;
        let longestLength = 0;
        let shortestNoteIndex = 0;
        let shortestLength = Infinity;
        let colorCounts = {};
        let emptyNotes = 0;

        notes.forEach((note, index) => {
            // Skip notes without text
            if (!note.text) {
                emptyNotes++;
                return;
            }

            const length = note.text.length;
            totalChars += length;

            if (length > longestLength) {
                longestLength = length;
                longestNoteIndex = index;
            }

            if (length < shortestLength && length > 0) {
                shortestLength = length;
                shortestNoteIndex = index;
            }

            // Count color distribution
            colorCounts[note.color] = (colorCounts[note.color] || 0) + 1;
        });

        // Get recent notes (last 3)
        const recentNotes = [...notes]
            .filter(note => note.text) // Only notes with content
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        // Calculate average (excluding empty notes)
        const notesWithContent = notes.length - emptyNotes;
        const avgLength = notesWithContent > 0 ? Math.round(totalChars / notesWithContent) : 0;

        setStats({
            totalNotes: notes.length,
            avgLength,
            longestNote: notesWithContent > 0 ? notes[longestNoteIndex] : null,
            shortestNote: notesWithContent > 0 ? notes[shortestNoteIndex] : null,
            colorDistribution: colorCounts,
            emptyNotes,
            recentNotes
        });
    }, [notes]);

    // Helper function to get color name
    const getColorName = (hex) => {
        const colorMap = {
            "#FBEB95": "Yellow",
            "#97D2BC": "Green",
            "#FDBAA3": "Coral",
            "#AED8FE": "Blue",
            "#E8E8E8": "Grey"
        };
        return colorMap[hex] || hex;
    };

    return (
        <div className={styles.dashboard}>
            <h2>Notes Dashboard</h2>

            <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Icon icon="uil:notes" />
                        <h3>Total Notes</h3>
                    </div>
                    <p className={styles.statValue}>{stats.totalNotes}</p>
                    <p className={styles.statDetail}>
                        {stats.emptyNotes > 0 ? `(${stats.emptyNotes} empty)` : ''}
                    </p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Icon icon="carbon:text-font" />
                        <h3>Average Length</h3>
                    </div>
                    <p className={styles.statValue}>{stats.avgLength}</p>
                    <p className={styles.statDetail}>characters per note</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Icon icon="clarity:color-palette-solid" />
                        <h3>Most Used Color</h3>
                    </div>
                    {Object.entries(stats.colorDistribution).length > 0 ? (
                        <>
                            {Object.entries(stats.colorDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 1)
                                .map(([color, count]) => (
                                    <div key={color} className={styles.colorStat}>
                                        <div
                                            className={styles.colorSample}
                                            style={{ backgroundColor: color }}
                                        ></div>
                                        <p className={styles.statValue}>
                                            {getColorName(color)}
                                        </p>
                                        <p className={styles.statDetail}>
                                            used in {count} notes
                                        </p>
                                    </div>
                                ))}
                        </>
                    ) : (
                        <p>No colors used yet</p>
                    )}
                </div>
            </div>

            {/* Recent Notes Section */}
            <h3 className={styles.sectionTitle}>Recent Notes</h3>
            <div className={styles.recentNotes}>
                {stats.recentNotes.length > 0 ? (
                    stats.recentNotes.map(note => (
                        <div
                            key={note.id || Math.random().toString(36).substring(7)}
                            className={styles.recentNote}
                            style={{ backgroundColor: note.color || "#FBEB95" }}
                        >
                            <div className={styles.noteText}>
                                {typeof note.text === 'string' ?
                                    (note.text.length > 100
                                        ? note.text.substring(0, 100).split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < note.text.substring(0, 100).split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        )) + '...'
                                        : note.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < note.text.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))
                                    ) : 'No content'
                                }
                            </div>
                            <div className={styles.noteFooter}>
                                <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No notes yet</p>
                )}
            </div>

            {/* Color Distribution */}
            <h3 className={styles.sectionTitle}>Color Distribution</h3>
            <div className={styles.colorDistribution}>
                {Object.entries(stats.colorDistribution).length > 0 ? (
                    Object.entries(stats.colorDistribution).map(([color, count]) => (
                        <div key={color} className={styles.colorBar}>
                            <div
                                className={styles.colorSample}
                                style={{ backgroundColor: color }}
                            ></div>
                            <div className={styles.colorBarContainer}>
                                <div
                                    className={styles.colorBarFill}
                                    style={{
                                        width: `${stats.totalNotes > 0 ? (count / stats.totalNotes) * 100 : 0}%`,
                                        backgroundColor: color
                                    }}
                                ></div>
                            </div>
                            <span>{count} ({stats.totalNotes > 0 ? Math.round((count / stats.totalNotes) * 100) : 0}%)</span>
                        </div>
                    ))
                ) : (
                    <p>No colors used yet</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;