import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function ChatWindow({ receiver, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!receiver) return;
    socket.emit('joinRoom', user._id);
    const messageListener = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on('receiveMessage', messageListener);

    const initializeChat = async () => {
      try {
        const convRes = await api.get(`/conversations/${receiver._id}`);
        setConversationId(convRes.data._id);
        const messagesRes = await api.get(`/conversations/messages/${convRes.data._id}`);
        setMessages(messagesRes.data);
      } catch (error) {
        console.error('Failed to initialize chat', error);
      }
    };
    initializeChat();
    return () => {
      socket.off('receiveMessage', messageListener);
    };
  }, [receiver, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    // ✅ DEFINITIVE FIX for real-time messages
    const socketPayload = {
      sender: { _id: user._id, fullName: user.fullName },
      text: newMessage,
      receiverId: receiver._id,
    };
    socket.emit('sendMessage', socketPayload);

    // Optimistic update for your own screen
    setMessages((prev) => [...prev, { sender: { _id: user._id }, text: newMessage, createdAt: new Date() }]);
    
    // Save to DB in the background
    await api.post(`/conversations/send/${conversationId}`, { message: newMessage });
    setNewMessage('');
  };

  if (!receiver) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border flex flex-col z-50">
      <header className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <Avatar><AvatarFallback>{receiver.fullName.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <span className="font-semibold">{receiver.fullName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0"><X className="h-4 w-4" /></Button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-3 border-t bg-gray-50 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
          <Button type="submit"><Send className="h-4 w-4" /></Button>
        </form>
      </footer>
    </div>
  );
}