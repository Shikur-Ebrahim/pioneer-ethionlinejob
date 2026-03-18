export default function AddViewPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add View</h1>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-bold mb-6">Create New Video/Task View</h2>
        
        <form className="space-y-6 max-w-2xl">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              View Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700"
              placeholder="e.g. Watch this video for 30s"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Content URL (Video/Website)
            </label>
            <input
              type="url"
              id="url"
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700"
              placeholder="https://youtube.com/..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                id="duration"
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700"
                placeholder="30"
              />
            </div>
            <div>
              <label htmlFor="reward" className="block text-sm font-medium mb-2">
                Reward Amount (Birr)
              </label>
              <input
                type="number"
                id="reward"
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700"
                placeholder="5"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
            >
              Add View Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
