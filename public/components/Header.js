function Header({ playerData, onLogout, loading }) {
    if (loading || !playerData) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 rounded-full skeleton"></div>
                        <div className="flex-1">
                            <div className="h-8 w-48 skeleton rounded mb-2"></div>
                            <div className="h-4 w-32 skeleton rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    {playerData?.league?.iconUrls?.small && (
                        <img src={playerData.league.iconUrls.small} alt="League" className="w-16 h-16" />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{playerData?.name || 'Loading...'}</h1>
                        <p className="text-gray-600">{playerData?.tag}</p>
                        <div className="flex items-center space-x-4 mt-2">
                            <span className="trophy-icon text-sm font-semibold">
                                {playerData?.trophies?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm text-gray-600">TH {playerData?.townHallLevel || 0}</span>
                            <span className="text-sm text-gray-600">Level {playerData?.expLevel || 0}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
window.Header = Header;