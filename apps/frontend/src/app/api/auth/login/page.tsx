"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!session ? (
        <>
          <h1 className="text-2xl mb-4">Iniciá sesión</h1>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Iniciar con Google
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl mb-4">Hola, {session.user?.name}</h1>
          <button
            onClick={() => signOut()}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </>
      )}
    </div>
  );
}
