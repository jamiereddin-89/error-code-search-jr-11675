import { Link } from "react-router-dom";
import { Home, ArrowLeft, FilePlus2 } from "lucide-react";

export default function AdminAddErrorInfo() {
  return (
    <div className="page-container">
      <header className="flex items-center justify-between mb-8 w-full max-w-xl">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <button className="home-button" aria-label="Back to Admin">
              <ArrowLeft className="inline mr-2" /> Back
            </button>
          </Link>
          <Link to="/">
            <button className="home-button" aria-label="Go Home">
              <Home className="inline mr-2" /> Home
            </button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FilePlus2 size={20}/> Add Error Info</h1>
        <div className="w-10" />
      </header>
      <div className="w-full max-w-xl text-center text-muted-foreground">
        <p>Add Error Info page placeholder.</p>
      </div>
    </div>
  );
}
