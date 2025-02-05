'use client'
import React, { useEffect, useState } from 'react'
import { StreamChat } from "stream-chat";
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window, ChannelList } from "stream-chat-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import 'stream-chat-react/dist/css/v2/index.css'
// import { getEquiposByIdUsuario } from '@/lib/firebaseUtils';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<ReturnType<StreamChat["channel"]> | null>(null);

  // Manejar autenticación y redirección
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      signIn();
    } else if (session && status !== 'authenticated') {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [session, status, router]);

  // Obtener el token
  useEffect(() => {
    async function fetchToken() {
      const res = await fetch("/api/chat-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      const data = await res.json();
      if (res.ok) setToken(data.token);
      else console.error("Error obteniendo el token:", data.error);
    }

    if (session?.user?.id) {
      fetchToken();
    }
  }, [session?.user?.id]);

  

  // Configurar el cliente y conectar al usuario
  useEffect(() => {
    async function setupChat() {
      if (!token || isConnected) return;

      // Crear una nueva instancia del cliente
      const client = StreamChat.getInstance(apiKey);

      try {
        await client.connectUser(
          {
            id: session!.user.id,
            name: session!.user.nombre,
            image: session!.user.linkImg,
          },
          token
        );

        const channel = client.channel("messaging", "travel", {
          name: "Awesome channel about traveling",
        });

        // Obtener los equipos del usuario y crear chats grupales
        // await createGroupChatsForTeams(client);
        setChannel(channel);
        setChatClient(client);
        setIsConnected(true);
      } catch (error) {
        console.error('Error conectando al usuario:', error);
      }
    } 

    setupChat();
  }, [token, session, isConnected]);

  // // Función para crear los chats grupales
  // async function createGroupChatsForTeams(client: StreamChat) {
  //   if (!session?.user?.id) return;

  //   try {
  //     // Obtener los equipos del usuario
  //     const userTeams = await getEquiposByIdUsuario(session!.user.id);

  //     // Si el usuario pertenece a al menos un equipo
  //     if (userTeams.length > 0) {
  //       // Iterar sobre cada equipo
  //       for (const team of userTeams) {
  //         const teamId = team.idEquipo;
  //         const members = team.miembros.map((member: { idUsuario: string }) => member.idUsuario); // Obtener los miembros del equipo
  //         console.log('EQUIPO:', teamId);
  //         console.log('MIEMBROS:', members);

  //         const existingChannel = client.channel('messaging', teamId);

  //         const channel = client.channel('messaging', teamId, {
  //           name: `Chat grupal del equipo ${teamId}`,
  //           image: 'https://getstream.io/random_svg/?name=' + teamId,
  //           members: members // Asegúrate de incluir al usuario en los miembros
  //         });

  //         await channel.watch()

  //         // Opcional: enviar un mensaje de bienvenida
  //         await channel.sendMessage({
  //           text: '¡Bienvenidos al chat grupal!',
  //         });

  //         // Establecer el canal como activo
  //         // Añadir el canal al array de canales
  //         setChannel(prevChannels => (prevChannels ? [...prevChannels, channel] : [channel])); // Establecer el canal para la interfaz de usuario

  //       }
  //     } else {
  //       console.log('El usuario no pertenece a ningún equipo.');
  //     }
  //   } catch (error) {
  //     console.error('Error creando los chats grupales:', error);
  //   }
  // }



  if (isLoading || !isConnected) return <div>Conectando al chat...</div>;

  return (
    <div className="flex flex-col h-full">
      <Chat client={chatClient!} theme="messaging light">
        <div className="flex flex-row h-full">
          <div className="flex-1 flex-col w-full">
            <ChannelList />
          </div>
          <div className="flex-1 flex-col w-full">
            <Channel channel={channel!}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>

          </div>
        </div>
      </Chat>
    </div>
  );
}
