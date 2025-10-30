import { AuthButton } from "@/components/AuthButton";
import { Settings } from "@/components/Settings";
import { AuthButton } from "@/components/AuthButton";
import { useUserRole } from "@/hooks/useUserRole";

export const TopRightControls = () => {
  const { isAdmin } = useUserRole();
  return (
    <div className="absolute top-4 right-4 flex gap-2 items-center z-10">
      {isAdmin && (
        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-600 text-xs font-semibold">ADMIN</span>
      )}
      <AuthButton />
      <Settings />
    </div>
  );
};

export default TopRightControls;
