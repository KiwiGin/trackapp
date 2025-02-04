import React from 'react'
import { Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Usuario } from '@/types/Usuario'
import { Button } from './ui/button'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";

function Header({ user }: { user?: Usuario }) {
  return (
    <>
      <header className="w-full bg-[#FF4259] text-white p-4 flex justify-between items-center top-0 left-64 right-0 z-10">
        <div className="flex space-x-4 ml-auto">
          <Button variant="ghost" className="text-white">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-white">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://www.example.com/user-avatar.jpg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {user?.usuario}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white text-black rounded-md shadow-md py-2"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onSelect={() => console.log("Mi Perfil")}
                >
                  Mi Perfil
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onSelect={() => signOut()}
                >
                  Cerrar Sesión
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
    </>
  )
}

export default Header