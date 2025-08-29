import React, { useState, FormEvent, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

interface ChatMessage {
  author: 'user' | 'bot';
  content: string;
}

// Data for the interactive accordion menu
const suggestionsData = {
  "Company Values": [
    "Create Value", "Put Client First", "Maintain High Standards", "Be Ethical", 
    "Think Long Term", "Take Ownership", "Solve, Not Crib", "Embrace Change", 
    "People Centric", "Think Strategic, Execute Flawlessly"
  ],
  "Leadership at 91Ninjas": [
    "Who is a leader?", "Get out of the employee mindset", "Work / Job Clarity",
    "Mentor and Delegate", "Pressure Handling", "Capability Building",
    "Ability to have hard conversations", "Know your team's strengths",
    "Get things done", "No ego", "No insecurities", "Emotional Control",
    "Promote the culture you want", "Know what you should communicate",
    "Lead with empathy", "Have an abundance mindset"
  ],
  "Company Structure": [
    "Who is in the Founder's Office?", "Who is on the Brand Team?", "Who is on the PPC Team?",
    "Who is on the SEO Team?", "Who is on the Content Team?", "Who is on the Design Team?"
  ],
  "Ninja Star": ["Help me write a Ninja Star post"]
};

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null); // State for the accordion
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage: ChatMessage = { author: 'user', content: messageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setExpandedCategory(null); // Close accordion after sending a message

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageText }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const botMessage: ChatMessage = { author: 'bot', content: data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Failed to fetch bot response:', error);
      const errorMessage: ChatMessage = { author: 'bot', content: 'Sorry, I ran into an error.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Meet Sensei</h1>
        <p>Your Guide to the 91Ninjas Clan</p>
      </div>
      <div className="messages-area">
        {messages.length === 0 && (
            <div className="message bot">
                <p>Welcome! Click a category below to see specific questions, or type your own.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.author}`}>
            <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }} />
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <p className="loading-dots"><span>.</span><span>.</span><span>.</span></p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* --- ACCORDION MENU SECTION --- */}
      <div className="accordion-container">
        {Object.keys(suggestionsData).map((category) => (
          <div key={category} className="accordion-item">
            <button className="category-button" onClick={() => handleCategoryClick(category)}>
              {category}
              <span className={`arrow ${expandedCategory === category ? 'expanded' : ''}`}>▼</span>
            </button>
            {expandedCategory === category && (
              <div className="sub-options">
                {suggestionsData[category as keyof typeof suggestionsData].map((option) => (
                  <button key={option} className="sub-option-button" onClick={() => sendMessage(option)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* --- END ACCORDION MENU SECTION --- */}

      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Or type your own question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          ➤
        </button>
      </form>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);