function Navigation({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'overview', label: '📊 Overview', icon: '📊' },
        { id: 'troops', label: '⚔️ Troops', icon: '⚔️' },
        { id: 'wars', label: '🛡️ Wars', icon: '🛡️' },
        { id: 'clan', label: '👥 Clan', icon: '👥' },
        { id: 'scout', label: '🔍 Scout', icon: '🔍' },
        { id: 'analysis', label: '🤖 AI Analysis', icon: '🤖' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition ${
                            activeTab === tab.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
window.Navigation = Navigation;