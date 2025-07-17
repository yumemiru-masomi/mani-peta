export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Mani Peta
          </h1>
          <nav className="flex space-x-1 sm:space-x-3">
            <a
              href="/text"
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              Text
            </a>
            <a
              href="/face"
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              Face
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
