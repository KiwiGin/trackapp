import { Usuario } from "./Usuario";

export interface Tarea{
    idTarea: string;
    descripcion?: string;
    idProyecto?: string;
    idEpic?: string;
    idSprint: string;
    estado?: string;
    tipo?: string;
    titulo: string;
    asignado?: string;
    orden: string;
    usuario?: Usuario
}