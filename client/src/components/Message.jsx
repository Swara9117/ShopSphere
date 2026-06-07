export default function Message({ variant = 'error', children }) {
  const styles =
    variant === 'error'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}
