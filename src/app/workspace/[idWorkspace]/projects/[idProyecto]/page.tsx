import ProyectPage from '@/components/ProyectPage'
import { getProyectoById } from '@/lib/firebaseUtils'
import { Proyecto as Project } from '@/types/Proyecto'
import React from 'react'

export default async function Proyecto({params}: {params: {idProyecto: string}}) {
  const {idProyecto} = params
  const proyecto: Project | null = await getProyectoById(idProyecto)
  return (
    <>
        {proyecto && <ProyectPage proyecto={proyecto} />}
    </>
  )
}
