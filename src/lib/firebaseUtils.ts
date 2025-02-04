import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, getDocs, doc, getDoc, setDoc, arrayUnion, documentId, deleteDoc, updateDoc } from 'firebase/firestore';
// import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { Usuario } from '@/types/Usuario';
import { Workspace } from '@/types/Workspace';
import { Proyecto } from '@/types/Proyecto';
import { Equipo } from '@/types/Equipo';
import { Tarea } from '@/types/Tarea';
import { Sprint } from '@/types/Sprint';
import { Epic } from '@/types/Epic';

//obtener usuarios por id
export async function getUsuariosById(idUsuario: string) {
    const usuariosRef = doc(db, "usuarios", idUsuario);
    const usuariosSnapshot = await getDoc(usuariosRef);

    if (!usuariosSnapshot.exists()) {
        throw new Error('No existe el usuario');
    }

    return { idUsuario: idUsuario, ...usuariosSnapshot.data() } as Usuario;
}

//obtener usuarios por correo
export async function getUsuariosByEmail(email: string): Promise<Usuario & { clave: string } | null> {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", email));
    const usuariosSnapshot = await getDocs(q);

    if (usuariosSnapshot.empty) {
        return null;
    }

    const usuarioDoc = usuariosSnapshot.docs[0];
    return { idUsuario: usuarioDoc.id, ...usuarioDoc.data() } as Usuario & { clave: string };
}

//obtener usuarioid por correo
export async function getUserIdByEmail(email: string): Promise<string> {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", email));
    const usuariosSnapshot = await getDocs(q);

    if (usuariosSnapshot.empty) {
        throw new Error('No existe el usuario');
    }

    return usuariosSnapshot.docs[0].id;
}

//obtener usuarios por idWorkspace
export async function getUsuariosByIdWorkspace(idWorkspace: string): Promise<Usuario[]> {
    const workspaceRef = doc(db, "Workspace", idWorkspace);
    const workspaceSnapshot = await getDoc(workspaceRef);

    if (!workspaceSnapshot.exists()) {
        throw new Error('No existe el workspace');
    }

    const workspaceData = workspaceSnapshot.data();
    if (!workspaceData) {
        throw new Error('No existe el workspace');
    }

    const userIds = workspaceData.idUsuarios || [];
    if (userIds.length === 0) {
        return [];
    }

    const usuariosRef = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(query(usuariosRef, where(documentId(), "in", userIds)));

    return usuariosSnapshot.docs.map(doc => ({ idUsuario: doc.id, ...doc.data() } as Usuario));
}


//crear workspace y que devuelva el id
export async function createWorkspace(workspace: Omit<Workspace, 'idWorkspace'>) {

    const workspaceRef = doc(db, "Workspace", uuidv4());

    await setDoc(workspaceRef, workspace);
    return workspaceRef.id;
}

//obtener workspace por idUsuario
export async function getWorkspaceByIdUsuario(idUsuario: string): Promise<Workspace[]> {
    const workspaceRef = collection(db, "Workspace");
    const q = query(workspaceRef, where("idUsuarios", "array-contains", idUsuario));
    const workspaceSnapshot = await getDocs(q);
    return workspaceSnapshot.docs.map(doc => ({ idWorkspace: doc.id, ...doc.data() } as Workspace));
}

//obtener workspace por id
export async function getWorkspaceById(idWorkspace: string): Promise<Workspace> {
    const workspaceRef = doc(db, "Workspace", idWorkspace);
    const workspaceSnapshot = await getDoc(workspaceRef);
    return { idWorkspace: idWorkspace, ...workspaceSnapshot.data() } as Workspace;
}

//crear proyecto y que devuelva el id
export async function createProject(project: Omit<Proyecto, 'idProyecto'>) {
    if (!project.idWorkspace) {
        throw new Error("El campo 'idWorkspace' es obligatorio para crear un proyecto.");
    }

    // Crear la referencia del proyecto
    const projectRef = doc(db, "Proyecto", uuidv4());

    // Guardar el proyecto en la base de datos
    await setDoc(projectRef, project);

    // Actualizar el workspace con el ID del proyecto
    const workspaceRef = doc(db, "Workspace", project.idWorkspace);
    await setDoc(workspaceRef, { idProyectos: arrayUnion(projectRef.id) }, { merge: true });

    return projectRef.id;
}

//eliminar proyecto por id
export async function deleteProjectById(idProyecto: string) {
    try {
        const proyectoRef = doc(db, "Proyecto", idProyecto); // Referencia al documento
        await deleteDoc(proyectoRef); // Elimina el documento
        console.log(`Proyecto con ID ${idProyecto} eliminado exitosamente.`);
    } catch (error) {
        console.error(`Error al eliminar el proyecto con ID ${idProyecto}:`, error);
        throw error; // Re-lanzar el error para manejarlo donde se llame la función
    }
}

export async function getUsuariosByIds(idsUsuarios: string[]): Promise<Usuario[]> {
    if (!idsUsuarios.length) return [];
    const usuariosRef = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(query(usuariosRef, where("__name__", "in", idsUsuarios)));
    return usuariosSnapshot.docs.map(doc => ({ idUsuario: doc.id, ...doc.data() } as Usuario));
}


// Obtener proyectos de la tabla Workspace
export async function getProyectosByIdWorkspace(idWorkspace: string): Promise<Proyecto[]> {
    // Referencia al Workspace
    const workspaceRef = doc(db, "Workspace", idWorkspace);
    const workspaceSnapshot = await getDoc(workspaceRef);

    // Verificar si existe el Workspace
    const workspaceData = workspaceSnapshot.data();
    if (!workspaceData) {
        throw new Error("No existe el workspace");
    }

    // Verificar si el Workspace tiene proyectos
    const projectIds = workspaceData.idProyectos || [];
    if (projectIds.length === 0) {
        return []; // No hay proyectos
    }

    // Manejar el límite de 10 elementos en consultas "in"
    const proyectos: Proyecto[] = [];
    const batchSize = 10; // Tamaño máximo por consulta

    for (let i = 0; i < projectIds.length; i += batchSize) {
        const batchIds = projectIds.slice(i, i + batchSize); // Dividir los IDs en lotes
        const proyectosRef = collection(db, "Proyecto");

        // Obtener documentos por IDs
        const proyectosSnapshot = await getDocs(query(proyectosRef, where(documentId(), "in", batchIds)));

        proyectos.push(...proyectosSnapshot.docs.map(doc => ({ idProyecto: doc.id, ...doc.data() } as Proyecto)));
    }

    return proyectos;
}

// Obtener proyecto por ID
export async function getProyectoById(idProyecto: string): Promise<Proyecto> {
    const proyectoRef = doc(db, "Proyecto", idProyecto);
    const proyectoSnapshot = await getDoc(proyectoRef);

    if (!proyectoSnapshot.exists()) {
        throw new Error("No existe el proyecto");
    }

    return { idProyecto: idProyecto, ...proyectoSnapshot.data() } as Proyecto;
}

//crear equipo, que devuelva id de equipo, dentro se crea un workspace y el nombre del equipo pasa tmb al nombre del workspace
export async function createTeam(team: Omit<Equipo, 'idEquipo'>) {
    // Crear el workspace
    const workspaceId = await createWorkspace({ nombre: team.nombre, idUsuarios: team.miembros.map(m => m.idUsuario) });
    // Crear el equipo
    const teamRef = doc(db, "Equipo", uuidv4());
    await setDoc(teamRef, { ...team, idWorkspace: workspaceId });

    // Actualizar el workspace con el ID del equipo
    const workspaceRef = doc(db, "Workspace", workspaceId);
    await setDoc(workspaceRef, { idEquipo: arrayUnion(teamRef.id) }, { merge: true });

    return teamRef.id;
}

//obtener equipos por idUsuario
export async function getEquiposByIdUsuario(idUsuario: string): Promise<Equipo[]> {
    const equiposRef = collection(db, "Equipo");
    const equiposSnapshot = await getDocs(equiposRef);
    if (equiposSnapshot.empty) {
        throw new Error('No hay equipos');
    }
    return equiposSnapshot.docs.map(doc => ({ idEquipo: doc.id, ...doc.data() } as Equipo)).filter(equipo => equipo.miembros.some((m: { idUsuario: string }) => m.idUsuario === idUsuario));
}

//obtener tareas por idProyecto
export async function getTareasByIdProyecto(idProyecto: string): Promise<Tarea[]> {
    const tareasRef = collection(db, "Tarea");
    const tareasSnapshot = await getDocs(query(tareasRef, where("idProyecto", "==", idProyecto)));
    return tareasSnapshot.docs.map(doc => ({ idTarea: doc.id, ...doc.data() } as Tarea));
}

export const updateTaskOrderInFirebase = async (taskId: string, newOrder: number) => {
    try {
        const taskDocRef = doc(db, 'Tarea', taskId); // Referencia al documento de la tarea
        await updateDoc(taskDocRef, { orden: newOrder }); // Actualiza el orden de la tarea
        console.log(`Tarea ${taskId} actualizada con el orden ${newOrder}`);
    } catch (error) {
        console.error('Error al actualizar el orden de la tarea:', error);
    }
};

// Función para actualizar el idSprint de la tarea en Firebase
export const updateTaskSprint = async (taskId: string, newSprintId: string, viejoSprintId: string) => {
    try {
        const taskDocRef = doc(db, 'Tarea', taskId); // Referencia al documento de la tarea
        await updateDoc(taskDocRef, { idSprint: newSprintId }); // Actualizar el idSprint
        console.log(`Tarea ${taskId} actualizada con el idSprint ${newSprintId}`);

        //Quitar el idTarea del sprint anterior
        const oldSprint = await getSprintAndTareasById(viejoSprintId);
        const oldSprintId = oldSprint.idSprint;
        const oldSprintTareas = oldSprint.tareas;
        const index = oldSprintTareas.findIndex(t => t.idTarea === taskId);
        oldSprintTareas.splice(index, 1);
        if (!oldSprintId) {
            throw new Error('El id del sprint anterior no está definido');
        }
        const oldSprintDocRef = doc(db, 'Sprint', oldSprintId);
        await updateDoc(oldSprintDocRef, { idTareas: oldSprintTareas.map(t => t.idTarea) });
        console.log(`Tarea ${taskId} eliminada del sprint ${oldSprintId}`);

        //actualizar ahora el idSprint en la lista de tareas del sprint
        const sprintDocRef = doc(db, 'Sprint', newSprintId);
        await updateDoc(sprintDocRef, { idTareas: arrayUnion(taskId) });

        console.log(`Tarea ${taskId} agregada al sprint ${newSprintId}`);


    } catch (error) {
        console.error('Error al actualizar el idSprint de la tarea:', error);
    }
};



//obtener sprint por id
export async function getSprintById(idSprint: string) {
    const sprintRef = doc(db, "Sprint", idSprint);
    const sprintSnapshot = await getDoc(sprintRef);
    return { idSprint: idSprint, ...sprintSnapshot.data() } as Sprint;
}

//obtener tareas por ids
export async function getTareasByIds(idsTareas: string[]) {
    if (!idsTareas.length) return [];
    const tareasRef = collection(db, "Tarea");
    const tareasSnapshot = await getDocs(query(tareasRef, where('__name__', "in", idsTareas)));
    return tareasSnapshot.docs.map(doc => ({ idTarea: doc.id, ...doc.data() })) as Tarea[];
}

//getSprintAndTareasById
export async function getSprintAndTareasById(idSprint: string) {
    const sprint = await getSprintById(idSprint);
    const tareas = await getTareasByIds(sprint.idTareas);
    sprint.tareas = tareas;
    return sprint;
}

//obtener sprints por idProyecto
export async function getSprintsByIdProyecto(idProyecto: string): Promise<Sprint[]> {
    const sprintsRef = collection(db, "Sprint");
    const sprintsSnapshot = await getDocs(query(sprintsRef, where("idProyecto", "==", idProyecto)));

    //usar getTareasById para obtener las tareas de cada sprint
    return await Promise.all(sprintsSnapshot.docs.map(async doc => {
        const sprint = { idSprint: doc.id, ...doc.data() } as Sprint;
        sprint.tareas = await getTareasByIds(sprint.idTareas);
        return sprint;
    }));
}

export async function createSprint(sprint: Omit<Sprint, 'idSprint'>) {
    const sprintRef = doc(db, "Sprint", uuidv4());
    await setDoc(sprintRef, sprint);
    return sprintRef.id;
}

export async function getEpicsByIdProyecto(idProyecto: string){
    const epicsRef = collection(db, "Epic");
    const epicsSnapshot = await getDocs(query(epicsRef, where("idProyecto", "==", idProyecto)));
    const epics = epicsSnapshot.docs.map(doc => ({ idEpic: doc.id, ...doc.data() } as Epic));

    const epicColumn: {
        id: string;
        title: string;
        epics: Epic[];
    } = {
        id: 'epic',
        title: 'Epic',
        epics: epics
    }

    return epicColumn;
}

export async function createEpic(epic: Omit<Epic, 'idEpic'>) {
    const epicRef = doc(db, "Epic", uuidv4());
    await setDoc(epicRef, epic);
    return epicRef.id;
}

export async function createTask(task: Omit<Tarea, 'idTarea'>) {
    const taskRef = doc(db, "Tarea", uuidv4());
    await setDoc(taskRef, task);
    
    // Actualizar el sprint con el ID de la tarea
    const sprintRef = doc(db, "Sprint", task.idSprint);
    await updateDoc(sprintRef, { idTareas: arrayUnion(taskRef.id) });

    //Actualizar el proyecto con el ID de la tarea
    if (!task.idProyecto) {
        throw new Error("El campo 'idProyecto' es obligatorio para crear una tarea.");
    }
    const proyectoRef = doc(db, "Proyecto", task.idProyecto);
    await updateDoc(proyectoRef, { idTareas: arrayUnion(taskRef.id) });

    //Actualizar el epic con el ID de la tarea
    if (!task.idEpic) {
        throw new Error("El campo 'idEpic' es obligatorio para crear una tarea.");
    }
    const epicRef = doc(db, "Epic", task.idEpic);
    await updateDoc(epicRef, { idTareas: arrayUnion(taskRef.id) });
    return taskRef.id;
}

export async function deleteSprintById(idSprint: string) {
    try {
        const sprintRef = doc(db, "Sprint", idSprint); // Referencia al documento
        await deleteDoc(sprintRef); // Elimina el documento
        console.log(`Sprint con ID ${idSprint} eliminado exitosamente.`);
    } catch (error) {
        console.error(`Error al eliminar el sprint con ID ${idSprint}:`, error);
        throw error; // Re-lanzar el error para manejarlo donde se llame la función
    }
}