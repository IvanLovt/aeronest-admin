"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import DashboardSection from "@/components/UserDash/DashboardSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const validTabs = [
  "overview",
  "addresses",
  "wallet",
  "orders",
  "referrals",
  "settings",
];

export default function DashboardTabPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  const tab = params?.tab as string;

  // Проверяем, что пользователь авторизован и ID совпадает
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/");
      return;
    }

    if (session.user.id !== userId) {
      router.push(`/${session.user.id}/dashboard/${tab || "overview"}`);
      return;
    }

    // Если вкладка невалидна, перенаправляем на overview
    if (tab && !validTabs.includes(tab)) {
      router.push(`/${userId}/dashboard/overview`);
    }
  }, [session, userId, tab, router]);

  if (!session?.user?.id || session.user.id !== userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        isScrolled={false}
        activeTab="dashboard"
        userName={session.user.name || ""}
        useUrlNavigation={true}
      />
      <main className="flex-1 pt-20">
        <DashboardSection initialTab={tab || "overview"} />
      </main>
      <Footer useUrlNavigation={true} />
    </div>
  );
}
