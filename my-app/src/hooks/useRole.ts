import { useEffect, useState } from "react";

export const useRole = () => {
  const [role, setRole] = useState<"DEFAULT" | "MASTER" | "VIEWER">("DEFAULT");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get("role");
    if (roleParam) {
      setRole(roleParam.toUpperCase() as any);
    }
  }, []);
  return { role };
};
