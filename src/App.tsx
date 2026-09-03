import { useAuth } from "./context/AuthContext";
import { createJournal } from "./services/journalService";

function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  const handleCreateTestJournal = async () => {
    try {
      const journalId = await createJournal(
        user.uid,
        "My First Journal",
        "This is my first personal journal."
      );

      console.log("Journal created:", journalId);
      alert("Journal created successfully!");
    } catch (error) {
      console.error("Failed to create journal:", error);
      alert("Failed to create journal. Check the console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-5">
        <h1 className="text-4xl font-bold">
          Personal AI Journal
        </h1>

        <p className="text-green-400">
          Signed in as {user.email}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCreateTestJournal}
            className="px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            Create Test Journal
          </button>

          <button
            onClick={logout}
            className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;