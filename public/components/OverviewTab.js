function OverviewTab({ playerData, clanData, warData, historyData, loading }) {
    const { useMemo } = React;
    const Recharts = window.Recharts || {
        LineChart: () => null, Line: () => null, XAxis: () => null, YAxis: () => null, 
        CartesianGrid: () => null, Tooltip: () => null, Legend: () => null, 
        ResponsiveContainer: ({children}) => <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 border border-red-200 rounded">Graph library not loaded.</div>
    };
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

    if (!playerData) {
        return <LoadingSpinner />;
    }

    const calculateProgress = (items, village = 'home') => {
        if (!items) return { current: 0, max: 0, percent: 0 };
        const filtered = items.filter(i => i.village === village);
        if (filtered.length === 0) return { current: 0, max: 0, percent: 0 };
        
        let current = 0;
        let max = 0;
        filtered.forEach(i => {
            current += i.level;
            max += i.maxLevel;
        });
        
        return {
            current,
            max,
            percent: max > 0 ? Math.round((current / max) * 100) : 0
        };
    };

    const getAchievement = (name) => {
        return playerData.achievements?.find(a => a.name === name)?.value || 0;
    }

    const chartData = useMemo(() => {
        if (!historyData || !Array.isArray(historyData)) return [];
        return historyData.map(item => ({
            date: item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A',
            gold: Number(item.gold) || 0,
            elixir: Number(item.elixir) || 0,
            darkElixir: Number(item.dark_elixir) || 0
        }));
    }, [historyData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Attack Wins" value={playerData?.attackWins || 0} icon="⚔️" color="bg-red-500" />
            <StatCard title="Defense Wins" value={playerData?.defenseWins || 0} icon="🛡️" color="bg-blue-500" />
            <StatCard title="War Stars" value={playerData?.warStars || 0} icon="⭐" color="bg-yellow-500" />
            <StatCard title="Donations" value={playerData?.donations || 0} icon="🎁" color="bg-green-500" />
            <StatCard title="Received" value={playerData?.donationsReceived || 0} icon="📥" color="bg-purple-500" />
            <StatCard title="Best Trophies" value={playerData?.bestTrophies || 0} icon="🏆" color="bg-orange-500" />

            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Resource Growth Over Time</h3>
                {chartData.length > 0 ? (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" stroke="#D97706" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#1F2937" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value) => value.toLocaleString()} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="gold" name="Gold Grab" stroke="#D97706" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line yAxisId="left" type="monotone" dataKey="elixir" name="Elixir Escapade" stroke="#9333EA" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="darkElixir" name="Heroic Heist" stroke="#1F2937" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>No history data available yet. Check back tomorrow!</p>
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-2 text-center">Tracking daily progress of your lifetime resource achievements.</p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Upgrade Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Heroes (Home)', data: calculateProgress(playerData.heroes, 'home'), color: 'bg-blue-500' },
                        { title: 'Troops (Home)', data: calculateProgress(playerData.troops, 'home'), color: 'bg-green-500' },
                        { title: 'Spells', data: calculateProgress(playerData.spells, 'home'), color: 'bg-purple-500' },
                        { title: 'Builder Base Troops', data: calculateProgress(playerData.troops, 'builderBase'), color: 'bg-indigo-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-gray-700">{stat.title}</span>
                                <span className="text-sm font-bold text-gray-600">{stat.data.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`${stat.color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${stat.data.percent}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">{stat.data.current} / {stat.data.max} Levels</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏗️ Builder Base</h3>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Versus Trophies</span>
                    <span className="font-bold text-xl">{playerData.versusTrophies?.toLocaleString() || 0} 🏆</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Best Versus</span>
                    <span className="font-bold text-gray-800">{playerData.bestVersusTrophies?.toLocaleString() || 0} 🏆</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏅 Key Achievements</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">War Hero (Stars)</span>
                        <span className="font-bold text-yellow-600">{getAchievement('War Hero').toLocaleString()} ⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Games Champion</span>
                        <span className="font-bold text-blue-600">{getAchievement('Games Champion').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nice and Tidy</span>
                        <span className="font-bold text-green-600">{getAchievement('Nice and Tidy').toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            {clanData && (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Clan Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Clan Name</p>
                            <p className="text-xl font-semibold">{clanData.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Clan Level</p>
                            <p className="text-xl font-semibold">Level {clanData.clanLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Members</p>
                            <p className="text-xl font-semibold">{clanData.members}/50</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">War Record</p>
                            <p className="text-xl font-semibold">
                                {clanData.warWins || 0}W - {clanData.warLosses || 0}L - {clanData.warTies || 0}T
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {loading.clan && !clanData && (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                    <div className="h-6 w-48 skeleton rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 skeleton rounded"></div>
                        <div className="h-4 skeleton rounded"></div>
                    </div>
                </div>
            )}
            
            {warData && (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Current War</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-green-800">{warData.clan.name}</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{warData.clan.stars} ⭐</p>
                            <p className="text-sm text-gray-600">{warData.clan.destructionPercentage.toFixed(1)}% destruction</p>
                            <p className="text-sm text-gray-600">{warData.clan.attacks || 0} attacks used</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-red-800">{warData.opponent.name}</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{warData.opponent.stars} ⭐</p>
                            <p className="text-sm text-gray-600">{warData.opponent.destructionPercentage.toFixed(1)}% destruction</p>
                            <p className="text-sm text-gray-600">{warData.opponent.attacks || 0} attacks used</p>
                        </div>
                    </div>
                </div>
            )}
            
            {!warData && !loading.war && clanData && (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                    <p className="text-center text-gray-500">No active war at the moment</p>
                </div>
            )}
        </div>
    );
}
window.OverviewTab = OverviewTab;