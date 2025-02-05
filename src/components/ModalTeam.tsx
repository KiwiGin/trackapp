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
import { getUserIdByEmail, getUsuariosById } from '@/lib/firebaseUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Usuario } from '@/types/Usuario'

export default function ModalTeam({
    open,
    onOpenChange,
    handleCreate,
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    handleCreate: (equipo: Equipo) => void;
}) {
    const [equipo, setEquipo] = useState<Equipo>({
        idEquipo: "",
        idWorkspace: "",
        nombre: "",
        miembros: []
    });
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [members, setMembers] = useState<Usuario[]>();
    //obtener usuarios por los ids guardados en la const equipo
    useEffect(() => {
        if (equipo.miembros.length > 0) {
            const promises = equipo.miembros.map(async (miembro) => await getUsuariosById(miembro.idUsuario));
            Promise.all(promises).then(setMembers);
        }
    }, [equipo.miembros]);


    const handleEmailInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);

    }
    const handleRoleSelect = (value: string) => {
        setRole(value);
    }

    const handleAddMember = async () => {
        try {
            const id = await getUserIdByEmail(email);
            setEquipo((prevEquipo) => ({
                ...prevEquipo,
                miembros: [
                    ...prevEquipo.miembros,
                    { idUsuario: id, rolEquipo: role },
                ],
            }));
        } catch (error) {
            console.error('Error al agregar miembro:', error);
            alert('El usuario no existe');

        }
    }


    const handleRoleChange = (id: string, value: string) => {
        setEquipo((prevEquipo) => ({
            ...prevEquipo,
            miembros: prevEquipo.miembros.map((miembro) =>
                miembro.idUsuario === id ? { ...miembro, rolEquipo: value } : miembro
            ),
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Datos enviados:', equipo);
        if (equipo) {
            handleCreate(equipo);
        } else {
            console.error('Equipo is undefined');
        }
        onOpenChange(false); // Cerrar el modal después de crear
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Equipo</DialogTitle>
                    <DialogDescription>
                        Ingrese los detalles del nuevo equipo aquí. Haga clic en crear cuando termine.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="nombre"
                                value={equipo?.nombre}
                                onChange={(e) => setEquipo({ ...equipo!, nombre: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="descripcion" className="text-right">
                                Invitar Miembros
                            </Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={handleEmailInput}
                                className="col-span-3"
                            />
                            <Select
                                value={equipo.miembros[0]?.rolEquipo || ""}
                                onValueChange={handleRoleSelect}

                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dev">Dev</SelectItem>
                                    <SelectItem value="SMaster">SMaster</SelectItem>
                                    <SelectItem value="Owner">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* boton para agregarlos a la lista de Team Members */}
                            <Button type="button" onClick={handleAddMember}>Add</Button>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <div className="space-y-4">
                                {members?.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className='h-14 w-14'>
                                                <AvatarImage src={member.linkImg} alt={member.usuario} className='rounded-full object-fill' />
                                                <AvatarFallback>{member.nombre ? member.nombre[0] : 'T'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.nombre}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <Select value={equipo.miembros.find(
                                            (miembro) => miembro.idUsuario === member.idUsuario
                                        )?.rolEquipo || ""} onValueChange={(value) => handleRoleChange(member.idUsuario, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Dev">Dev</SelectItem>
                                                <SelectItem value="SMaster">SMaster</SelectItem>
                                                <SelectItem value="Owner">Owner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
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