import Image from "next/image";
import Link from "next/link";
import WordImageSlider from "components/site/WordImageSlider";
import MarketingNavbar from "components/site/MarketingNavBar"; // NEW IMPORT

export const metadata = {
// ... (metadata remains the same)
};

const ACCENT = "#e6759d";
const gradientClasses = `
        bg-gradient-to-r 
        from-[#e6759d]    // Your ACCENT color
        via-[#d16ba5]     // A slightly lighter/more vibrant pink
        to-[#5d5fef]      // A slightly darker or richer pink
        text-transparent 
        bg-clip-text
`;
const gradient = "gradient-rose";
export default function MarketingHome() {
  return (
    // We remove the min-h-screen from the main tag here, and rely on the inner div
    <main
      className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#fff3f7] to-white"
      style={{
        // gentle background tint
        // @ts-ignore
        "--tw-gradient-from": "#ffffff",
        "--tw-gradient-stops": "var(--tw-gradient-from), #fff3f7, #ffffff",
      }}
    >
      {/* 1. ADD THE NEW NAVBAR HERE */}
      <MarketingNavbar /> 

      <div className="mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        
        {/* 2. REMOVE THE OLD LOGO BLOCK */}
        {/* Old Logo Block: 
        <div className="mb-6">
          <Image
            src="/brand/logo-hero.png"
            alt="Microw"
            width={600}
            height={300}
            priority
          />
        </div> 
        */}

        {/* 3. ADD A PADDING/SPACER FOR THE FIXED NAV BAR (Optional but recommended) */}
        <div className="pt-20 sm:pt-16" />


        {/* Headline */}
        <WordImageSlider />

        {/* Subcopy */}
        <p className="mt-1 text-balance text-neutral-600 sm:text-lg">
          Microw lets creators and small shops showcase products, links, and
          CTAs in a clean, themeable page. Add categories, Instagram-style
          product cards, and one-tap WhatsApp.
        </p>

        {/* 4. REMOVE THE OLD CTA BLOCK AND KEEP ONLY THE SIGNUP CTA */}
        {/* We move the primary Log In/Sign Up actions to the Navbar, 
           but keep a simplified Sign Up prompt here if desired. 
        */}
        <div className="mt-8">
           <Link
             href="/admin/login?mode=signup"
             style={{ background: gradientClasses }}
             className={`inline-flex items-center justify-center rounded-xl bg-gradient-rose px-6 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-50 shadow-md`}
           >
             Get Started for Free
           </Link>
        </div>


        {/* Tiny footer */}
        <div className="mt-12 text-xs text-neutral-500">
          © {new Date().getFullYear()} Microw. All rights reserved.
        </div>
      </div>
    </main>
  );
}