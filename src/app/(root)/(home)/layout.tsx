'use client'
import Sidebar from '@/components/Sidebar';
import { signIn, useSession } from 'next-auth/react'
import { createWorkspace, getWorkspaceByIdUsuario } from '@/lib/firebaseUtils';
import { Workspace } from '@/types/Workspace';
import React, { ReactNode, useEffect, useState } from 'react';
import ModalWorkspace from '@/components/ModalWorkspace';
import Header from '@/components/Header';

const HomeLayout = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            signIn();
        }
    }, [session, status]);

    useEffect(() => {
        if (!session) return;
        getWorkspaceByIdUsuario(session.user.id).then(setWorkspaces);
    }, [session]);

    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>
    }

    if (!session) {
        return <div className="flex items-center justify-center h-screen">No autorizado</div>
    }
    const { user } = session;

    const handleOpenModal = () => {
        setIsWorkspaceModalOpen(true); // Abre la modal
    };

    const handleCloseModal = () => {
        setIsWorkspaceModalOpen(false); // Cierra la modal
    };
    const handleCreate = async (workspaceName: string) => {
        console.log('Crear Workspace:', workspaceName);

        // Asegúrate de que todos los campos tengan valores definidos
        const workspace = {
            nombre: workspaceName || "", // Si no hay nombre, asigna una cadena vacía
            idUsuarios: [user.id], // Si no tienes idUsuario, asigna un array vacío
            idProyectos: [], // Si no tienes proyectos, asigna un array vacío
            idEquipo: "" // Si no tienes idEquipo, asigna una cadena vacía
        };

        try {
            const workspaceId = await createWorkspace(workspace);
            console.log('Workspace creado:', workspaceId);
            // Actualiza el estado con el nuevo workspace creado
            setWorkspaces((prevWorkspaces) => [
                ...prevWorkspaces,
                { ...workspace, idWorkspace: workspaceId } // Se agrega el nuevo workspace sin recargar la página
            ]);
            handleCloseModal();
        } catch (error) {
            console.error('Error al crear el workspace:', error);
        }
    };
    return (
        <main className='relative'>
            <div className='flex'>
                <Sidebar handleNewWorkspace={handleOpenModal} workspaces={workspaces} />
                <section className='flex min-h-screen w-full flex-1 flex-col pb-6  max-md:pb-10'>
                <Header user={user} />
                    <div className='w-full h-full'>
                        {children}
                    </div>
                    {/* Modal para crear nuevo Workspace */}
                    {isWorkspaceModalOpen && <ModalWorkspace handleCloseModal={handleCloseModal} handleCreate={handleCreate} />
                    }
                </section>
            </div>

        </main>
    );
}

export default HomeLayout;
