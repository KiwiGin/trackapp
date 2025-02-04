export interface Sprint{
    idSprint?: string;
    nombre: string;
    estado: string;
    fechaInicio: Date;
    duracion: number;
    idProyecto?: string;
    tareas: Tarea[];
    idTareas: string[];
}