import { Link } from "react-router-dom";
import { Home, ArrowLeft, Plus } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { Button } from "@/components/ui/button";

export default function AdminAddDevice(){
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
        <h1 className="text-2xl font-bold">Add Device</h1>
        <div className="w-10" />
      </header>

      <div className="w-full max-w-xl grid gap-4">
        <div className="grid grid-cols-1 gap-2">
          <Link to="/admin/brands" className="nav-button flex items-center justify-between gap-2">
            <span>Manage Brands</span>
            <Plus />
          </Link>
          <Link to="/admin/models" className="nav-button flex items-center justify-between gap-2">
            <span>Manage Models</span>
            <Plus />
          </Link>
          <Link to="/admin/categories" className="nav-button flex items-center justify-between gap-2">
            <span>Manage Categories</span>
            <Plus />
          </Link>
          <Link to="/admin/tags" className="nav-button flex items-center justify-between gap-2">
            <span>Manage Tags</span>
            <Plus />
          </Link>
        </div>
      </div>
    </div>
  );
}
