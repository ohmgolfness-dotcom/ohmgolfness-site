export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <div className="bg-white border-b border-gray-100 px-6 py-4 h-[65px]" />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-gray-200 rounded-xl mb-2 animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 rounded-xl mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-6 w-32 bg-gray-200 rounded-xl mb-4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
