export default function Navbar() {
  return (
    <nav className="bg-white border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-rose-600 tracking-tight">
          Bella Salon
        </span>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/" className="hover:text-rose-600 transition-colors">Usluge</a>
          <a href="/booking" className="hover:text-rose-600 transition-colors">Zakaži</a>
          <a
            href="/admin"
            className="bg-rose-600 text-white px-4 py-1.5 rounded-full hover:bg-rose-700 transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </nav>
  )
}
