import { Dato, PaginationParam } from '@/types';

// Obtener datos con paginación
const fetchDatos = async (pagination: PaginationParam) => {
    const response = await fetch(`http://localhost:8080/datos?skip=${pagination.pageIndex}&limit=${pagination.pageSize}`);
    if (!response.ok) {
        throw new Error('Error fetching data');
    }
    return response.json();
};

// Obtener un dato por su ID
const fetchDatoById = async (id: number) => {
    const response = await fetch(`http://localhost:8080/datos/${id}`);
    if (!response.ok) {
        throw new Error('Error fetching data');
    }
    return response.json();
};

// Crear un nuevo dato
const createDato = async (nuevoDato: Dato) => {
    const response = await fetch('http://localhost:8080/datos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoDato),
    });

    if (!response.ok) {
        throw new Error('Error creating data');
    }

    return response.json();
};

// Editar un dato existente
const editDato = async (id: number, updatedDato: Dato) => {
    const response = await fetch(`http://localhost:8080/datos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDato),
    });

    if (!response.ok) {
        throw new Error('Error editing data');
    }

    return response.json();
};

// Eliminar un dato
const deleteDato = async (id: number) => {
    const response = await fetch(`http://localhost:8080/datos/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Error deleting data');
    }

    return response.json();
};

export {
    fetchDatos,
    fetchDatoById,
    createDato,
    editDato,
    deleteDato,
};
