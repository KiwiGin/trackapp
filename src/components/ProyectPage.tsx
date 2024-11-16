'use client'

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, MoreHorizontal, Plus, Calendar, Grid, BarChart3 } from 'lucide-react'

type Task = {
  id: string
  content: string
  status: string
}

type Board = {
  id: string
  title: string
  tasks: Task[]
}

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-4 bg-white border-b last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <input type="checkbox" className="rounded" aria-label={`Mark ${task.content} as complete`} />
        <span className="text-sm font-medium">{task.id}</span>
        <span className="text-sm">{task.content}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">TAREAS POR HACER</span>
        <Avatar className="h-6 w-6">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default function ProyectPage() {
  const [activeTab, setActiveTab] = useState("backlog")
  const [boards, setBoards] = useState<Board[]>([
    {
      id: "sprint1",
      title: "Tablero Sprint 1",
      tasks: []
    },
    {
      id: "sprint2",
      title: "Tablero Sprint 2",
      tasks: [
        { id: "SCRUM-3", content: "tarea1", status: "TODO" },
        { id: "SCRUM-2", content: "algo", status: "TODO" },
        { id: "SCRUM-4", content: "tarea2", status: "TODO" },
        { id: "SCRUM-1", content: "historia sobre algo", status: "TODO" },
      ]
    },
    {
      id: "backlog",
      title: "Backlog",
      tasks: []
    }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setBoards((boards) => {
        const oldIndex = boards.findIndex((board) => 
          board.tasks.some((task) => task.id === active.id)
        )
        const newIndex = boards.findIndex((board) => 
          board.tasks.some((task) => task.id === over?.id)
        )

        if (oldIndex === newIndex) {
          // If within the same board, just reorder the tasks
          const boardIndex = oldIndex
          const oldTaskIndex = boards[boardIndex].tasks.findIndex((task) => task.id === active.id)
          const newTaskIndex = boards[boardIndex].tasks.findIndex((task) => task.id === over?.id)

          const newTasks = arrayMove(boards[boardIndex].tasks, oldTaskIndex, newTaskIndex)

          const newBoards = [...boards]
          newBoards[boardIndex] = { ...newBoards[boardIndex], tasks: newTasks }
          return newBoards
        } else {
          // If between different boards, move the task
          const oldBoardIndex = oldIndex
          const newBoardIndex = newIndex
          const taskToMove = boards[oldBoardIndex].tasks.find((task) => task.id === active.id)!

          const newBoards = [...boards]
          newBoards[oldBoardIndex].tasks = newBoards[oldBoardIndex].tasks.filter((task) => task.id !== active.id)
          newBoards[newBoardIndex].tasks = [...newBoards[newBoardIndex].tasks, taskToMove]

          return newBoards
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Project 1</h1>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="User avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="secondary">Scrum Configuration</Button>
            <Button variant="ghost" size="icon" aria-label="Grid view">
              <Grid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 p-6">
          <div className="w-64">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Epic</h2>
                <Button variant="ghost" size="sm" aria-label="Add epic">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Incidencias sin epic</div>
                <div className="pl-4 space-y-2">
                  <div className="text-sm">Página web para sacar citas</div>
                  <div className="text-sm">Sistema de gestión de citas perdidas</div>
                  <div className="text-sm">SSDA</div>
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" /> Crear epic
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex-1 space-y-4">
            {boards.map((board) => (
              <Card key={board.id}>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      <span>{board.title}</span>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Añadir fechas
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{board.tasks.length} incidencias</span>
                      <Button variant="ghost" size="sm">
                        Iniciar sprint
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="More options">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {board.tasks.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {board.id === "backlog" ? "Tu backlog está vacío." : "No hay tareas en este sprint."}
                        </p>
                      </div>
                    ) : (
                      <SortableContext items={board.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                        {board.tasks.map((task) => (
                          <SortableTask key={task.id} task={task} />
                        ))}
                      </SortableContext>
                    )}
                    <div className="p-4 border-t">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" /> Crear incidencia
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  )
}