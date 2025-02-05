"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ModalStartSprint({
  open,
  onOpenChange,
  handleCreate,
  proyectoId,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  handleCreate: (fechaInicio: Date, fechaFin: Date, idproyecto: string) => void
  proyectoId: string
}) {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [isEndDateLocked, setIsEndDateLocked] = useState(false)
  const [numSemanas, setNumSemanas] = useState(2)

  useEffect(() => {
    if (fechaInicio) {
      const startDate = new Date(fechaInicio)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + numSemanas * 7)
      setFechaFin(endDate.toISOString().split("T")[0])
    }
  }, [fechaInicio, numSemanas])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreate( new Date(fechaInicio), new Date(fechaFin), proyectoId)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFechaInicio("")
    setFechaFin("")
    setIsEndDateLocked(false)
    setNumSemanas(2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar Sprint</DialogTitle>
          <DialogDescription>
            Configure la duración del sprint. Haga clic en Iniciar cuando termine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fechaInicio" className="text-right">
                Fecha Inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fechaFin" className="text-right">
                Fecha Fin
              </Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="col-span-3"
                disabled={isEndDateLocked}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lockEndDate"
                checked={isEndDateLocked}
                onCheckedChange={(checked) => setIsEndDateLocked(checked as boolean)}
              />
              <Label htmlFor="lockEndDate">Bloquear fecha de fin y ajustar por semanas</Label>
            </div>
            {isEndDateLocked && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numSemanas" className="text-right">
                  Número de Semanas
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Button type="button" onClick={() => setNumSemanas((prev) => Math.max(1, prev - 1))}>
                    -
                  </Button>
                  <Input
                    id="numSemanas"
                    type="number"
                    value={numSemanas}
                    onChange={(e) => setNumSemanas(Math.max(1, Number.parseInt(e.target.value)))}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button type="button" onClick={() => setNumSemanas((prev) => prev + 1)}>
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Iniciar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

