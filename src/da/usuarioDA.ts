import { collection, addDoc, getDocs, query, doc, getDoc} from "firebase/firestore"; 
import {db} from "@/lib/firebase";

export default async function createUser(email: string, password: string) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      email,
      password
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getUserById(usuarioId: string) {
  const usuariosRef = doc(db, "usuarios", usuarioId);
  const usuarioSnap = await getDoc(usuariosRef);

  if (!usuarioSnap.exists()) {
    throw new Error("Teacher not found in database");
  }
}

//obtener todos los usuarios
export async function getAllUsers() {
  const q = query(collection(db, "usuarios"));
  const querySnapshot = await getDocs(q);

  const usuarios: { id: number; nombre: string }[] = [];

  querySnapshot.forEach((doc) => {
    usuarios.push(doc.data() as { id: number; nombre: string });
  });

  return usuarios;
}

//editar usuario
