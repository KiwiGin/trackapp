//modal para crear un nuevo equipo
'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Usuario } from '@/types/Usuario'
import { Incidencia } from '@/types/Incidencia'
import { Textarea } from './ui/textarea'
import { getEpicsByIdProyecto, getUsuariosByIdWorkspace } from '@/lib/firebaseUtils'
import { Epic } from '@/types/Epic'
// import { Tarea } from '@/types/Tarea'



export default function ModalTask({
    open,
    onOpenChange,
    handleCreate,
    workspaceId,
    proyectoId
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    handleCreate?: (incidencia: Incidencia) => void;
    workspaceId?: string;
    proyectoId?: string;
}) {
    const [epics, setEpics] = useState<Epic[]>([]);
    const [incidencia, setIncidencia] = useState<Incidencia>({
        resumen: "",
        estado: "",
        tipo: "",
        idUsuario: "",
        idEpic: "",
        descripcion: ""
    });
    // const [tareas, setTareas] = useState<Tarea[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    //obtener tareas 

    //obtener usuarios de un workspace por idworkspace
    useEffect(() => {
        if (workspaceId) {
            getUsuariosByIdWorkspace(workspaceId)
                .then((usuarios) => {
                    setUsuarios(usuarios);
                })
                .catch((error) => {
                    console.error('Error obteniendo usuarios:', error);
                });
        }
    }, [workspaceId]);

    useEffect(() => {
        if (proyectoId) {
            getEpicsByIdProyecto(proyectoId)
                .then((response) => {
                    setEpics(response.epics)
                })
                .catch((error) => {
                    console.error('Error obteniendo epics:', error);
                });
        }
    }, [proyectoId]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Datos enviados:', incidencia);
        if (incidencia) {
            if (handleCreate) {
                handleCreate(incidencia);
            }
        } else {
            console.error('Equipo is undefined');
        }
        onOpenChange(false); // Cerrar el modal después de crear
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Incidencia</DialogTitle>
                    <DialogDescription>
                        Ingrese los detalles de la nueva incidencia. Haga clic en crear cuando termine.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-left">
                                Resumen
                            </Label>
                            <Input
                                id="nombre"
                                value={incidencia?.resumen}
                                onChange={(e) => setIncidencia({ ...incidencia!, resumen: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="descripcion" className="text-left">
                                Tipo de incidencia
                            </Label>
                            <Label htmlFor="descripcion" className="text-left">
                                Estado
                            </Label>


                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Select
                                value={incidencia.tipo}
                                onValueChange={(value) => setIncidencia({
                                    ...incidencia, tipo: value,
                                    idEpic: value === "Epic" ? "" : incidencia.idEpic
                                })}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tarea">Tarea</SelectItem>
                                    <SelectItem value="Historia">Historia</SelectItem>
                                    <SelectItem value="Error">Error</SelectItem>
                                    <SelectItem value="Epic">Epic</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={incidencia.estado}
                                onValueChange={(value) => setIncidencia({ ...incidencia, estado: value })}
                            >
                                <SelectTrigger id="state">
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="POR HACER">POR HACER</SelectItem>
                                    <SelectItem value="EN PROGRESO">EN PROGRESO</SelectItem>
                                    <SelectItem value="HECHO">HECHO</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <div className="grid grid-cols-1 items-center gap-4">
                            <Label htmlFor="descripcion" className="text-left">
                                Persona asignada
                            </Label>
                            <Select
                                value={incidencia.idUsuario}
                                onValueChange={(value) => setIncidencia({ ...incidencia, idUsuario: value })}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecciona persona" />
                                </SelectTrigger>

                                <SelectContent>
                                    {usuarios.map((usuario) => (
                                        <SelectItem key={usuario.idUsuario} value={usuario.idUsuario}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className='w-7 h-7'>
                                                    <AvatarImage src={usuario.linkImg} alt={usuario.usuario} className='rounded-full object-fill' />
                                                </Avatar>
                                                <span>{usuario.nombre}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {incidencia.tipo !== "Epic" && (
                            <div className="grid grid-cols-1 items-center gap-4">
                                <Label htmlFor="descripcion" className="text-left">
                                    Principal
                                </Label>
                                <Select
                                    value={incidencia.idEpic}
                                    onValueChange={(value) => setIncidencia({ ...incidencia, idEpic: value })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Selecciona epic" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {epics.map((epic) => (
                                            <SelectItem key={epic.idEpic} value={epic.idEpic}>
                                                <div className="flex items-center gap-2">
                                                    <span>{epic.resumen}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 items-center gap-4">
                            <Label htmlFor="descripcion" className="text-left">
                                Descripción
                            </Label>
                            <Textarea
                                id="descripcion"
                                value={incidencia.descripcion}
                                onChange={(e) => setIncidencia({ ...incidencia!, descripcion: e.target.value })}
                                className="col-span-3"
                            />
                        </div>


                    </div>
                    <DialogFooter>
                        <Button type="submit">Crear</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}