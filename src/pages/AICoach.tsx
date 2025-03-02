
import React, { useState, useEffect, useRef } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { Bot, Send, BrainCircuit, Sparkles, Dumbbell, Salad, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { generateCoachResponse, isOpenAIConfigured } from "@/services/openaiAPI";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

const AICoach: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm your AI performance coach. I analyze your sleep and training data to provide personalized insights. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openAIConfigured, setOpenAIConfigured] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenAIConfigured(isOpenAIConfigured());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    if (!openAIConfigured) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please add your OpenAI API key in Settings to use the AI Coach.",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessageId = Date.now();
    const userMessage: Message = {
      id: userMessageId,
      type: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Get response from OpenAI
      const response = await generateCoachResponse(inputValue);
      
      if (response) {
        const botMessage: Message = {
          id: Date.now(),
          type: "bot",
          content: response,
          timestamp: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to generate response");
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now(),
        type: "bot",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please check your OpenAI API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    { icon: <BrainCircuit className="w-4 h-4" />, text: "How's my recovery today?" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Optimize my sleep" },
    { icon: <Dumbbell className="w-4 h-4" />, text: "Training recommendations" },
    { icon: <Salad className="w-4 h-4" />, text: "Nutrition advice" },
    { icon: <Clock className="w-4 h-4" />, text: "Weekly training plan" },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16 h-screen flex flex-col">
        <section className="mb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="w-8 h-8" />
              AI Coach
            </h1>
            <p className="text-muted-foreground">
              Your personalized AI coach providing insights based on your health and performance data
            </p>
          </div>
        </section>

        {!openAIConfigured && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                OpenAI API key not configured. Please add your API key in{" "}
                <Link to="/settings" className="font-medium underline">
                  Settings
                </Link>{" "}
                to use the AI Coach.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>
          
          <div className="p-4 border-t">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 whitespace-nowrap"
                  onClick={() => {
                    setInputValue(question.text);
                  }}
                >
                  {question.icon}
                  <span>{question.text}</span>
                </Button>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading || !openAIConfigured}
                title={!openAIConfigured ? "OpenAI API key required" : ""}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AICoach;
