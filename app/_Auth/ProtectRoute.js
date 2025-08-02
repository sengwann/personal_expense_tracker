"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../lib/loading/loading";
import { useEffect } from "react";

const ProtectRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  return user ? children : null;
};

export default ProtectRoute;
