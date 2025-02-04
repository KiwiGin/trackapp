'use client'

import { act, use, useEffect, useState } from "react"
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
import { Sprint } from "@/types/Sprint"
import { createEpic, createTask, getEpicsByIdProyecto, getSprintsByIdProyecto, getTareasByIdProyecto, getUsuariosByIds, updateTaskOrderInFirebase, updateTaskSprint } from "@/lib/firebaseUtils"
import { Usuario } from "@/types/Usuario"
import { Badge } from "./ui/badge"

type Column = {
  id: string
  title: string
  tasks: Tarea[]
}

type ColumnEpic = {
  id: string
  title: string
  epics: Epic[]
}

type Board = {
  id: string
  title: string
  tasks: Tarea[]
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
        {/* <span className="text-sm font-medium">{task.idTarea}</span> */}
        <span className="text-sm">{task.titulo}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{task.tipo}</Badge>
        <span className="text-sm text-muted-foreground">{task.estado}</span>
        <Avatar className='w-6 h-6'>
          <AvatarImage src={task.usuario?.linkImg} alt={task.usuario?.usuario} className='rounded-full object-fill' />
        </Avatar>
      </div>

    </div>
  )
}

function SortableEpic({ epic }: { epic: Epic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: epic.idEpic })

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
        <input type="checkbox" className="rounded" aria-label={`Mark ${epic.resumen} as complete`} />
        {/* <span className="text-sm font-medium">{epic.idEpic}</span> */}
        <span className="text-sm">{epic.resumen}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-900 hover:bg-blue-600">Epic</Badge>
        {/* <span className="text-sm text-muted-foreground">arreglar</span>
        <Avatar className="h-6 w-6">
          <AvatarFallback>A</AvatarFallback>
        </Avatar> */}
      </div>
    </div>
  )
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

const SprintColumn = ({ sprint, tareas, onAddTask }: { sprint: Sprint, tareas: Tarea[], onAddTask: (idSprint:string) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sprint.idSprint || '',
  });

  return (
    <Card ref={setNodeRef} className="mb-4">


      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            <span>{sprint.nombre}</span>
            {/* <span className="text-sm text-muted-foreground">{sprint.idSprint}</span> */}
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Añadir fechas
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{tareas.filter(task => task.idSprint == sprint.idSprint).length} incidencias</span>
            <Button variant="ghost" size="sm">
              Iniciar sprint
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {sprint.tareas?.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No hay tareas en este sprint.
              </p>
            </div>
          ) : (

            <SortableContext items={tareas.map((task) => task.idTarea)}>
              {tareas.map((task) => (
                <SortableTask key={task.idTarea} task={task} />
              ))}
            </SortableContext>
          )}
          <div className="p-4 border-t">
            <Button onClick={() => onAddTask(sprint.idSprint!)} variant="ghost" size="sm" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" /> Crear incidencia
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

const BacklogColumn = ({ tareas, onAddTask }: { tareas: Tarea[], onAddTask: () => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: '',
  });

  return (
    <Card ref={setNodeRef}>
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Backlog</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500">{tareas.filter(task => task.idSprint == '').length} issues</div>
      </CardHeader>
      <CardContent className="p-2">
        {tareas.filter(task => task.idSprint == '').length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Tu backlog está vacío.
            </p>
          </div>
        ) : (
          <SortableContext items={tareas.filter(task => task.idSprint == '').map(task => task.idTarea)}>
            {tareas.filter(task => task.idSprint == '').map((task) => (
              <SortableTask key={task.idTarea} task={task} />
            ))}

          </SortableContext>
        )}
        <div className="p-4 border-t">
          <Button onClick={onAddTask} variant="ghost" size="sm" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" /> Crear incidencia
          </Button>
        </div>

      </CardContent>
      {/* <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            <span>Backlog</span>
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Añadir date
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{tareas.filter(task => task.idSprint == '').length} incidencias</span>
            <Button variant="ghost" size="sm">
              Iniciar sprint
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {tareas.filter(task => task.idSprint == '').length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Tu backlog está vacío.
              </p>
            </div>
          ) : (
            <SortableContext items={tareas.filter(task => task.idSprint == '').map(task => task.idTarea)}>
              {tareas.filter(task => task.idSprint == '').map((task) => (
                <SortableTask key={task.idTarea} task={task} />
              ))}

            </SortableContext>
          )}
          <div className="p-4 border-t">
            <Button onClick={onAddTask} variant="ghost" size="sm" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" /> Crear incidencia
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible> */}
    </Card>
  );
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


const ColumnEpic = ({ column, epics, onAddEpic }: { column: ColumnEpic, epics: Epic[], onAddEpic: (idSprint:string) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Epic</h2>
        <Button variant="ghost" size="sm" aria-label="Add epic">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Incidencias sin epic</div>
        {column.epics.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No hay epics en este proyecto.
            </p>
          </div>
        ) : (
          <SortableContext items={column.epics.map(task => task.idEpic)} strategy={verticalListSortingStrategy}>
            {column.epics.map((task) => (
              <SortableEpic key={task.idEpic} epic={task} />
            ))}
          </SortableContext>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAddEpic('')}>
          <Plus className="h-4 w-4 mr-2" /> Crear epic
        </Button>
      </div>
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



export default function ProyectPage({ proyecto }: { proyecto: Proyecto }) {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', tasks: [{ idTarea: 'task1', titulo: 'Design new feature', idSprint: '1', orden: 1 }, { idTarea: 'task2', titulo: 'Update documentation', idSprint: '', orden: 2 }] },
    { id: 'inProgress', title: 'In Progress', tasks: [{ idTarea: 'task3', titulo: 'Refactor authentication system', idSprint: '', orden: 3 }] },
    { id: 'done', title: 'Done', tasks: [] },
  ])


  const [columnEpic, setColumnEpic] = useState<ColumnEpic>({ id: 'epic', title: 'Epic', epics: [] })


  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeIdT, setActiveIdT] = useState<string | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const workspaceId = proyecto.idWorkspace;
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("backlog")

  const [tareas, setTareas] = useState<Tarea[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])

  const [sprintSelected, setSprintSelected] = useState<string>("")

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

  useEffect(() => {
    if (!proyecto.idProyecto) return;

    getEpicsByIdProyecto(proyecto.idProyecto).then(setColumnEpic);
  }, [proyecto]);

  useEffect(() => {
    if (!proyecto.idProyecto) return;

    getUsuariosByIds(proyecto.idUsuarios)
      .then(setUsuarios);
  }, [proyecto]);

  useEffect(() => {
    if (!proyecto.idProyecto) return;

    getTareasByIdProyecto(proyecto.idProyecto)
      .then((fetchedTareas) => {
        // Ordenar las tareas por el campo 'orden' de forma ascendente
        fetchedTareas.sort((a, b) => Number(a.orden) - Number(b.orden));
        setTareas(fetchedTareas);
      });
  }, [proyecto, tareas]);

  useEffect(() => {
    if (!proyecto.idProyecto) return;
    getSprintsByIdProyecto(proyecto.idProyecto).then(setSprints);
  }, [proyecto, sprints]);

  const handleOpenModalTask = (idSprint: string) => {
    setIsTaskModalOpen(true)
    setSprintSelected(idSprint)
  }


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStartKB = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(String(active.id)) // Convertir a string
  }


  const handleDragOverKB = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    console.log('active:', active.id);
    console.log('over:', over.id);

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

    console.log('active:', active.id);
    console.log('over:', over.id);

    const activeColumn = columns.find(col => col.tasks.some(task => task.idTarea === active.id))
    const overColumn = columns.find(col => col.id === over.id || col.tasks.some(task => task.idTarea === over.id))

    console.log('activeColumn:', activeColumn);
    console.log('overColumn:', overColumn);

    if (!activeColumn || !overColumn) return

    if (activeColumn !== overColumn) {
      console.log('tuki2');
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

      console.log('oldIndex:', oldIndex);
      console.log('newIndex:', newIndex);

      setColumns(prev => {
        const newTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex)
        return prev.map(col => {
          if (col.id === activeColumn.id) {
            console.log('col:', col);
            return { ...col, tasks: newTasks }
          }
          return col
        })
      })
      console.log('columns:', columns);
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
      titulo: content,
      idSprint: columnId,
      orden: 1
    }
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
    ))
  }

  const addEpic = (epic: Epic) => {
    setColumnEpic((prev) => {
      return { ...prev, epics: [...prev.epics, epic] }
    });
  }

  //metodo para cuando agarras la tarea
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveIdT(String(active.id)) // Convertir a string
  }

  //metodo para cuando sueltas la tarea en otro contenedor
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return;

    // const activeTask = tareas.find(task => task.idTarea === active.id);
    const overTask = tareas.find(task => task.idTarea === over.id);

    const activeColumn = sprints.find(sprint => sprint.tareas?.some(task => task.idTarea === active.id))
    const overColumn = sprints.find(sprint => sprint.idSprint === over.id || sprint.tareas?.some(task => task.idTarea === over.id))

    if (!overTask) return;
    if (!activeColumn || !overColumn) return

    // Si las tareas ya están en la misma posición o no se encontraron, no hacer nada

    // Intercambia los valores de 'orden'
    // const activeTask = activeColumn.tareas.find(task => task.idTarea === active.id)!
    // const updatedTareas = tareas.map(task => {
    //   if (task.idTarea === active.id) {
    //     return { ...task, orden: overTask.orden }; // La tarea activa toma el orden de la tarea de destino
    //   }
    //   if (task.idTarea === over.id) {
    //     return { ...task, orden: activeTask.orden }; // La tarea de destino toma el orden de la tarea activa
    //   }
    //   return task;
    // });

    // setTareas(updatedTareas);

    // setSprints(prev => {
    //   const activeTask = activeColumn.tareas.find(task => task.idTarea === active.id)
    //   return prev.map(col => {
    //     if (col.idSprint === activeColumn.idSprint) {
    //       return { ...col, tareas: col.tareas.filter(task => task.idTarea !== active.id) }
    //     }
    //     if (col.idSprint === overColumn.idSprint) {
    //       return { ...col, tareas: [...col.tareas, activeTask] }
    //     }
    //     return col
    //   })
    // });

  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // const activeTask = tareas.find(task => task.idTarea === active.id);
    // const overTask = tareas.find(task => task.idTarea === over.id);
    // const overColumnId = overTask ? (overTask.idSprint) : "";

    // const activeTask = tareas.find(task => task.idTarea === active.id);
    // const overTask = tareas.find(task => task.idTarea === over.id);
    const activeColumn = sprints.find(sprint => sprint.tareas?.some(task => task.idTarea === active.id))
    const overColumn = sprints.find(sprint => sprint.idSprint === over.id || sprint.tareas?.some(task => task.idTarea === over.id))
    console.log('activeColumn:', activeColumn);
    console.log('overColumn:', overColumn);

    // if (!activeTask || !overTask) return;
    if (!activeColumn || !overColumn) return


    if (activeColumn !== overColumn) {
      setSprints(prev => {
        const activeTask = activeColumn.tareas.find(task => task.idTarea === active.id)
        return prev.map(col => {
          if (col.idSprint === activeColumn.idSprint) {
            return { ...col, tareas: col.tareas.filter(task => task.idTarea !== active.id) }
          }
          if (col.idSprint === overColumn.idSprint) {
            return { ...col, tareas: [...col.tareas, activeTask] }
          }
          return col
        })
      });

      const activeTaskId = active.id;
      const activeColumnId = activeColumn.idSprint;
      const overColumnId = overColumn.idSprint;
      console.log('activeTaskId:', activeTaskId);
      console.log('overColumnId:', overColumnId);
      await updateTaskSprint(String(activeTaskId), String(overColumnId), String(activeColumnId));

    } else {
      // console.log('tuki');
      const oldIndex = activeColumn.tareas.findIndex(task => task.idTarea === active.id);
      const newIndex = activeColumn.tareas.findIndex(task => task.idTarea === over.id);

      setSprints(prev => {
        const newTasks = arrayMove(activeColumn.tareas, oldIndex, newIndex);
        return prev.map(col => {
          if (col.idSprint === activeColumn.idSprint) {
            console.log('col:', col);
            return { ...col, tareas: newTasks }
          }
          return col
        })
      });

      //funcion para actualizar la ubicacion de la tarea
      // const activeTaskId = active.id;
      // const overTaskId = over.id;
      // console.log('activeTaskId:', activeTaskId);
      // console.log('overTaskId:', overTaskId);
      // // await updateTaskOrder(String(activeTaskId), String(overTaskId));
      // // Intercambia los valores de 'orden'
      // if (!activeTask || !overTask) return;
      // const updatedTareas = tareas.map(task => {
      //   if (task.idTarea === active.id) {
      //     return { ...task, orden: overTask.orden }; // La tarea activa toma el orden de la tarea de destino
      //   }
      //   if (task.idTarea === over.id) {
      //     return { ...task, orden: activeTask.orden }; // La tarea de destino toma el orden de la tarea activa
      //   }
      //   return task;
      // });
      // setTareas(updatedTareas);

    }




    // // Buscar la tarea que se está moviendo
    // const activeTask = tareas.find(task => task.idTarea === activeTaskId);
    // if (!activeTask) return;

    // // Si la tarea ya está en la columna destino, no hacer nada
    // const activeColumnId = activeTask.idSprint || 'backlog';
    // if (activeColumnId === overColumnId) return;

    // Actualizar Firebase con la nueva ubicación de la tarea
    // await updateTaskSprint(String(activeTaskId), String(overColumnId) === 'backlog' ? '' : String(overColumnId));

    // const activeColumn = sprints.find(sprint => sprint.tareas?.some(task => task.idTarea === active.id))
    // const overColumn = sprints.find(sprint => sprint.idSprint === over.id || sprint.tareas?.some(task => task.idTarea === over.id))

    // if (!activeColumn || !overColumn) return

    // if (activeColumn !== overColumn) {
    //   setSprints(prev => {
    //     const activeTask = activeColumn.tareas.find(task => task.idTarea === active.id)
    //     return prev.map(col => {
    //       if (col.idSprint === activeColumn.idSprint) {
    //         return { ...col, tareas: col.tareas.filter(task => task.idTarea !== active.id) }
    //       }
    //       if (col.idSprint === overColumn.idSprint) {
    //         return { ...col, tareas: [...col.tareas, activeTask] }
    //       }
    //       return col
    //     })
    //   })
    // } else {
    //   const oldIndex = activeColumn.tareas.findIndex(task => task.idTarea === active.id)
    //   const newIndex = activeColumn.tareas.findIndex(task => task.idTarea === over.id)

    //   setSprints(prev => {
    //     const newTasks = arrayMove(activeColumn.tareas, oldIndex, newIndex)
    //     return prev.map(col => {
    //       if (col.idSprint === activeColumn.idSprint) {
    //         return { ...col, tareas: newTasks }
    //       }
    //       return col
    //     })
    //   })
    // }

    setActiveIdT(null)
  }

  const handleDragEndEpic = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setColumnEpic((columnEpic) => {
        const oldIndex = columnEpic.epics.findIndex((epic) => epic.idEpic === active.id)
        const newIndex = columnEpic.epics.findIndex((epic) => epic.idEpic === over?.id)

        const newEpics = arrayMove(columnEpic.epics, oldIndex, newIndex)

        return { ...columnEpic, epics: newEpics }
      })
    }
  }

  const handleCreateTask = async (incidencia: Incidencia) => {
    console.log('Crear Proyecto:', incidencia.resumen);
    let tarea : {
      titulo: string,
          descripcion: string,
          estado: string,
          tipo: string,
          idUsuario: string,
          idEpic: string,
          idProyecto: string,
          orden: string,
          idSprint: string,
    } = {
      titulo: '',
      descripcion: '',
      estado: '',
      tipo: '',
      idUsuario: '',
      idEpic: '',
      idProyecto: '',
      orden: '',
      idSprint: '',
    };
    let epic:{
      resumen: string,
      descripcion: string,
      idProyecto: string,
      fechaHoraInicio: Date,
      fechaHoraFin: Date,
      estado: string,
      idUsuario: string,
      idTareas: string[],
    } = {
      resumen: '',
      descripcion: '',
      idProyecto: '',
      fechaHoraInicio: new Date(),
      fechaHoraFin: new Date(),
      estado: '',
      idUsuario: '',
      idTareas: [],
    };
    // Asegúrate de que todos los campos tengan valores definidos
    try {
      if (incidencia.tipo == "Tarea" || incidencia.tipo == "Historia" || incidencia.tipo == "Error") {
        tarea = {
          titulo: incidencia.resumen,
          descripcion: incidencia.descripcion,
          estado: incidencia.estado,
          tipo: incidencia.tipo,
          idUsuario: incidencia.idUsuario,
          idEpic: incidencia.idEpic,
          idProyecto: proyecto.idProyecto || '',
          orden: String(tareas.length + 1),
          idSprint: sprintSelected
        }

        const tareaId = await createTask(tarea);
        console.log('Tarea creada:', tareaId);
        setTareas((prevTareas) => [
          ...prevTareas,
          { idTarea: tareaId, ...tarea }
        ]);

      } else if (incidencia.tipo == "Epic") {
        epic = {
          resumen: incidencia.resumen,
          descripcion: incidencia.descripcion,
          idProyecto: proyecto.idProyecto || '',
          fechaHoraInicio: new Date(),
          fechaHoraFin: new Date(),
          estado: incidencia.estado,
          idUsuario: incidencia.idUsuario,
          idTareas: [],
        }

        const epicId = await createEpic(epic);
        console.log('Epic creada:', epicId);
        setColumnEpic((prevColumnEpic) => {
          return { ...prevColumnEpic, epics: [...prevColumnEpic.epics, { idEpic: epicId, ...epic }] }
        });
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
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold">{proyecto.nombre}</h1>
                  <p>{proyecto.descripcion}</p>
                </div>
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


            {activeTab === "backlog" && (
              <div className="flex gap-6 p-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndEpic}>
                  <div className="w-64">
                    <ColumnEpic column={columnEpic} epics={columnEpic.epics} onAddEpic={handleOpenModalTask} />
                  </div>
                </DndContext>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex-1 flex-col overflow-y-auto pb-4 gap-4">
                    {sprints
                      .slice() // Hacemos una copia del array para no modificar el original
                      .sort((a, b) => (a.nombre === "Backlog" ? 1 : b.nombre === "Backlog" ? -1 : 0)) // Mueve "Backlog" al final
                      .map((sprint) => (
                        <SprintColumn
                          key={sprint.idSprint}
                          sprint={sprint}
                          tareas={sprint.tareas.map((tarea) => ({
                            ...tarea,
                            usuario: usuarios.find((u) => u.idUsuario === tarea.idUsuario) || null, // Asigna el usuario correcto
                          }))}
                          onAddTask={handleOpenModalTask}
                        />
                      ))}
                  </div>


                </DndContext>

              </div>
            )}

            {activeTab === "kanban" && (
              <div className="flex gap-6 p-6">
                {/* Tablero kanban */}
                <div className="p-4 bg-gray-200 h-full w-full">
                  <h1 className="text-2xl font-bold mb-4 text-gray-800">Kanban Board</h1>
                  <AddBoardForm onAddBoard={addBoard} />
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStartKB}
                    onDragOver={handleDragOverKB}
                    onDragEnd={handleDragEndKB}
                  >
                    <div className="flex overflow-x-auto pb-4 gap-4">
                      {columns.map(column => (
                        <Column key={column.id} column={column} tasks={column.tasks} onAddTask={addTask} />
                      ))}
                    </div>
                  </DndContext>
                </div>
                {/* <DragOverlay>
                      {activeId ? (
                        <Card className="w-64 mb-2 cursor-move bg-white shadow-md">
                          <CardContent className="p-3 text-sm">
                            {columns.flatMap(col => col.tasks).find(task => task.idTarea === activeId)?.titulo}
                          </CardContent>
                        </Card>
                      ) : null}
                    </DragOverlay> */}


              </div>
            )}


          </div>

        </div>
      </div>
      {/* Modal para crear nuevo proyecto */}
      {isTaskModalOpen && <ModalTask open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} handleCreate={handleCreateTask} workspaceId={workspaceId} proyectoId={proyecto.idProyecto}/>
      }
    </>
  )
}
