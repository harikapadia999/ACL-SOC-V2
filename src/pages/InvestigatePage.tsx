import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User as UserIcon,
  Search,
  Plus,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Investigation {
  id: string;
  title: string;
  date: string;
  messageCount: number;
  status: "active" | "completed";
  indicator?: "green" | "red";
}

export const InvestigatePage: React.FC = () => {
  const [activeInvestigation, setActiveInvestigation] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");

  const [investigations] = useState<Investigation[]>([
    {
      id: "1",
      title: "Phishing campaign analysis",
      date: "2015-04-2025",
      messageCount: 4,
      status: "active",
      indicator: "green",
    },
    {
      id: "2",
      title: "Lateral movement investigation",
      date: "2015-04-2025",
      messageCount: 4,
      status: "completed",
      indicator: "red",
    },
    {
      id: "3",
      title: "Phishing campaign analysis",
      date: "2015-04-2025",
      messageCount: 4,
      status: "completed",
      indicator: "green",
    },
    {
      id: "4",
      title: "Phishing campaign analysis",
      date: "2015-04-2025",
      messageCount: 4,
      status: "completed",
      indicator: "green",
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI-powered investigation assistant. I can help you search for failed login attempts, analyze suspicious activities, and investigate security incidents. What would you like to investigate?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I have searched the SIEM logs and found 47 failed log in attempts from IP 192.1654.6235 in the last 24 hours. Here is the break down :\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at nibh a erat elementum tempus. Suspendisse potenti. Quisque pellentesque, lacus eu volutpat finibus, neque felis porttitor odio, elementum posuere turpis nec urna. Integer auctor ligula eget orci convallis, in lobortis neque commodo.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at nibh a erat elementum tempus. Suspendisse potenti. Quisque pellentesque, lacus eu volutpat finibus, neque felis porttitor odio, elementum posuere turpis nec urna. Integer auctor ligula eget orci convallis, in lobortis neque commodo.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at nibh a erat elementum tempus. Suspendisse potenti. Quisque pellentesque, lacus eu volutpat finibus, neque felis porttitor odio, elementum posuere turpis nec urna. Integer auctor ligula eget orci convallis, in lobortis neque commodo.\n\nI have searched the SIEM logs and found 47 failed log in attempts from IP 192.1654.6235 in the last 24 hours. Here is the break down :\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at nibh a erat elementum tempus. Suspendisse potenti. Quisque pellentesque, lacus eu volutpat finibus, neque felis porttitor odio, elementum posuere turpis nec urna. Integer auctor ligula eget orci convallis, in lobortis neque commodo.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at nibh a erat elementum tempus. Suspendisse potenti. Quisque pellentesque, lacus eu volutpat finibus, neque felis porttitor odio, elementum posuere turpis nec urna. Integer auctor ligula eget orci convallis, in lobortis neque commodo.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredInvestigations = investigations.filter((inv) =>
    inv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeInv = investigations.find(
    (inv) => inv.id === activeInvestigation
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Investigation List Panel */}
      <div className="w-[360px] border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Investigations
            </h2>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search investigations"
              className="py-2 pr-4 pl-10 w-full text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Investigation List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filteredInvestigations.map((investigation) => (
            <button
              key={investigation.id}
              onClick={() => setActiveInvestigation(investigation.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                activeInvestigation === investigation.id
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* Folder Icon with Indicator */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <Folder className="w-5 h-5 text-slate-500" />
                  {investigation.indicator && (
                    <div
                      className={`absolute -top-1 -left-1 w-2 h-2 rounded-full border-2 border-white ${
                        investigation.indicator === "green"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {investigation.title}
                    </h3>
                    {investigation.status === "active" && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-slate-500">
                    {investigation.date}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-200 rounded">
                    {investigation.messageCount} messages
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeInv?.title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                AI powered investigation assistant
              </p>
            </div>
            {activeInv?.status === "active" && (
              <span className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {message.role === "user" ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              <div
                className={`flex-1 max-w-3xl ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block rounded-xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary-600 text-white rounded-tr-sm"
                      : "bg-slate-50 text-slate-900 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-full bg-slate-200">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
              <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-slate-50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-slate-400"></div>
                  <div className="w-2 h-2 rounded-full delay-100 animate-bounce bg-slate-400"></div>
                  <div className="w-2 h-2 rounded-full delay-200 animate-bounce bg-slate-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for questions or search for logs"
              className="flex-1 px-4 py-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Please enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
