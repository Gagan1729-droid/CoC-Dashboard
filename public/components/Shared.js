const { useState, useEffect, useCallback, useMemo } = React;

// Helper to format Clash API dates
window.formatClashDate = (dateString) => {
    if (!dateString) return 'N/A';
    const clashFormatRegex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/;
    const match = dateString.match(clashFormatRegex);
    if (match) {
        const [_, year, month, day, hour, minute, second] = match;
        const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
        });
    }
    try { return new Date(dateString).toLocaleDateString(); } catch (e) { return dateString; }
};

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 stat-card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
                </div>
                <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
        </div>
    );
}

function ErrorMessage({ message, onClose }) {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="text-red-700 hover:text-red-900 font-bold">
                    ✕
                </button>
            )}
        </div>
    );
}

// Make components available globally
window.StatCard = StatCard;
window.LoadingSpinner = LoadingSpinner;
window.ErrorMessage = ErrorMessage;