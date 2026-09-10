import { X, Send, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface DoctorChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function DoctorChat({ isOpen, onClose }: DoctorChatProps) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    'Why is this critical?',
    'What happens if I ignore it?',
    'Can you fix this safely?',
    'Explain this architecture',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    // Mock response
    setTimeout(() => {
      const response: Message = {
        role: 'assistant',
        content: `I understand you're asking about "${input}". Based on the current context (${location.pathname}), here's what I can tell you...`,
      };
      setMessages((prev) => [...prev, response]);
    }, 500);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 md:right-4 md:left-auto md:w-96 h-[600px] max-h-[calc(100vh-6rem)] bg-background border rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Repo Doctor</h3>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Ask me anything about your repository
            </p>
            <div className="space-y-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="block w-full px-3 py-2 text-sm text-left bg-muted/50 hover:bg-muted rounded-md transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this repository..."
            className="flex-1 px-3 py-2 bg-muted/50 border border-transparent rounded-md text-sm focus:outline-none focus:border-primary focus:bg-background transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
