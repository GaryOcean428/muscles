import React, { useState, useEffect } from 'react'
import { supabase, EDGE_FUNCTIONS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mic, MicOff, Send, Loader2, MessageCircle, User, Bot } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn, FITCRAFT_STEPS, FITCRAFT_STEP_LABELS } from '@/lib/utils'
import { FitCraftChatRequest, FitCraftChatResponse, AIChatMessage } from '@/types'

interface ChatMessage {
  id: string
  content: string
  isFromAI: boolean
  timestamp: string
  step?: number
}

interface VoiceRecognition {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
}

// Voice recognition types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onend: () => void
  onerror: (event: { error: string }) => void
}

function useVoiceRecognition(): VoiceRecognition {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition failed')
      }
      
      setRecognition(recognitionInstance)
      setIsSupported(true)
    }
  }, [])

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('')
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening
  }
}

export default function FitCraftCoach() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepData, setStepData] = useState<any>({})
  const voice = useVoiceRecognition()

  // Initialize welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        content: `Welcome to FitCraft Coach! I'm your personal AI fitness trainer, and I'm here to create the perfect workout plan just for you. Let's start by getting to know each other better.\n\nWhat are your main fitness goals? Are you looking to lose weight, build muscle, improve endurance, or something else?`,
        isFromAI: true,
        timestamp: new Date().toISOString(),
        step: FITCRAFT_STEPS.WELCOME
      }
      setMessages([welcomeMessage])
    }
  }, [user, messages.length])

  // Handle voice input
  useEffect(() => {
    if (voice.transcript && !loading) {
      setInput(voice.transcript)
    }
  }, [voice.transcript, loading])

  const sendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || !user) return

    setLoading(true)
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      isFromAI: false,
      timestamp: new Date().toISOString(),
      step: currentStep
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const chatRequest: FitCraftChatRequest = {
        message: messageText,
        conversationId,
        userId: user.id,
        currentStep,
        stepData
      }

      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.FITCRAFT_AI_CHAT, {
        body: chatRequest
      })

      if (error) {
        throw new Error(error.message)
      }

      const response: FitCraftChatResponse = data.data

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isFromAI: true,
        timestamp: response.timestamp,
        step: response.currentStep
      }
      setMessages(prev => [...prev, aiMessage])

      // Update conversation state
      setConversationId(response.conversationId)
      
      // Progress through steps based on AI response context
      if (response.currentStep > currentStep) {
        setCurrentStep(response.currentStep)
      }

    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message. Please try again.')
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try sending your message again.',
        isFromAI: true,
        timestamp: new Date().toISOString(),
        step: currentStep
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getCurrentStepLabel = () => {
    return FITCRAFT_STEP_LABELS[currentStep as keyof typeof FITCRAFT_STEP_LABELS] || 'Chat'
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              FitCraft Coach
            </CardTitle>
            <CardDescription>
              Please sign in to start your personalized fitness journey
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitCraft Coach</h1>
                <p className="text-sm text-gray-600">Your AI Fitness Trainer</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              Step {currentStep}/12: {getCurrentStepLabel()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chat with FitCraft Coach</CardTitle>
              <Badge variant="secondary" className="sm:hidden">
                {currentStep}/12
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      message.isFromAI ? "" : "ml-auto flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.isFromAI 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-500 text-white"
                    )}>
                      {message.isFromAI ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg whitespace-pre-wrap",
                      message.isFromAI
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-100 border border-gray-200"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">FitCraft Coach is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message or use voice input..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="pr-12"
                  />
                  {voice.isSupported && (
                    <Button
                      size="sm"
                      variant={voice.isListening ? "destructive" : "outline"}
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={voice.isListening ? voice.stopListening : voice.startListening}
                      disabled={loading}
                    >
                      {voice.isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-10"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {voice.isListening && (
                <div className="mt-2">
                  <Badge variant="destructive" className="animate-pulse">
                    Listening... Speak now
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}