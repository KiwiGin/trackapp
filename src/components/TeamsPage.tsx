'use client'

import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createTeam, getEquiposByIdUsuario} from "@/lib/firebaseUtils";
import { useRouter } from 'next/navigation'
import { LoadingCharger } from "./LoginCharger";
import { Equipo } from "@/types/Equipo";
import ModalTeam from "./ModalTeam";

function TeamsPage() {
    const { data: session, status } = useSession();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [isLoading, setIsLoading] = useState(true) //cambiarlo a true luego de que todo este listo
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
          signIn();
        } else {
            setIsLoading(false);
        }
      }, [session, status]);

      useEffect(() => {
        if (!session) return;
        getEquiposByIdUsuario(session.user.id).then(setEquipos);
      }, [session]);

    if (isLoading || status === 'loading' || !session) {
        return <LoadingCharger />;
    }
    const handleOpenTeamModal = () => {
        setIsProjectModalOpen(true)
    }

    const handleCreateTeam = async (team : Equipo) => {
        console.log('Crear Proyecto:', team.nombre);
        // Asegúrate de que todos los campos tengan valores definidos
        const equipo = {
            nombre: team.nombre || "", // Si no hay nombre, asigna una cadena vacía
            idWorkspace: "", // Si no tienes idWorkspace, asigna una cadena vacía
            // Si no tienes miembros, asigna un array con el usuario actual, si tienes miembros, agrega el usuario actual con los miembros de team.miembros
            miembros: [{ idUsuario: session?.user.id, rolEquipo: "SMaster" }, ...team.miembros]
        };

        try {
            const equipoId = await createTeam(equipo);
            console.log('Equipo creado:', equipoId);
            setEquipos((prevEquipos) => [
                ...prevEquipos,
                { idEquipo: equipoId, ...equipo }
            ]);
        } catch (error) {
            console.error('Error al crear el proyecto:', error);
        }
    };


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
                            <div className="text-lg font-semibold">Teams</div>
                            <div className="flex items-center space-x-4">

                                <div className="flex items-center">
                                    <Image
                                        src="/userpic.jpg"
                                        alt="User Profile"
                                        width={30}
                                        height={30}
                                        className="rounded-full"
                                    />
                                </div>
                                <button onClick={handleOpenTeamModal} className="bg-[#2B2D42] text-white px-4 py-2 rounded-full">+ New Team</button>
                                {/* botones*/}
                                <a href="#" className="px-4 py-2 hover:bg-gray-800 flex items-center">
                                    <i className="bi bi-grid-fill bg-black"></i>
                                </a>
                            </div>
                        </div>

                        {/* MAIN*/}
                        <div className="p-4">
                            <div className="grid grid-cols-4 gap-4">
                                {equipos.map((equipo, index) => (
                                    <div
                                        key={index}
                                        onClick={() => router.push(`/workspace/${equipo.idWorkspace}`)}
                                        className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
                                    >
                                        <Image
                                            src={"/workspace_default.jpg"}
                                            alt={equipo.nombre}
                                            width={300}
                                            height={200}
                                            className="object-cover w-full h-48"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold">{equipo.nombre}</h3>
                                            <p className="text-sm text-gray-500">SMaster: {equipo.miembros.find((miembro) => miembro.rolEquipo === "SMaster")?.idUsuario}</p>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para crear nuevo equipo */}
            {isProjectModalOpen && <ModalTeam open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen} handleCreate={handleCreateTeam} />
            }
        </>
    )
}

export default TeamsPage