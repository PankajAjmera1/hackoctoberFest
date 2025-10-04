import { useState, useRef, useEffect } from 'react';
import { Send, Github, Code, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import agentService from '../services/agentService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm **Open Source Buddy**. I'll help you find the perfect open-source projects to contribute to!\n\nTo get started, share your GitHub profile URL and I'll analyze your tech stack.",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageToSend = null) => {
    const messageContent = messageToSend || inputMessage;
    if (!messageContent.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageContent;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to agent service
      const response = await agentService.sendMessage(currentMessage, context);

      // Update context based on response intent
      if (response.intent === 'ASK_FOR_USERNAME') {
        setContext(prev => ({ ...prev, waitingForUsername: true }));
      } else if (response.intent === 'ANALYZE_GITHUB') {
        const githubUrl = agentService.extractGithubUrl(currentMessage);
        setContext(prev => ({ ...prev, githubUrl, analyzed: true, waitingForUsername: false }));
      } else if (response.intent === 'SUGGEST_PROJECTS') {
        setContext(prev => ({ ...prev, projectsShown: true }));
      } else if (response.intent === 'SUGGEST_CONTRIBUTIONS') {
        const repoUrl = agentService.extractGithubUrl(currentMessage);
        if (repoUrl) {
          setContext(prev => ({ ...prev, selectedRepo: repoUrl }));
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        intent: response.intent,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "😅 Oops! Something went wrong. Please try again or check your API configuration in the .env file.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Github, label: 'Analyze My GitHub', prompt: 'Analyze my GitHub profile' },
    { icon: Code, label: 'Find Projects', prompt: 'Find open-source projects matching my skills' },
    { icon: Sparkles, label: 'Suggest Contributions', prompt: 'How can I start contributing to open source?' },
  ];

  // Get smart suggestions based on message intent
  const getSuggestedPrompts = (message) => {
    if (message.type !== 'bot') return [];

    const intent = message.intent;
    
    // If waiting for username, show example usernames
    if (intent === 'ASK_FOR_USERNAME' || context.waitingForUsername) {
      return [
        { icon: '👤', text: 'Example: torvalds', prompt: 'torvalds' },
        { icon: '👤', text: 'Example: gaearon', prompt: 'gaearon' },
        { icon: '👤', text: 'Example: tj', prompt: 'tj' },
      ];
    }
    
    if (intent === 'ANALYZE_GITHUB' && context.analyzed) {
      return [
        { icon: '🔍', text: 'Find matching projects', prompt: 'Find open-source projects matching my skills' },
        { icon: '🎯', text: 'Show beginner-friendly projects', prompt: 'Show me beginner-friendly projects' },
        { icon: '🚀', text: 'Trending projects', prompt: 'What are trending open-source projects in my tech stack?' },
      ];
    }
    
    if (intent === 'SUGGEST_PROJECTS' && context.projectsShown) {
      return [
        { icon: '💡', text: 'How to start contributing?', prompt: 'How can I start contributing to these projects?' },
        { icon: '🔧', text: 'Good first issues', prompt: 'Show me good first issues in these projects' },
        { icon: '📚', text: 'More similar projects', prompt: 'Find more similar projects' },
      ];
    }

    if (intent === 'SUGGEST_CONTRIBUTIONS') {
      return [
        { icon: '📖', text: 'Explain the codebase', prompt: 'Explain the project structure' },
        { icon: '🎓', text: 'Learning resources', prompt: 'What should I learn before contributing?' },
        { icon: '👥', text: 'Community guidelines', prompt: 'What are the contribution guidelines?' },
      ];
    }

    // Default suggestions for general queries
    return [
      { icon: '🔗', text: 'Analyze my GitHub', prompt: 'Analyze my GitHub profile' },
      { icon: '🎯', text: 'Find projects', prompt: 'Find open-source projects for me' },
      { icon: '❓', text: 'Get started guide', prompt: 'How do I get started with open source?' },
    ];
  };

  const handleSuggestedPrompt = (prompt) => {
    // Auto-send if it's a complete prompt
    if (!prompt.endsWith(': ') && !prompt.endsWith('://')) {
      handleSendMessage(prompt);
    } else {
      // Just populate the input field for incomplete prompts
      setInputMessage(prompt);
    }
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';
    const isLastMessage = index === messages.length - 1;
    const suggestedPrompts = isBot && isLastMessage ? getSuggestedPrompts(message) : [];
    
    return (
      <div key={message.id}>
        <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
          <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isBot 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
              }`}>
                {isBot ? '🤖' : '👤'}
              </div>
            </div>

            {/* Message Content */}
            <div
              className={`rounded-2xl px-4 py-3 shadow-lg ${
                isBot
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              }`}
            >
              <div className={`prose prose-sm max-w-none ${isBot ? 'prose-slate' : 'prose-invert'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Customize link rendering
                    a: ({node, ...props}) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline" />
                    ),
                    // Customize code blocks
                    code: ({node, inline, ...props}) => (
                      inline 
                        ? <code {...props} className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" />
                        : <code {...props} className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto" />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className={`text-xs mt-2 ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Prompts - Only show for last bot message */}
        {suggestedPrompts.length > 0 && !isLoading && (
          <div className="flex justify-start mb-4 ml-13 animate-fade-in">
            <div className="flex flex-col space-y-2 max-w-[80%]">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                💡 Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                    className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 border border-purple-200 dark:border-purple-700 rounded-lg transition-all hover:shadow-md hover:scale-105"
                  >
                    <span className="text-sm">{suggestion.icon}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Open Source Buddy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered open source contribution finder
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Online
          </span>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex space-x-3 overflow-x-auto">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(action.prompt)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap"
            >
              <action.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  🤖
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your GitHub URL or ask about open-source projects..."
                rows="1"
                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:outline-none resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                inputMessage.trim() && !isLoading
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Powered by DigitalOcean Gradient AI • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
