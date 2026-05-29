import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { getRooms, createRoom, deleteRoom, type Room } from "~/services/room-service";

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

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      navigate("/login");
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

  async function handleDeleteRoom(id: number) {
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete room.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">TeachDoc</h1>
        <Button type="button" variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">My Rooms</h2>

        <form onSubmit={handleCreateRoom} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="New room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-400">No rooms yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room.id}
                className="bg-white rounded shadow px-4 py-3 flex items-center justify-between"
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
                  onClick={() => handleDeleteRoom(room.id)}
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
