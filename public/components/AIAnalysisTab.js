function AIAnalysisTab({ playerData }) {
    const { useState, useRef, useEffect } = React;
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your Clash Advisor. I have access to your latest profile, clan, and war data. Ask me anything about your strategy, upgrades, or current war!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Use the same server URL as the dashboard
    const MCP_SERVER_URL = 'https://clash-mcp-server.gangz.workers.dev';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAction = async (actionType, displayText = null) => {
        if (loading) return;
        setLoading(true);

        const userMsg = { role: 'user', content: displayText || input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${MCP_SERVER_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType, // 'chat' or specific analysis
                    messages: [...messages, userMsg].filter(m => m.role !== 'system'),
                    playerTag: playerData?.tag,
                    clanTag: playerData?.clan?.tag
                })
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            // Cloudflare AI workers typically return { response: "text" }
            const aiResponse = data.response || "I couldn't generate a response.";
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error: ' + err.message }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleAction('chat');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <h3 className="text-xl font-bold flex items-center">
                    <span className="mr-2">🤖</span> Clash AI Advisor
                </h3>
                <p className="text-sm opacity-90">Powered by Claude 3.5 Sonnet</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-100 p-3 flex gap-2 overflow-x-auto border-b border-gray-200">
                <button onClick={() => handleAction('analyze-player', 'Analyze my profile')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition">
                    👤 Analyze Profile
                </button>
                {playerData?.clan && (
                    <>
                        <button onClick={() => handleAction('analyze-clan', 'Analyze my clan')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition">
                            🛡️ Analyze Clan
                        </button>
                        <button onClick={() => handleAction('analyze-current-war', 'Analyze current war')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition">
                            ⚔️ Analyze War
                        </button>
                        <button onClick={() => handleAction('analyze-war-log', 'Analyze war log')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition">
                            📜 War Log
                        </button>
                    </>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                        }`}>
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-500 shadow-sm border border-gray-200 rounded-lg rounded-bl-none p-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
window.AIAnalysisTab = AIAnalysisTab;