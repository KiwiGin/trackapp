import ProyectPage from '@/components/ProyectPage'
import { getProyectoById } from '@/lib/firebaseUtils'
import { Proyecto as Project } from '@/types/Proyecto'
import React from 'react'

export default async function Proyecto({params}: {params: {idProject: string}}) {
  const {idProject} = params
  const proyecto: Project | null = await getProyectoById(idProject)
  return (
    <>
        {proyecto && <ProyectPage proyecto={proyecto} />}
    </>
  )
}
