import Image from "next/image"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/corover.png" alt="Corover Logo" width={120} height={40} className="h-8 w-auto" priority />
            </Link>
          </div>

          {/* Center - Optional Navigation Items */}
    

          {/* Right Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/irctc.png" alt="Corover Logo" width={120} height={70} className="h-12 w-auto" priority />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
