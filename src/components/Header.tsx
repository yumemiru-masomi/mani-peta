interface HeaderProps {
  currentPage: "text" | "face";
}

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mani Peta</h1>
          <nav className="flex space-x-4">
            <a
              href="/text"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === "text"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Text Mask
            </a>
            <a
              href="/face"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === "face"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Face Mask
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
