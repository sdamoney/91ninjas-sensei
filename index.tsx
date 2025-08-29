// src/index.tsx

import React, { useState, FormEvent, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // We will replace the CSS next

// Define the structure of a chat message
interface ChatMessage {
  author: 'user' | 'bot';
  content: string;
}

const App = () => {
  // State to hold the user's current input
  const [input, setInput] = useState('');
  // State to hold the conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State to show a "Bot is thinking..." message
  const [isLoading, setIsLoading] = useState(false);
  // Ref to scroll to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // This function is called when you click the send button
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    if (!input.trim() || isLoading) return; // Don't send empty messages or while loading

    const userMessage: ChatMessage = { author: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      // Send the user's message to our API endpoint
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: ChatMessage = { author: 'bot', content: data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Failed to fetch bot response:', error);
      const errorMessage: ChatMessage = { author: 'bot', content: 'Sorry, I ran into an error. Please try again.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Meet Sensei</h1>
        <p>Your Guide to the 91Ninjas Clan</p>
      </div>
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.author}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <p className="loading-dots"><span>.</span><span>.</span><span>.</span></p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          ➤
        </button>
      </form>
    </div>
  );
};

// This part renders the App in your HTML
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);