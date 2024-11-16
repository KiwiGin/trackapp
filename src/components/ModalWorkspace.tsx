'use client'

import React, { useState } from 'react'

function ModalWorkspace({ handleCloseModal, handleCreate}: { handleCloseModal: () => void; handleCreate: (workspaceName: string) => void }) {
    const [workspaceName, setWorkspaceName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Lógica para crear el workspace
      console.log('Crear Workspace:', workspaceName);
      handleCloseModal(); // Cierra la modal después de crear el workspace
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Workspace</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700">Nombre del Workspace</label>
              <input
                type="text"
                id="workspaceName"
                className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
            </div>
  
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => handleCreate(workspaceName)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}

export default ModalWorkspace