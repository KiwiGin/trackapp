export interface Chat{
    idChat: string;
    nombre: string;
    mensajes?: Mensaje[];
    idMensajes: string[];
    usuarios?: Usuario[];
    idUsuarios: string[];
}