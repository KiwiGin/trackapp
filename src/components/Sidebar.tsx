import React, { useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown, Group, House, MessageCircle, PlusCircle } from 'lucide-react'
import { Workspace } from '@/types/Workspace';
import { useRouter } from 'next/navigation'

function Sidebar({handleNewWorkspace, workspaces}: {handleNewWorkspace: () => void; workspaces: Workspace[]}) {
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)
    const router = useRouter()
    function handleClick(id?:string) {
        console.log('click')
        router.push(`/workspace/${id}`)
    }

    function handleClickMenu() {
        console.log('click')
        router.push(`/`)
    }

    return (
        <>
            {/* Sidebar */}
            <section className='sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-[#090C08] p-6 text-white max-sm:hidden lg:w-[264px]'>

                <div className="border-r">
                    <h2 className="text-2xl font-bold mb-4">TrackApp</h2>
                    <nav>
                        <Button variant="ghost" className="w-full justify-start text-white" onClick={handleClickMenu}>
                            <House className="mr-2 h-4 w-4" /> Home
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2 text-white" onClick={() => router.push('/teams')}>
                            <Group className="mr-2 h-4 w-4" /> Teams
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2 text-white" onClick={() => router.push('/chat')}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Chat
                        </Button>
                        {/* Workspace Dropdown */}
                        <div className="mt-4">
                            <div className='flex flex-row'>
                                <div
                                    className="w-full justify-start mb-2 flex items-center hover:bg-gray-800 hover:rounded hover:cursor-pointer"
                                    onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                                >
                                    <div className="mr-2">
                                        <ChevronDown className={`h-4 w-4 transform transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    Workspace
                                </div>
                                <div className="w-7 justify-center mb-2 flex items-center hover:bg-gray-800 hover:rounded hover:cursor-pointer" onClick={handleNewWorkspace}>
                                    <div className="mr-2">
                                        <PlusCircle className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Menu for Workspace */}
                            {isWorkspaceOpen && (
                                <div className="pl-6 space-y-2">
                                    {workspaces.map((workspace,item) => (
                                        <Button key={item}
                                        onClick={() => handleClick(workspace.idWorkspace)} 
                                        variant="ghost" className="w-full justify-start text-gray-300">
                                            {workspace.nombre}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </section>
        </>
    )
}

export default Sidebar