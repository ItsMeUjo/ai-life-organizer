import React, { useState } from 'react';

const RoutineChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow new lines with Shift + Enter
                return;
            }
            e.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, message]);
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <textarea
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={{ resize: 'none', height: 'auto' }} // Implement auto-resize
enable
d      
            />
        </div>
    );
};

export default RoutineChat;