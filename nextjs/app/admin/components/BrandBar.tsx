"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import CopyStoreURL from "./CopyStoreURL";
import { useDrawer } from "./DrawerProvider";
import NewStoreButton from "@/app/admin/profile/ui/NewStoreButton";
import { useMedia } from "@/lib/useMedia";

export default function BrandBar() {
const search = useSearchParams();
const { toggleDrawer } = useDrawer();
const [isAuthed, setIsAuthed] = useState(false);
const supabase = useMemo(() => createClient(), []);
useEffect(() => {
let m = true;
supabase.auth.getUser().then(({ data }) => m && setIsAuthed(!!data.user));
const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => m && setIsAuthed(!!s?.user));
return () => { m = false; sub?.subscription?.unsubscribe?.(); };
}, [supabase]);

  // ✅ Wide if viewport ≥ 768px (desktop/tablet)
  const isWide = useMedia("(min-width: 768px)", true);
console.log(isWide);
  return (
    <header className="sticky top-0 z-[60] w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4 overflow-visible">
        {/* Mobile menu */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-black/10 lg:hidden shrink-0"
          onClick={toggleDrawer}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Microw Home">
          {/* Small: mark */}
          <Image
            src="/brand/logo-mark.png"
            alt="microw"
            title="micro.me"
            width={48}
            height={48}
            className="block lg:hidden h-8 w-8 min-h-8 min-w-8"
            priority
          />
          {/* Large: full logo */}
          <Image
            src="/brand/logo-large.png"
            alt="Microw"
            title="micro.me"
            width={460}
            height={380}
            className="hidden lg:block h-12 w-auto shrink-0"
            priority
          />
        </Link>

        {/* Divider */}
        <div className="mx-2 hidden sm:block h-6 w-px bg-black/10" />

        {/* Center actions */}
        <div className="relative z-[61] flex flex-1 items-center gap-2 overflow-visible">
          <StoreSwitcher />

          {isWide ? (
            // ✅ Full-labeled on wide screens
            <div className="flex items-center gap-2">
              <NewStoreButton variant="full" />
              <CopyStoreURL />
            </div>
          ) : (
            // ✅ Icon-only on narrow screens
            <div className="flex items-center gap-1 ml-auto">
              <NewStoreButton variant="icon" />
              <CopyStoreURL compact />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
