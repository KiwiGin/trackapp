'use client'
import { signIn, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { getProyectosChart, getSprintsChart } from '@/lib/firebaseUtils'
import { Tarea } from '@/types/Tarea'
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function MainDashboard() {
  const { data: session, status } = useSession();

  interface SprintChart {
    idSprint?: string;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    idProyecto?: string;
    progreso: number;
  }

  interface ProyectoChart {
    idProyecto?: string;
    nombre: string;
    tareas: Tarea[];
  }

  const [sprints, setSprints] = useState<SprintChart[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn();
    }
  }, [session, status]);

  useEffect(() => {
    if (!session) return;

    setIsLoading(true);
    
    Promise.all([
      getSprintsChart(session.user.id),
      getProyectosChart(session.user.id)
    ]).then(([sprintsData, proyectosData]) => {
      const sprintsConvertidos = sprintsData.map(sprint => ({
        ...sprint,
        fechaInicio: sprint.fechaInicio,
        fechaFin: sprint.fechaFin
      }));

      setSprints(sprintsConvertidos);
      setProyectos(proyectosData);
    }).finally(() => setIsLoading(false));

  }, [session]);

  if (!session) {
    return <div className="flex items-center justify-center h-screen">No autorizado</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bienvenido, {session.user.nombre}!</h1>

      {/* Sprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-lg" />
            ))
          : sprints.filter(s => s.estado === "Activo").map((sprint) => (
              <Card key={sprint.idSprint}>
                <CardHeader>
                  <CardTitle>{sprint.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {sprint.fechaInicio.toLocaleDateString()} - {sprint.fechaFin.toLocaleDateString()}
                  </p>
                  <span className="text-sm text-muted-foreground">{sprint.progreso} %</span>
                  <Progress value={sprint.progreso} className="w-full" />
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))
          : proyectos.map((proyecto) => {
              const pieData = [
                { name: "POR HACER", value: proyecto.tareas.filter(t => t.estado === "POR HACER").length },
                { name: "EN PROGRESO", value: proyecto.tareas.filter(t => t.estado === "EN PROGRESO").length },
                { name: "HECHO", value: proyecto.tareas.filter(t => t.estado === "HECHO").length },
              ];

              return (
                <Card key={proyecto.idProyecto}>
                  <CardHeader>
                    <CardTitle>{proyecto.nombre} - Tareas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  )
}
