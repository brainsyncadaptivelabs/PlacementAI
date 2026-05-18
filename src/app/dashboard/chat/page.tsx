"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Sparkles, User, MoreHorizontal, Copy, ThumbsUp, RefreshCw } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: "ai", 
      content: "Hello Shreya! I'm your AI Career Assistant. How can I help you with your placement preparation today?", 
      time: "10:00 AM" 
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: "That's a great question! For a Full Stack role, I recommend focusing on System Design patterns and ensuring your projects demonstrate both frontend and backend proficiency. Would you like me to analyze your latest resume for these specific skills?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50/50">
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                 <Sparkles className="w-5 h-5" />
              </div>
              <div>
                 <h1 className="text-lg font-bold font-heading text-slate-900 leading-none">Career Assistant</h1>
                 <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AI Online
                 </p>
              </div>
           </div>
           <Button variant="ghost" size="icon" className="text-slate-400">
              <MoreHorizontal className="w-5 h-5" />
           </Button>
        </div>

        {/* Chat Content */}
        <Card className="flex-1 border-none shadow-xl bg-white/70 backdrop-blur-md overflow-hidden flex flex-col">
           <CardContent className="flex-1 p-0 overflow-hidden relative">
              <ScrollArea className="h-full px-6 py-8">
                 <div className="space-y-8">
                    {messages.map((msg) => (
                       <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <Avatar className={`w-8 h-8 shrink-0 ${msg.role === 'ai' ? 'bg-primary border border-primary/10' : 'bg-slate-200'}`}>
                             {msg.role === 'ai' ? (
                               <div className="flex items-center justify-center w-full h-full text-white">
                                  <Sparkles className="w-4 h-4" />
                               </div>
                             ) : (
                               <div className="flex items-center justify-center w-full h-full text-slate-500">
                                  <User className="w-4 h-4" />
                               </div>
                             )}
                          </Avatar>
                          <div className={`space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                             <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                               msg.role === 'ai' 
                               ? 'bg-white border border-slate-100 text-slate-800' 
                               : 'bg-primary text-white'
                             }`}>
                                {msg.content}
                             </div>
                             <div className={`flex items-center gap-3 px-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.time}</span>
                                {msg.role === 'ai' && (
                                   <div className="flex items-center gap-2">
                                      <button className="text-slate-300 hover:text-primary transition-colors"><Copy className="w-3 h-3" /></button>
                                      <button className="text-slate-300 hover:text-green-500 transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                    {isTyping && (
                       <div className="flex gap-4">
                          <Avatar className="w-8 h-8 shrink-0 bg-primary/10 border border-primary/5 flex items-center justify-center">
                             <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                          </Avatar>
                          <div className="bg-slate-100/50 p-4 rounded-2xl flex gap-1 items-center px-6">
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                          </div>
                       </div>
                    )}
                    <div ref={scrollRef} />
                 </div>
              </ScrollArea>
           </CardContent>

           <CardFooter className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about your career..." 
                className="flex-1 bg-slate-50 border-none h-12 px-6 focus-visible:ring-primary/20"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 p-0"
              >
                 <Send className="w-5 h-5" />
              </Button>
           </CardFooter>
        </Card>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 justify-center shrink-0">
           {[
             "How to improve my ATS score?",
             "What skills are needed for Backend?",
             "Generate a Java roadmap",
             "Mock interview tips"
           ].map((p) => (
             <button 
               key={p}
               onClick={() => setInput(p)}
               className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-full hover:border-primary hover:text-primary transition-all"
             >
                {p}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
