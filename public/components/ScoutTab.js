function ScoutTab({ fetchPlayerData }) {
    const { useState } = React;
    const [searchTag, setSearchTag] = useState('');
    const [scoutData, setScoutData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTag) return;

        // Basic validation
        let tag = searchTag.trim().toUpperCase();
        if (!tag.startsWith('#')) tag = '#' + tag;

        setLoading(true);
        setError('');
        setScoutData(null);

        try {
            const data = await fetchPlayerData(tag);
            setScoutData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🔍 Scout Player</h3>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        placeholder="Enter player tag (e.g. #2PP...)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
            </div>

            {scoutData && (
                <div className="animate-fade-in">
                    {/* Mini Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center space-x-4">
                            {scoutData.league?.iconUrls?.small && (
                                <img src={scoutData.league.iconUrls.small} alt="League" className="w-16 h-16" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{scoutData.name}</h2>
                                <p className="text-gray-600">{scoutData.tag}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="font-semibold">🏆 {scoutData.trophies?.toLocaleString()}</span>
                                    <span className="text-gray-600">TH {scoutData.townHallLevel}</span>
                                    {scoutData.clan && (
                                        <span className="text-blue-600 font-medium">{scoutData.clan.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard title="War Stars" value={scoutData.warStars || 0} icon="⭐" color="bg-yellow-500" />
                        <StatCard title="Attack Wins" value={scoutData.attackWins || 0} icon="⚔️" color="bg-red-500" />
                        <StatCard title="Donations" value={scoutData.donations || 0} icon="🎁" color="bg-green-500" />
                    </div>

                    {/* Heroes */}
                    {scoutData.heroes && scoutData.heroes.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Heroes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scoutData.heroes.map((hero, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{hero.name}</span>
                                            <span className="text-sm text-gray-600">Lv {hero.level}/{hero.maxLevel}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div
                                                className="bg-blue-500 h-1.5 rounded-full"
                                                style={{ width: `${(hero.level / hero.maxLevel) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
window.ScoutTab = ScoutTab;