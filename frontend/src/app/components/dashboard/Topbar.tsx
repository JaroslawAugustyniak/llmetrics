'use client';

import Image from 'next/image';
import LanguageSwitcher from "@/app/components/ui/LanguageSwitcher";
import UserMenu from "@/app/components/dashboard/UserMenu";

export default function Topbar() {
  return (
    <header className="topbar">
      {/* Logo - visible on mobile */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Image
          src="/images/logo-biggg.png"
          alt="Logo"
          width={180}
          height={80}
          className="main-logo mx-auto"
          priority
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <LanguageSwitcher />
        <UserMenu isPortalUser={false} />
      </div>
    </header>
  );
}
