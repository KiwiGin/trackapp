export interface Epic{
    idEpic: string;
    resumen: string;
    descripcion: string;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    proyecto?: Proyecto;
    idProyecto: string;
    tareas?: Tarea[];
    idTareas: string[];
}