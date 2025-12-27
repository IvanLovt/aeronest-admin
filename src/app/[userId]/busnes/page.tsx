"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";

export default function BusnesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isScrolled={true}
        userName={session.user.name || "Пользователь"}
        useUrlNavigation={true}
      />
      <main className="flex-1 pt-20">
        <LandingPage />
      </main>
      <Footer useUrlNavigation={true} />
    </div>
  );
}
