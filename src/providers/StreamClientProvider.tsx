import {
    // StreamVideo,
    // StreamVideoClient,
} from '@stream-io/video-react-sdk';
import { signIn, useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
import { useEffect} from 'react';
// import { useState } from 'react';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
//   const userId = 'user-id';
//   const token = 'authentication-token';
//   const user: User = { id: userId };

//   const client = new StreamVideoClient({ apiKey, user, token });
//   const call = client.call('default', 'my-first-call');
//   call.join({ create: true });

const StreamVideoProvider = () => {
    const { data: session, status } = useSession();
    // const router = useRouter();
    // const [isLoading, setIsLoading] = useState(true);
    // const [videoClient, setVideoClient] = useState<StreamVideoClient>();

    useEffect(() => {
        if (status === "loading") return;
        if (!session) signIn();
    }, [session, status]);

    useEffect(() => {
        if (!session || !apiKey) return; // Verifica que apiKey y session existan
        // const client = new StreamVideoClient({ 
        //     apiKey, 
        //     user: {
        //         id: session.user.id,
        //         name: session.user.usuario,
        //         image: session.user.linkImg,
        //     },
        //     // tokenProvider 
        // });
        // setVideoClient(client);
        // setIsLoading(false);
    }, [session]);
    


        return (
            <>
             {/* <StreamVideo client={videoClient}></StreamVideo> */}
            </>
        );
    };
    export default StreamVideoProvider;  