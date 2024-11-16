'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ModalProject({
    open,
    onOpenChange,
    handleCreate,
  }: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    handleCreate: (nombre: string, descripcion: string) => void;
  }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Datos enviados:', { nombre, descripcion });
      handleCreate(nombre, descripcion);
      onOpenChange(false); // Cerrar el modal después de crear
      setNombre('');
      setDescripcion('');
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Ingrese los detalles del nuevo proyecto aquí. Haga clic en crear cuando termine.
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
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
  