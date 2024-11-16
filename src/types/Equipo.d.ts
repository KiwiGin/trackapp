export interface Miembro {
    idUsuario: string;
    rolEquipo: string;
  }
  
  export interface Equipo {
    idEquipo: string;
    nombre: string;
    miembros: Miembro[]; // Array de objetos que cumplen con la interfaz Miembro
  }
  