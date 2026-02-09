"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { SplashLogo } from "./_components/SplashLogo";
import { SplashProgress } from "./_components/SplashProgress";

const Splash = () => {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait for animation, then exit
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation, then redirect
      setTimeout(() => {
        router.push("/home");
      }, 500); // Duration of fade-out
    }, 2500); // Splash duration

    return () => clearTimeout(exitTimer);
  }, [router]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex flex-col items-center justify-center bg-background transition-all duration-700 ease-in-out",
        isExiting
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100",
      )}
    >
      <div className="relative flex flex-col items-center">
        <SplashLogo />
        <SplashProgress />
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;
