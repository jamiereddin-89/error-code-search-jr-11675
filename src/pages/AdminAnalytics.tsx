import { Link } from "react-router-dom";
import { Home, ArrowLeft, BarChart3 } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";

export default function AdminAnalytics() {
  return (
    <div className="page-container">
      <TopRightControls />
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
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 size={20}/> Analytics</h1>
        <div className="w-10" />
      </header>
      <div className="w-full max-w-xl text-center text-muted-foreground">
        <p>Analytics page placeholder.</p>
      </div>
    </div>
  );
}
