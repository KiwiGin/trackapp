'use client'

import { useEffect, useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, closestCorners, DragOverlay, useDroppable } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, MoreHorizontal, Plus, Calendar, Grid, PlusCircle } from 'lucide-react'
import { Tarea } from "@/types/Tarea"
import { Proyecto } from "@/types/Proyecto"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
// import { LoadingCharger } from "./LoginCharger";
import { Input } from "./ui/input"
import ModalTask from "./ModalTask"
import { Incidencia } from "@/types/Incidencia"
import { Epic } from "@/types/Epic"

type Column = {
  id: string
  title: string
  tasks: Tarea[]
}

type ColumnEpic = {
  id: string
  title: string
  tasks: Epic[]
}

type Board = {
  id: string
  title: string
  tasks: Tarea[]
}

const SortableTaskKB = ({ task }: { task: Tarea }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.idTarea })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 cursor-move bg-white shadow-sm hover:bg-gray-50">
      <CardContent className="p-3 text-sm">
        {task.titulo}
      </CardContent>
    </Card>
  )
}

const SortableEpicBoard = ({ task }: { task: Epic }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.idEpic })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 cursor-move bg-white shadow-sm hover:bg-gray-50">
      <CardContent className="p-3 text-sm">
        {task.resumen}
      </CardContent>
    </Card>
  )
}

const Column = ({ column, tasks, onAddTask }: { column: Column, tasks: Tarea[], onAddTask: (columnId: string, content: string) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [newTaskContent, setNewTaskContent] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      onAddTask(column.id, newTaskContent.trim());
      setNewTaskContent('');
    }
  };

  return (
    <Card
      ref={setNodeRef}
      className={`w-72 mx-2 bg-gray-100 border-t-4 ${isOver ? 'border-t-blue-700' : 'border-t-blue-500'}`}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500">{tasks.length} issues</div>
      </CardHeader>
      <CardContent className="p-2">
        <SortableContext
          items={tasks.map(task => task.idTarea)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskKB key={task.idTarea} task={task} />
          ))}
        </SortableContext>
        <form onSubmit={handleAddTask} className="mt-2">
          <Input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="Add a task..."
            className="mb-2"
          />
          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


const ColumnEpic = ({ column, epics, onAddEpic }: { column: ColumnEpic, epics: Epic[], onAddEpic: (columnId: string, content: string) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [newEpicContent, setNewEpicContent] = useState('');

  const handleAddEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEpicContent.trim()) {
      onAddEpic(column.id, newEpicContent.trim());
      setNewEpicContent('');
    }
  };

  return (
    <Card
      ref={setNodeRef}
      className={`w-72 mx-2 bg-gray-100 border-t-4 ${isOver ? 'border-t-blue-700' : 'border-t-blue-500'}`}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500">{epics.length} issues</div>
      </CardHeader>
      <CardContent className="p-2">
        <SortableContext
          items={epics.map(task => task.idEpic)}
          strategy={verticalListSortingStrategy}
        >
          {epics.map((task) => (
            <SortableEpicBoard key={task.idEpic} task={task} />
          ))}
        </SortableContext>
        <form onSubmit={handleAddEpic} className="mt-2">
          <Input
            type="text"
            value={newEpicContent}
            onChange={(e) => setNewEpicContent(e.target.value)}
            placeholder="Add a task..."
            className="mb-2"
          />
          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AddBoardForm = ({ onAddBoard }: { onAddBoard: (title: string) => void }) => {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAddBoard(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New board name"
        className="flex-grow"
      />
      <Button type="submit">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Board
      </Button>
    </form>
  )
}

function SortableTask({ task }: { task: Tarea }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.idTarea })

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
        <input type="checkbox" className="rounded" aria-label={`Mark ${task.titulo} as complete`} />
        <span className="text-sm font-medium">{task.idTarea}</span>
        <span className="text-sm">{task.titulo}</span>
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

export default function ProyectPage({ proyecto }: { proyecto: Proyecto }) {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', tasks: [{ idTarea: 'task1', titulo: 'Design new feature' }, { idTarea: 'task2', titulo: 'Update documentation' }] },
    { id: 'inProgress', title: 'In Progress', tasks: [{ idTarea: 'task3', titulo: 'Refactor authentication system' }] },
    { id: 'done', title: 'Done', tasks: [] },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const workspaceId = proyecto.idWorkspace;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("backlog")
  console.log(isLoading);
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
        { idTarea: "SCRUM-3", titulo: "tarea1", estado: "TODO" },
        { idTarea: "SCRUM-2", titulo: "algo", estado: "TODO" },
        { idTarea: "SCRUM-4", titulo: "tarea2", estado: "TODO" },
        { idTarea: "SCRUM-1", titulo: "historia sobre algo", estado: "TODO" },
      ]
    },
    {
      id: "backlog",
      title: "Backlog",
      tasks: []
    }
  ])

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      signIn();
    } else if (session && (!proyecto.idUsuarios.includes(session.user.id))) {
      router.push('/');
    } else {
      setIsLoading(false);
    }

  }, [session, status, router, proyecto.idUsuarios]);

  const handleOpenModalTask = () => {
    setIsTaskModalOpen(true)
  }


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(String(active.id)) // Convertir a string
  }


  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeColumn = columns.find(col => col.tasks.some(task => task.idTarea === active.id))
    const overColumn = columns.find(col => col.id === over.id || col.tasks.some(task => task.idTarea === over.id))

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    setColumns(prev => {
      const activeTask = activeColumn.tasks.find(task => task.idTarea === active.id)!
      const updatedColumns = prev.map(col => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: col.tasks.filter(task => task.idTarea !== active.id) }
        }
        if (col.id === overColumn.id) {
          return { ...col, tasks: [...col.tasks, activeTask] }
        }
        return col
      })
      return updatedColumns
    })
  }

  const handleDragEndKB = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeColumn = columns.find(col => col.tasks.some(task => task.idTarea === active.id))
    const overColumn = columns.find(col => col.id === over.id || col.tasks.some(task => task.idTarea === over.id))

    if (!activeColumn || !overColumn) return

    if (activeColumn !== overColumn) {
      setColumns(prev => {
        const activeTask = activeColumn.tasks.find(task => task.idTarea === active.id)!
        return prev.map(col => {
          if (col.id === activeColumn.id) {
            return { ...col, tasks: col.tasks.filter(task => task.idTarea !== active.id) }
          }
          if (col.id === overColumn.id) {
            return { ...col, tasks: [...col.tasks, activeTask] }
          }
          return col
        })
      })
    } else {
      const oldIndex = activeColumn.tasks.findIndex(task => task.idTarea === active.id)
      const newIndex = activeColumn.tasks.findIndex(task => task.idTarea === over.id)

      setColumns(prev => {
        const newTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex)
        return prev.map(col => {
          if (col.id === activeColumn.id) {
            return { ...col, tasks: newTasks }
          }
          return col
        })
      })
    }

    setActiveId(null)
  }

  const addBoard = (title: string) => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      tasks: []
    }
    setColumns(prev => [...prev, newColumn])
  }

  const addTask = (columnId: string, content: string) => {
    const newTask: Tarea = {
      idTarea: `task-${Date.now()}`,
      titulo: content
    }
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
    ))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setBoards((boards) => {
        const oldIndex = boards.findIndex((board) =>
          board.tasks.some((task) => task.idTarea === active.id)
        )
        const newIndex = boards.findIndex((board) =>
          board.tasks.some((task) => task.idTarea === over?.id)
        )

        if (oldIndex === newIndex) {
          // If within the same board, just reorder the tasks
          const boardIndex = oldIndex
          const oldTaskIndex = boards[boardIndex].tasks.findIndex((task) => task.idTarea === active.id)
          const newTaskIndex = boards[boardIndex].tasks.findIndex((task) => task.idTarea === over?.id)

          const newTasks = arrayMove(boards[boardIndex].tasks, oldTaskIndex, newTaskIndex)

          const newBoards = [...boards]
          newBoards[boardIndex] = { ...newBoards[boardIndex], tasks: newTasks }
          return newBoards
        } else {
          // If between different boards, move the task
          const oldBoardIndex = oldIndex
          const newBoardIndex = newIndex
          const taskToMove = boards[oldBoardIndex].tasks.find((task) => task.idTarea === active.id)!

          const newBoards = [...boards]
          newBoards[oldBoardIndex].tasks = newBoards[oldBoardIndex].tasks.filter((task) => task.idTarea !== active.id)
          newBoards[newBoardIndex].tasks = [...newBoards[newBoardIndex].tasks, taskToMove]

          return newBoards
        }
      })
    }
  }

  const handleCreateTask = async (incidencia: Incidencia) => {
    console.log('Crear Proyecto:', incidencia.resumen);
    // let tarea = {};
    // let epic = {};
    // Asegúrate de que todos los campos tengan valores definidos
    try {
      if (incidencia.tipo == "Tarea") {
        // tarea = {
        //   titulo: incidencia.resumen,
        //   descripcion: incidencia.descripcion,
        //   estado: incidencia.estado,
        //   tipo: incidencia.tipo,
        //   asignado: incidencia.idUsuario,
        //   idEpic: incidencia.idEpic,
        //   idProyecto: proyecto.idProyecto
        // }

      } else if (incidencia.tipo == "Epic") {
        // epic = {
        //   resumen: incidencia.resumen,
        //   descripcion: incidencia.descripcion,
        //   asignado: incidencia.idUsuario,
        //   idProyecto: proyecto.idProyecto
        // }
      }

    } catch (error) {
      console.error('Error al crear la tarea:', error);
    }


    // try {
    //     const equipoId = await createTeam(equipo);
    //     console.log('Equipo creado:', equipoId);
    //     setEquipos((prevEquipos) => [
    //         ...prevEquipos,
    //         { idEquipo: equipoId, ...equipo }
    //     ]);
    // } catch (error) {
    //     console.error('Error al crear el proyecto:', error);
    // }
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}

        {/* Main */}
        <div className='flex flex-col w-full'>
          {/* Header */}

          <div className="min-h-screen bg-gray-100">

            <header className="bg-white border-b">
              <div className="flex items-center justify-between px-6 py-4">
                <h1 className="text-xl font-bold">{proyecto.nombre}</h1>
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

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {activeTab === "backlog" && (
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
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCorners}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEndKB}
                        >
                          <div className="flex overflow-x-auto pb-4 gap-4">
                              <ColumnEpic column={column} tasks={epic.tasks} onAddTask={addTask} />
                          </div>
                          <DragOverlay>
                            {activeId ? (
                              <Card className="w-64 mb-2 cursor-move bg-white shadow-md">
                                <CardContent className="p-3 text-sm">
                                  {columns.flatMap(col => col.tasks).find(task => task.idTarea === activeId)?.titulo}
                                </CardContent>
                              </Card>
                            ) : null}
                          </DragOverlay>
                        </DndContext>
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
                              <SortableContext items={board.tasks.map(task => task.idTarea)} strategy={verticalListSortingStrategy}>
                                {board.tasks.map((task) => (
                                  <SortableTask key={task.idTarea} task={task} />
                                ))}
                              </SortableContext>
                            )}
                            <div className="p-4 border-t">
                              <Button onClick={handleOpenModalTask} variant="ghost" size="sm" className="w-full justify-start">
                                <Plus className="h-4 w-4 mr-2" /> Crear incidencia
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>

                </div>
              )}

              {activeTab === "kanban" && (
                <div className="flex  gap-6 p-6">
                  {/* Tablero kanban */}
                  <div className="p-4 bg-gray-200 h-full w-full">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">Kanban Board</h1>
                    <AddBoardForm onAddBoard={addBoard} />
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEndKB}
                    >
                      <div className="flex overflow-x-auto pb-4 gap-4">
                        {columns.map(column => (
                          <Column key={column.id} column={column} tasks={column.tasks} onAddTask={addTask} />
                        ))}
                      </div>
                      <DragOverlay>
                        {activeId ? (
                          <Card className="w-64 mb-2 cursor-move bg-white shadow-md">
                            <CardContent className="p-3 text-sm">
                              {columns.flatMap(col => col.tasks).find(task => task.idTarea === activeId)?.titulo}
                            </CardContent>
                          </Card>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>


                </div>
              )}

            </DndContext>
          </div>

        </div>
      </div>
      {/* Modal para crear nuevo proyecto */}
      {isTaskModalOpen && <ModalTask open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} handleCreate={handleCreateTask} workspaceId={workspaceId} />
      }
    </>
  )
}