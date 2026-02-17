import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import supportService from '../../services/supportService';
import { formatDateTime } from '../../utils/helpers';

const SupportTab = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await supportService.getMyMessages();
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await supportService.createMessage(newMessage);
            if (response.success) {
                toast.success('Message sent to support team');
                setNewMessage('');
                fetchMessages(); // Refresh list
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary-600" />
                        Support & Help Center
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Chat directly with our admin team for assistance.</p>
                </div>
            </div>

            <div className="p-6 grid gap-8 lg:grid-cols-3">
                {/* Message History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-700 mb-4">Your Conversation History</h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No support requests yet.</p>
                            <p className="text-xs text-gray-400">Start a conversation using the form.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg._id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                    {/* User Message */}
                                    <div className="bg-white p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">You</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDateTime(msg.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 text-sm leading-relaxed">{msg.message}</p>
                                    </div>

                                    {/* Admin Reply */}
                                    {msg.reply && (
                                        <div className="bg-gray-50 p-4 border-t border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Admin Response
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDateTime(msg.updatedAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm italic border-l-2 border-green-300 pl-3">
                                                {msg.reply}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status Footer */}
                                    {!msg.reply && (
                                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 italic flex items-center gap-1 border-t border-gray-50">
                                            <Clock className="w-3 h-3 text-orange-400" />
                                            Waiting for reply...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Message Form */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit sticky top-6">
                    <h3 className="font-bold text-gray-800 mb-4">Send New Message</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">How can we help?</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm min-h-[120px]"
                                placeholder="Describe your issue or question..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 active:transform active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                    <div className="mt-4 text-xs text-gray-400 text-center">
                        Typically replies within 24 hours.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTab;
