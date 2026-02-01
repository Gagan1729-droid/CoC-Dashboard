function WarsTab({ warData, warLogData, cwlData, loading }) {
    return (
        <div className="space-y-6">
            {warLogData && warLogData.items && warLogData.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">War History</h3>
                    <div className="space-y-4">
                        {warLogData.items.map((war, index) => (
                            <div key={index} className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                                war.result === 'win' ? 'border-green-200 bg-green-50/30' :
                                war.result === 'lose' ? 'border-red-200 bg-red-50/30' :
                                'border-gray-200 bg-gray-50/30'
                            }`}>
                                {/* Header Status Bar */}
                                <div className={`px-4 py-2 flex justify-between items-center border-b ${
                                    war.result === 'win' ? 'bg-green-100/50 border-green-200 text-green-800' :
                                    war.result === 'lose' ? 'bg-red-100/50 border-red-200 text-red-800' :
                                    'bg-gray-100/50 border-gray-200 text-gray-800'
                                }`}>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-sm uppercase tracking-wider">{war.result || 'TIE'}</span>
                                        <span className="text-xs opacity-75">• {window.formatClashDate(war.endTime)}</span>
                                    </div>
                                    <div className="text-xs font-semibold bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                                        {war.teamSize} vs {war.teamSize}
                                    </div>
                                </div>

                                {/* Matchup Content */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        {/* My Clan */}
                                        <div className="flex-1 flex flex-col items-start">
                                            <div className="flex items-center space-x-2 mb-1">
                                                {war.clan.badgeUrls?.small && (
                                                    <img src={war.clan.badgeUrls.small} alt={war.clan.name} className="w-8 h-8 object-contain" />
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">{war.clan.name}</p>
                                                    <p className="text-xs text-gray-500">Lvl {war.clan.clanLevel}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-2xl font-bold text-gray-800">{war.clan.stars} <span className="text-yellow-500 text-lg">⭐</span></p>
                                                <p className="text-xs text-gray-600">{war.clan.destructionPercentage.toFixed(1)}% Dest.</p>
                                            </div>
                                        </div>

                                        {/* VS Divider */}
                                        <div className="px-4 flex flex-col items-center justify-center">
                                            <span className="text-gray-300 font-bold text-xl italic">VS</span>
                                        </div>

                                        {/* Opponent */}
                                        <div className="flex-1 flex flex-col items-end text-right">
                                            <div className="flex items-center space-x-2 flex-row-reverse space-x-reverse mb-1">
                                                {war.opponent.badgeUrls?.small ? (
                                                    <img src={war.opponent.badgeUrls.small} alt={war.opponent.name} className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">{war.opponent.name}</p>
                                                    <p className="text-xs text-gray-500">Lvl {war.opponent.clanLevel}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-2xl font-bold text-gray-800">{war.opponent.stars} <span className="text-yellow-500 text-lg">⭐</span></p>
                                                <p className="text-xs text-gray-600">{war.opponent.destructionPercentage.toFixed(1)}% Dest.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex space-x-4">
                                            <span className="flex items-center" title="Attacks Used">
                                                ⚔️ {war.clan.attacks}/{war.teamSize * war.attacksPerMember}
                                            </span>
                                            {war.clan.expEarned > 0 && (
                                                <span className="text-blue-600 font-medium flex items-center">
                                                    ✨ +{war.clan.expEarned} XP
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            {Math.abs(war.clan.destructionPercentage - war.opponent.destructionPercentage).toFixed(2)}% Diff
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {loading.warLog && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <LoadingSpinner />
                </div>
            )}
            
            {!warLogData && !loading.warLog && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-center text-gray-500">War log is private or unavailable</p>
                </div>
            )}
            
            {cwlData && cwlData.clans && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Clan War League</h3>
                    <p className="text-gray-600 mb-4">Season: {cwlData.season || 'Current'}</p>
                    <div className="space-y-2">
                        {cwlData.clans.map((clan, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="font-semibold text-gray-600">#{index + 1}</span>
                                    <span className="font-medium">{clan.name}</span>
                                </div>
                                <span className="font-semibold text-yellow-600">{clan.stars || 0} ⭐</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
window.WarsTab = WarsTab;