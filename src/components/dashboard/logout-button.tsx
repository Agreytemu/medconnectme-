"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearDemoCookie } from "@/lib/demo/session";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { t } = useLang();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    clearDemoCookie();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      loading={loading}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      {t("nav.logout")}
    </Button>
  );
}
