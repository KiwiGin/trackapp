'use client'

import { useState } from 'react'
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

export default function ModalSprint({
    open,
    onOpenChange,
    handleCreate,
    proyectoId
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    handleCreate: (nombre: string, idproyecto: string) => void;
    proyectoId: string;
}) {
    const [nombre, setNombre] = useState('');
    const idproyecto = proyectoId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Datos enviados:', { nombre, idproyecto });
        handleCreate(nombre, idproyecto);
        onOpenChange(false); // Cerrar el modal después de crear
        setNombre('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Sprint</DialogTitle>
                    <DialogDescription>
                        Ingrese los detalles del nuevo sprint aquí. Haga clic en Crear cuando termine.
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
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Crear</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
