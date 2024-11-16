'use client'
import { signIn, useSession } from 'next-auth/react'
import React, { useEffect, useState} from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle,CheckCircle, Clock, AlertCircle} from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import ModalWorkspace from './ModalWorkspace'
import { createWorkspace, getWorkspaceByIdUsuario } from '@/lib/firebaseUtils'
import { Workspace } from '@/types/Workspace'

export default function MainDashboard() {
  const { data: session, status } = useSession();
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn();
    }
  }, [session, status]);

  useEffect(() => {
    if (!session) return;
    getWorkspaceByIdUsuario(session.user.id).then(setWorkspaces);
  }, [session]);
  
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }
  
  if (!session) {
    return <div className="flex items-center justify-center h-screen">No autorizado</div>
  }
  const { user } = session;

  

  const handleOpenModal = () => {
    setIsWorkspaceModalOpen(true); // Abre la modal
  };

  const handleCloseModal = () => {
    setIsWorkspaceModalOpen(false); // Cierra la modal
  };

  const handleCreate = async (workspaceName: string) => {
    console.log('Crear Workspace:', workspaceName);
  
    // Asegúrate de que todos los campos tengan valores definidos
    const workspace = {
      nombre: workspaceName || "", // Si no hay nombre, asigna una cadena vacía
      idUsuarios: [user.id], // Si no tienes idUsuario, asigna un array vacío
      idProyectos: [], // Si no tienes proyectos, asigna un array vacío
      idEquipo: "" // Si no tienes idEquipo, asigna una cadena vacía
    };
  
    try {
      const workspaceId = await createWorkspace(workspace);
      console.log('Workspace creado:', workspaceId);
      // Actualiza el estado con el nuevo workspace creado
      setWorkspaces((prevWorkspaces) => [
        ...prevWorkspaces,
        { ...workspace, idWorkspace: workspaceId } // Se agrega el nuevo workspace sin recargar la página
      ]);
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear el workspace:', error);
    }
  };

  
  

  return (
    <>

      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar handleNewWorkspace={handleOpenModal} workspaces={workspaces}/>

        {/* Main */}
        <div className='flex flex-col w-full'>
          {/* Header */}
          <Header user={user} />

          {/* Main Content */}
          <div className="flex-1 p-8">


            <Tabs defaultValue="tasks" className="w-full">
              <TabsList>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="tasks" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>To Do</CardTitle>
                      <CardDescription>Tareas que necesitan empezar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <TaskCard
                          title="Frontend worskpaces"
                          description="Crear la vista de los espacios de trabajo"
                          dueDate="2024-07-15"
                          priority="high"
                        />
                        <TaskCard
                          title="Equipos de trabajo"
                          description="Crear la vista de los equipos de trabajo"
                          dueDate="2024-07-20"
                          priority="medium"
                        />
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* In Progress Column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>In Progress</CardTitle>
                      <CardDescription>Tareas en progreso</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <TaskCard
                          title="Api de usuarios"
                          description="Desarrollar la api de usuarios con Next.js"
                          dueDate="2024-07-18"
                          priority="high"
                        />
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Done Column */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Done</CardTitle>
                      <CardDescription>Tareas completadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <TaskCard
                          title="Login firebase"
                          description="Conectar login con firebase auth"
                          dueDate="2024-07-10"
                          priority="high"
                          completed
                        />
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="chat" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Chat</CardTitle>
                    <CardDescription>Comunicate con los miembros de tu equipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] mb-4">
                      <ChatMessage
                        user="Alice Johnson"
                        message="hola equipo, revisen el doc que subí al drive"
                        timestamp="10:30 AM"
                      />
                      <ChatMessage
                        user="Bob Smith"
                        message="esta bien, lo revisaré ahora mismo"
                        timestamp="10:35 AM"
                      />
                      <ChatMessage
                        user="Charlie Brown"
                        message="buena presentación, Alice"
                        timestamp="11:15 AM"
                      />
                    </ScrollArea>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Type your message..." />
                      <Button>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>
      {/* Modal para crear nuevo Workspace */}
      {isWorkspaceModalOpen && <ModalWorkspace handleCloseModal={handleCloseModal} handleCreate={handleCreate} />
      }

    </>

  )
}

function TaskCard({ title, description, dueDate, priority, completed = false }: { title: string, description: string, dueDate: string, priority: string, completed?: boolean }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{dueDate}</span>
          </div>
          <Badge variant={priority === 'high' ? 'destructive' : 'default'}>
            {priority}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {completed ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
          {completed ? 'Completed' : 'Mark as Complete'}
        </Button>
      </CardFooter>
    </Card>
  )
}

function ChatMessage({ user, message, timestamp }: { user: string, message: string, timestamp: string }) {
  return (
    <div className="flex items-start space-x-4 mb-4">
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`} />
        <AvatarFallback>{user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{user}</h4>
          <span className="text-sm text-gray-500">{timestamp}</span>
        </div>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  )
}
