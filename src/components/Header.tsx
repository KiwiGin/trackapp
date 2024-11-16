import React from 'react'
import { Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Usuario } from '@/types/Usuario'
import { Button } from './ui/button'

function Header({user}: {user?:Usuario}) {
  return (
    <>
        <header className="w-full bg-[#FF4259] text-white p-4 flex justify-between items-center top-0 left-64 right-0 z-10">
            <div className="flex space-x-4 ml-auto">
              <Button variant="ghost" className="text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://www.example.com/user-avatar.jpg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {user?.usuario}
              </Button>
            </div>
          </header>
    </>
  )
}

export default Header