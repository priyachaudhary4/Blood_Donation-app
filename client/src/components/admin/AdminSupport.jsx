import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import supportService from '../../services/supportService';
import { MessageSquare, Reply, User } from 'lucide-react';

const AdminSupport = () => {
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await supportService.getAllMessages();
            setMessages(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load messages');
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return;

        try {
            await supportService.replyToMessage(id, replyText);
            toast.success('Reply sent!');
            setReplyText('');
            setSelectedMessageId(null);
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-red-600" />
                Support Inbox
            </h2>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No messages found.</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className={`border rounded-lg p-4 ${msg.status === 'Open' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 p-2 rounded-full">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{msg.senderId?.name || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-500">{msg.senderId?.email} • {msg.senderId?.bloodType}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${msg.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {msg.status}
                                </span>
                            </div>

                            <div className="ml-12">
                                <p className="text-gray-800 mb-3 text-lg">{msg.message}</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    Sent: {new Date(msg.createdAt).toLocaleString()}
                                </p>

                                {msg.reply ? (
                                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500 font-bold mb-1">Your Reply:</p>
                                        <p className="text-gray-700">{msg.reply}</p>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        {selectedMessageId === msg._id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Type your reply..."
                                                    className="flex-1 px-4 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleReply(msg._id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                                                >
                                                    Send
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedMessageId(null);
                                                        setReplyText('');
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedMessageId(msg._id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Reply className="w-4 h-4" />
                                                Reply
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
