"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export const Header = () => {
  const { data: session } = useSession();
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => setOpenMenu(!openMenu);

  return (
    <div className="flex justify-between items-center px-4 py-2 shadow-sm max-h-10">
      <header className="text-xl font-bold">
        <Link prefetch={false} href={"/"}>
          WokiLite
        </Link>
      </header>

      <Link
        prefetch={false}
        href={"/reservations"}
        className="text-md font-semibold hover:text-green-600 transition"
      >
        Ver reservas
      </Link>

      {session ? (
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="px-4 py-1 bg-gray-700 text-white rounded-md font-medium hover:bg-green-600 transition"
          >
            {session.user?.name?.split(" ")[0] || "Usuario"}
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-40  border border-gray-200 rounded-md shadow-md">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-green-600"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() =>
            signIn("google", { callbackUrl: "/", prompt: "select_account" })
          }
          className="px-4 py-1 bg-gray-700 text-white rounded-md font-medium hover:bg-green-600 transition"
        >
          Iniciar sesión
        </button>
      )}
    </div>
  );
};
