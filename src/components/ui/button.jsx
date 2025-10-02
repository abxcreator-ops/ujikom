import React from 'react';

// This file seems to be a placeholder for button examples.
// A real component would be more structured.
// Wrapping the elements in a fragment to fix the parsing error.
const ButtonExamples = ({ handleOpenModal, handleDeleteAdmin, admin }) => (
  <>
    {/* Tombol Tambah Admin */}
    <button 
        onClick={() => handleOpenModal()}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
    >
        + Tambah Admin Baru
    </button>

    {/* Tombol Edit */}
    <button onClick={() => handleOpenModal(admin)} className="text-indigo-600 hover:text-indigo-900">Edit</button>

    {/* Tombol Hapus */}
    <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-900 ml-4">Hapus</button>
  </>
);

export default ButtonExamples;