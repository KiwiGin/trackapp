import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsuariosById, getUsuariosByEmail } from "@/lib/firebaseUtils";

export default NextAuth({
    providers:[
        CredentialsProvider({
            name: 'Credentials',
            credentials:{
                email: {label: "Email", type: "text"},
                clave: {label: "Clave", type: "password"}
            },
            async authorize(credentials){
                //validar que se ingresen las credenciales
                if(!credentials?.email || !credentials?.clave){
                    return null;
                }

                //buscar usuario por correo
                const usuario = await getUsuariosByEmail(credentials.email);
                if(!usuario){
                    return null;
                }

                //validar clave
                const isValidClave = credentials.clave === usuario.clave;
                if(!isValidClave){
                    return null;
                }

                //devolver id de usuario
                return {id: usuario.idUsuario};
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session:{
        strategy: 'jwt',
    },
    jwt:{
        maxAge:60*60*24*7,
    },
    callbacks:{
        async jwt({token, user}){
            if(user){
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}){
            if(!token.id){
                throw new Error('El id del usuario no se encuentra en token');
            }

            const user = await getUsuariosById(token.id as string);

            if(!user){
                throw new Error('Usuario vacio');
            }

            session.user = {
                id: user.idUsuario,
                nombre: user.nombre,
                usuario: user.usuario,
                email: user.email,
                linkImg: user.linkImg,
                rol: user.rolSistema,
            };

            return session;
        }
    },
    pages:{
        signIn: '/auth/singin',
        signOut: '/auth/logout',
        error: '/auth/error',
    }
})
