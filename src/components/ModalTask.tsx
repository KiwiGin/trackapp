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
import { Equipo } from '@/types/Equipo'
import { getUserIdByEmail, getUsuariosById, getUsuariosByIdWorkspace } from '@/lib/firebaseUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Usuario } from '@/types/Usuario'
import { Tarea } from '@/types/Tarea'
import { Incidencia } from '@/types/Incidencia'
import { CircleUserRound } from 'lucide-react'
import { Textarea } from './ui/textarea'



export default function ModalTask({
    open,
    onOpenChange,
    handleCreate,
    workspaceId
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    handleCreate: (incidencia: Incidencia) => void;
    workspaceId?: string;
}) {
    const epics = [
        {
            idEpic: "1",
            resumen: "Epic 1"
        },
        {
            idEpic: "2",
            resumen: "Epic 2"
        },
        {
            idEpic: "3",
            resumen: "Epic 3"
        }
    ];
    const [incidencia, setIncidencia] = useState<Incidencia>({
        resumen: "",
        estado: "",
        tipo: "",
        idUsuario: "",
        idEpic: "",
        descripcion: ""
    });
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Datos enviados:', incidencia);
        if (incidencia) {
            handleCreate(incidencia);
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
                                onValueChange={(value) => setIncidencia({ ...incidencia, tipo: value })}
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
                                    <SelectItem value="TO-DO">TO-DO</SelectItem>
                                    <SelectItem value="IN PROGRESS">IN PROGRESS</SelectItem>
                                    <SelectItem value="DONE">DONE</SelectItem>
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