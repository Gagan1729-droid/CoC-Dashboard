function LoginForm({ onLogin, playerTag, setPlayerTag, loading, error }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">⚔️ Clash Dashboard</h1>
                    <p className="text-gray-600">Enter your player tag to continue</p>
                </div>
                
                <form onSubmit={onLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Player Tag
                        </label>
                        <input
                            type="text"
                            value={playerTag}
                            onChange={(e) => setPlayerTag(e.target.value)}
                            placeholder="#2PP or 2PP"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your Clash of Clans player tag</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </span>
                        ) : 'View Dashboard'}
                    </button>
                </form>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>💡 This dashboard uses live Clash of Clans API data</p>
                    <p className="mt-2">Example tag: <code className="bg-gray-100 px-2 py-1 rounded">#2PP</code></p>
                </div>
            </div>
        </div>
    );
}
window.LoginForm = LoginForm;