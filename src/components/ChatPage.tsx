'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Phone, Video, MoreVertical, Paperclip, Send } from "lucide-react"

type Message = {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'John Doe', content: 'como tan', timestamp: '10:30 AM' },
    { id: 2, sender: 'Jane Smith', content: 'bien', timestamp: '10:32 AM' },
    { id: 3, sender: 'Alice Johnson', content: 'si mecesitan ayuda me llaman', timestamp: '10:35 AM' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
    }
  }

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <Input placeholder="Search chats" className="mb-4" />
          <h2 className="text-lg font-semibold mb-2">Recent Chats</h2>
          <div className="space-y-2">
            {['John Doe', 'Jane Smith', 'Alice Johnson'].map((name) => (
              <Button key={name} variant="ghost" className="w-full justify-start">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={name} />
                  <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">John Doe</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <Card key={message.id} className="mb-4">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={message.sender} />
                    <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{message.sender}</p>
                      <p className="text-xs text-gray-500">{message.timestamp}</p>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>

        {/* Message input */}
        <div className="bg-white p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input 
              placeholder="Type a message" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}