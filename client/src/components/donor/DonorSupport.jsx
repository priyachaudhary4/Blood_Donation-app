import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import supportService from '../../services/supportService';
import { Send, MessageSquare } from 'lucide-react';

const DonorSupport = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await supportService.getMyMessages();
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await supportService.createMessage(newMessage);
            toast.success('Message sent to support!');
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                <MessageSquare className="w-6 h-6 text-red-600" />
                Support & Help Center
            </h2>

            {/* Messages List - Chat Style */}
            <div className="flex-1 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet. Ask us anything!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className="flex flex-col space-y-2">
                            {/* User Message */}
                            <div className="flex justify-end">
                                <div className="bg-red-600 text-white p-3 rounded-l-lg rounded-tr-lg max-w-[80%]">
                                    <p>{msg.message}</p>
                                    <span className="text-xs text-red-100 block mt-1 text-right">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Admin Reply */}
                            {msg.reply && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-r-lg rounded-tl-lg max-w-[80%] shadow-sm">
                                        <p className="font-semibold text-xs text-red-600 mb-1">Support Team</p>
                                        <p className="text-gray-800">{msg.reply}</p>
                                        <span className="text-xs text-gray-400 block mt-1">
                                            {new Date(msg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                    <Send className="w-5 h-5" />
                    Send
                </button>
            </form>
        </div>
    );
};

export default DonorSupport;
