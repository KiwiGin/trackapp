export interface Proyecto{
    idProyecto?: string;
    nombre: string;
    descripcion: string;
    idEpics: string[];
    epics?: Epic[];
    idUsuarios: string[];
    usuarios?: Usuario[];
    idSprints: string[];
    sprints?: Sprint[];
    idTareas: string[];
    tareas?: Tarea[];
    creadoPor: string;
    idWorkspace?: string;
}