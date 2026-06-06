import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppHeader from "~/components/AppHeader";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { getRooms, createRoom, deleteRoom, associateRoom, type Room } from "~/services/room-service";
import {useAuth} from "~/hooks/useAuth";

export function meta() {
  return [{ title: "TeachDoc - Home" }];
}

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !sessionStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch {
      setError("Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const room = await createRoom(newRoomName.trim());
      setRooms([...rooms, room]);
      setNewRoomName("");
    } catch {
      setError("Failed to create room.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAssociateRoom(e: React.FormEvent) {
    e.preventDefault();

    const roomId = Number(newRoomName.trim());
    const userId = Number(user?.id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      setError("Informe um código de sala válido.");
      return;
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Não foi possível identificar o usuário autenticado.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await associateRoom(roomId, userId);
      setNewRoomName("");
      await fetchRooms();
    } catch {
      setError("Failed to associate room.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteRoom(id: number) {
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete room.");
    }
  }

   function handleLogout() {
     if (typeof window !== 'undefined') {
       sessionStorage.removeItem("token");
     }
     navigate("/");
   }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader
        userName={user?.name}
        actionLabel="Logout"
        onAction={handleLogout}
      />
            <main className="max-w-3xl mx-auto py-10 px-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Minhas Salas</h2>
              {
              user?.role !== 'STUDENT' ?
              <form onSubmit={handleCreateRoom} className="flex gap-2 mb-6">
                <Input
                    type="text"
                    placeholder="New room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                />
                <Button type="submit" disabled={creating}>
                  {creating ? "Criando..." : "Criar"}
                </Button>
              </form>
              : <>
                    <form onSubmit={handleAssociateRoom} className="flex gap-2 mb-6">
                      <Input
                          type="text"
                          placeholder="Inserir código da sala"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                      />
                      <Button type="submit" disabled={creating}>
                        {creating ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
              </>
              }

              {error && <p className="text-red-500 mb-4">{error}</p>}

              {loading ? (
                  <p className="text-gray-500">Loading rooms...</p>
              ) : rooms.length === 0 ? (
                  <p className="text-gray-400">Não foram encontradas salas</p>
              ) : (
                  <ul className="space-y-3">
                    {rooms.map((room) => (
                        <li
                            key={room.id}
                            className="bg-white rounded shadow px-4 py-3 flex items-center justify-between cursor-pointer transition hover:bg-gray-50"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/rooms/${room.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                navigate(`/rooms/${room.id}`);
                              }
                            }}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{room.name}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(room.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                              type="button"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRoom(room.id);
                              }}
                          >
                            Delete
                          </Button>
                        </li>
                    ))}
                  </ul>
              )}
            </main>
    </div>
  );
}
