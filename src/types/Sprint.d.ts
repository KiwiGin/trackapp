import { Timestamp } from "firebase/firestore";

export interface Sprint{
    idSprint?: string;
    nombre: string;
    estado: string;
    fechaInicio: Timestamp;
    fechaFin: Timestamp;
    duracion?: number;
    idProyecto?: string;
    tareas: Tarea[];
    idTareas: string[];
}