function TroopsTab({ playerData, loading }) {
    if (!playerData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Troops</h3>
            {playerData.troops && playerData.troops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playerData.troops.map((troop, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-800">{troop.name}</span>
                                <span className="text-sm text-gray-600">Lv {troop.level}/{troop.maxLevel}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="resource-bar h-2 rounded-full"
                                    style={{ width: `${(troop.level / troop.maxLevel) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No troop data available</p>
            )}
            
            {playerData.heroes && playerData.heroes.length > 0 && (
                <>
                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Heroes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playerData.heroes.map((hero, index) => (
                            <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-800">{hero.name}</span>
                                    <span className="text-sm text-gray-600">Lv {hero.level}/{hero.maxLevel}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                                        style={{ width: `${(hero.level / hero.maxLevel) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {playerData.spells && playerData.spells.length > 0 && (
                <>
                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Spells</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playerData.spells.map((spell, index) => (
                            <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-800">{spell.name}</span>
                                    <span className="text-sm text-gray-600">Lv {spell.level}/{spell.maxLevel}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                                        style={{ width: `${(spell.level / spell.maxLevel) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
window.TroopsTab = TroopsTab;