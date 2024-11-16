export interface Sprint{
    idSprint: string;
    nombre: string;
    estado: string;
    fechaInicio: Date;
    idProyecto: string;
    idTareas: string[];
    tareas?: Tarea[];
}