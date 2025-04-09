import { useAppContext } from "../context/AppContext";

function Stats() {
  const { notes, tasks, ideas } = useAppContext();
  const stats = {
    notes: notes.length,
    tasks: tasks.length,
    completedTasks: tasks.filter((task) => task.done).length,
    ideas: ideas.length,
  };

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><i className="ri-bar-chart-line"></i> Stats</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 backdrop-blur-lg dark:backdrop-blur-lg rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
          <p className="text-lg font-medium">{stats.notes}</p>
        </div>
        <div className="p-3 backdrop-blur-lg dark:backdrop-blur-lg rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks</p>
          <p className="text-lg font-medium">{stats.tasks}</p>
        </div>
        <div className="p-3 backdrop-blur-lg dark:backdrop-blur-lg rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-lg font-medium">{stats.completedTasks}</p>
        </div>
        <div className="p-3 backdrop-blur-lg dark:backdrop-blur-lg rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ideas</p>
          <p className="text-lg font-medium">{stats.ideas}</p>
        </div>
      </div>
    </section>
  );
}
export default Stats;