// UserMode component mein console add karo
import { useCookie } from "@/hooks/useCookie";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const UserMode = () => {
  const { userMode } = useCookie();

  useEffect(() => {
    console.log("🔄 UserMode re-rendered with:", userMode);
  }, [userMode]);

  if (!userMode) return null;

  return (
    <Badge className="capitalize px-3 py-1">
      {userMode.toLowerCase()} Mode
    </Badge>
  );
};

export default UserMode;
