"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  // Перенаправляем на страницу с вкладкой overview
  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/");
      return;
    }

    if (session.user.id !== userId) {
      router.push(`/${session.user.id}/dashboard/overview`);
    } else {
      // Перенаправляем на overview, если вкладка не указана
      router.push(`/${userId}/dashboard/overview`);
    }
  }, [session, userId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Загрузка...</p>
    </div>
  );
}

