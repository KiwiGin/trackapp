
import React from 'react'
import WorkspacePage from '@/components/WorkspacePage'
import { Workspace as EspacioTrabajo } from '@/types/Workspace'
import { getWorkspaceById } from '@/lib/firebaseUtils'

export default async function Workspace({params}: {params: {idWorkspace: string}}) {
    const {idWorkspace} = params
    const workspace: EspacioTrabajo | null = await getWorkspaceById(idWorkspace)
  return (
    <>
        {workspace && <WorkspacePage workspace={workspace} />}
    </>
  )
}

