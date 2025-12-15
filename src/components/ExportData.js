import React from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

/**
 * ExportData component - Export focus history as JSON or CSV
 */
const ExportData = ({ sessions = [], stats = {} }) => {
    const exportAsJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            stats: {
                totalFocusTime: stats.totalFocusTime || 0,
                totalDistractions: stats.totalDistractions || 0,
                streak: stats.streak || 0,
            },
            sessions: sessions.map(s => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
                focusTime: s.focusTime,
                distractions: s.distractions,
            })),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, 'focusguard-data.json');
    };

    const exportAsCSV = () => {
        const headers = ['Session ID', 'Start Time', 'End Time', 'Focus Time (seconds)', 'Distractions'];
        const rows = sessions.map(s => [
            s.id,
            s.startTime,
            s.endTime || '',
            s.focusTime,
            s.distractions,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(blob, 'focusguard-sessions.csv');
    };

    const downloadFile = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="export-data">
            <div className="export-header">
                <Download size={18} />
                <span>Export Data</span>
            </div>

            <div className="export-buttons">
                <button className="export-btn" onClick={exportAsJSON}>
                    <FileJson size={16} />
                    <span>JSON</span>
                </button>
                <button className="export-btn" onClick={exportAsCSV}>
                    <FileSpreadsheet size={16} />
                    <span>CSV</span>
                </button>
            </div>
        </div>
    );
};

export default ExportData;
