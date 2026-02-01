function ClanTab({ clanData, capitalRaidsData, loading }) {
    if (loading.clan && !clanData) {
        return <LoadingSpinner />;
    }

    if (!clanData) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-center text-gray-500">Player is not in a clan</p>
            </div>
        );
    }

    // Helper to get top contributors for raids
    const getTopContributors = (members) => {
        if (!members) return [];
        return [...members]
            .sort((a, b) => b.capitalResourcesLooted - a.capitalResourcesLooted)
            .slice(0, 3);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Clan Members</h3>
                {clanData.memberList && clanData.memberList.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Trophies</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Donated</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Received</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {clanData.memberList.map((member, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{member.name}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                member.role === 'leader' ? 'bg-yellow-100 text-yellow-800' :
                                                member.role === 'coLeader' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{member.trophies?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm">{member.donations?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm">{member.donationsReceived?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No member data available</p>
                )}
            </div>
            
            {capitalRaidsData && capitalRaidsData.items && capitalRaidsData.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Capital Raid Weekends</h3>
                    <div className="space-y-6">
                        {capitalRaidsData.items.map((raid, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 flex justify-between items-center text-white">
                                    <div>
                                        <span className="font-bold text-lg">
                                            {window.formatClashDate(raid.endTime)}
                                        </span>
                                        <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                            {raid.state}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-purple-100 text-sm">Total Loot:</span>
                                        <span className="font-bold text-xl">
                                            {raid.capitalTotalLoot?.toLocaleString()} 🪙
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Stats Column */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2">Overview</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Attacks</p>
                                                <p className="text-lg font-bold text-purple-700">{raid.totalAttacks}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Districts</p>
                                                <p className="text-lg font-bold text-blue-700">{raid.enemyDistrictsDestroyed}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Raids</p>
                                                <p className="text-lg font-bold text-green-700">{raid.raidsCompleted}</p>
                                            </div>
                                            <div className="bg-orange-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Avg Loot/Atk</p>
                                                <p className="text-lg font-bold text-orange-700">
                                                    {raid.totalAttacks > 0 
                                                        ? Math.round(raid.capitalTotalLoot / raid.totalAttacks).toLocaleString() 
                                                        : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Contributors Column */}
                                    <div className="lg:col-span-2">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">Top Contributors</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-500">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Rank</th>
                                                        <th className="px-3 py-2 text-left">Player</th>
                                                        <th className="px-3 py-2 text-right">Attacks</th>
                                                        <th className="px-3 py-2 text-right">Looted</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {getTopContributors(raid.members).map((member, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-2 font-medium text-gray-500">#{idx + 1}</td>
                                                            <td className="px-3 py-2 font-semibold text-gray-800">{member.name}</td>
                                                            <td className="px-3 py-2 text-right text-gray-600">
                                                                {member.attacks}/{member.attackLimit + (member.bonusAttackLimit || 0)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-bold text-purple-600">
                                                                {member.capitalResourcesLooted.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
window.ClanTab = ClanTab;