import { db} from '@/lib/firebase';	
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, getDocs, doc, getDoc, setDoc, arrayUnion, documentId } from 'firebase/firestore';
// import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { Usuario } from '@/types/Usuario';
import { Workspace } from '@/types/Workspace';
import { Proyecto } from '@/types/Proyecto';
import { Equipo } from '@/types/Equipo';

//obtener usuarios por id
export async function getUsuariosById( idUsuario:string ){
    const usuariosRef = doc(db, "usuarios",idUsuario);
    const usuariosSnapshot = await getDoc(usuariosRef);

    if(!usuariosSnapshot.exists()){
        throw new Error('No existe el usuario');
    }

    return {idUsuario: idUsuario, ...usuariosSnapshot.data()} as Usuario;
}

//obtener usuarios por correo
export async function getUsuariosByEmail( email:string ):Promise<Usuario & {clave:string}|null>{
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", email));
    const usuariosSnapshot = await getDocs(q);

    if(usuariosSnapshot.empty){
        return null;
    }

    const usuarioDoc = usuariosSnapshot.docs[0];
    return {idUsuario: usuarioDoc.id, ...usuarioDoc.data()} as Usuario & {clave:string};
}

//obtener usuarioid por correo
export async function getUserIdByEmail( email:string ):Promise<string>{
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", email));
    const usuariosSnapshot = await getDocs(q);

    if(usuariosSnapshot.empty){
        throw new Error('No existe el usuario');
    }

    return usuariosSnapshot.docs[0].id;
}


//crear workspace y que devuelva el id
export async function createWorkspace(workspace: Omit<Workspace, 'idWorkspace'>) {
  
    const workspaceRef = doc(db, "Workspace", uuidv4());
  
    await setDoc(workspaceRef, workspace);
    return workspaceRef.id;
}

//obtener workspace por idUsuario
export async function getWorkspaceByIdUsuario(idUsuario: string):Promise<Workspace[]>{
    const workspaceRef = collection(db, "Workspace");
    const q = query(workspaceRef, where("idUsuarios", "array-contains", idUsuario));
    const workspaceSnapshot = await getDocs(q);
    return workspaceSnapshot.docs.map(doc => ({idWorkspace: doc.id, ...doc.data()} as Workspace));
}
  
//obtener workspace por id
export async function getWorkspaceById(idWorkspace: string):Promise<Workspace>{
    const workspaceRef = doc(db, "Workspace", idWorkspace);
    const workspaceSnapshot = await getDoc(workspaceRef);
    return {idWorkspace: idWorkspace, ...workspaceSnapshot.data()} as Workspace;
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

        // Agregar los resultados al arreglo principal
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
export async function getEquiposByIdUsuario(idUsuario: string):Promise<Equipo[]>{
    const equiposRef = collection(db, "Equipo");
    const equiposSnapshot = await getDocs(equiposRef);
    if(equiposSnapshot.empty){
        throw new Error('No hay equipos');
    }
    return equiposSnapshot.docs.map(doc => ({idEquipo: doc.id, ...doc.data()} as Equipo)).filter(equipo => equipo.miembros.some((m: { idUsuario: string }) => m.idUsuario === idUsuario));
}