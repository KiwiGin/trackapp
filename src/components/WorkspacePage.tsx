'use client'

import { Workspace } from "@/types/Workspace";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createProject, deleteProjectById, getProyectosByIdWorkspace } from "@/lib/firebaseUtils";
import { useRouter } from 'next/navigation'
import { LoadingCharger } from "./LoginCharger";
import ModalProject from "./ModalProject";
import { Proyecto } from "@/types/Proyecto";
import { EllipsisVerticalIcon, Trash} from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function WorkspacePage({ workspace }: { workspace: Workspace }) {
  const workspace_name = workspace.nombre;
  const { data: session, status } = useSession();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      signIn();
    } else if (session && (!workspace.idUsuarios.includes(session.user.id))) {
      router.push('/');
    } else {
      setIsLoading(false);
    }

  }, [session, status, router, workspace.idUsuarios]);

  useEffect(() => {
    if (!workspace.idWorkspace) return;
    getProyectosByIdWorkspace(workspace.idWorkspace).then(setProyectos);
  }, [workspace, proyectos]);

  if (isLoading || status === 'loading' || !session) {
    return <LoadingCharger />;
  }


  const handleOpenModalProject = () => {
    setIsProjectModalOpen(true)
  }



  const handleCreateProject = async (projectName: string, projectDescription: string) => {
    console.log('Crear Proyecto:', projectName);
    console.log('Descripción:', projectDescription);
    // Asegúrate de que todos los campos tengan valores definidos
    const proyecto = {
      nombre: projectName || "", // Si no hay nombre, asigna una cadena vacía
      descripcion: projectDescription || "", // Si no hay descripción, asigna una cadena vacía
      idUsuarios: workspace.idUsuarios, // Asigna los usuarios del workspace
      idEpics: [], // Si no tienes epics, asigna un array vacío
      idSprints: [], // Si no tienes sprints, asigna un array vacío
      idTareas: [], // Si no tienes tareas, asigna un array vacío
      idEquipo: "", // Si no tienes idEquipo, asigna una cadena vacía
      creadoPor: session?.user.usuario || "", // Si no tienes creadoPor, asigna una cadena
      idWorkspace: workspace.idWorkspace // Asigna el id del workspace actual
    };

    try {
      const projectId = await createProject(proyecto);
      //crear Sprint 'Backlog' por defecto
      



      console.log('Proyecto creado:', projectId);
      setProyectos((prevProyectos) => [
        ...prevProyectos,
        { ...proyecto, idProyecto: projectId } // Se agrega el nuevo proyecto sin recargar la página
      ]);
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProjectById(projectId);
  }

  return (

    <>
      <div className="flex h-screen">
        {/* Sidebar */}

        {/* Main */}
        <div className='flex flex-col w-full'>
          {/* Header */}
          <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-white shadow-md p-4 flex justify-between items-center">
              <div className="text-lg font-semibold">{workspace_name}</div>
              <div className="flex items-center space-x-4">
                <button onClick={handleOpenModalProject} className="bg-[#2B2D42] text-white px-4 py-2 rounded-full">+ New project</button>
                {/* botones*/}
                <a href="#" className="px-4 py-2 hover:bg-gray-800 flex items-center">
                  <i className="bi bi-grid-fill bg-black"></i>
                </a>
              </div>
            </div>

            {/* MAIN*/}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {proyectos.map((project, index) => (
                  <div
                    key={index}

                    className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
                  >
                    <Image
                      onClick={() => router.push(`/workspace/${workspace.idWorkspace}/projects/${project.idProyecto}`)}
                      src={"/workspace_default.jpg"}
                      alt={project.nombre}
                      width={300}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                    <div className="flex flex-row p-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.nombre}</h3>
                        <p className="text-sm text-gray-500">Created by {project.creadoPor}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="ml-auto">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => project.idProyecto && handleDeleteProject(project.idProyecto)}>
                              <Trash />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo proyecto */}
      {isProjectModalOpen && <ModalProject open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen} handleCreate={handleCreateProject} />
      }
    </>
  );
}
