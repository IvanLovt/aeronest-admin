"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import CatalogSection from "@/components/CatalogSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CatalogPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  // Проверяем, что пользователь авторизован и ID совпадает
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/");
      return;
    }

    if (session.user.id !== userId) {
      router.push(`/${session.user.id}/catalog`);
    }
  }, [session, userId, router]);

  if (!session?.user?.id || session.user.id !== userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isScrolled={false}
        activeTab="catalog"
        userName={session.user.name || ""}
        useUrlNavigation={true}
      />
      <main className="flex-1 pt-20">
        <CatalogSection />
      </main>
      <Footer useUrlNavigation={true} />
    </div>
  );
}
