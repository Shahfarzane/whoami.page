export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="border-blue-200 h-8 w-8 animate-spin rounded-full border-4 border-t-gray-800 dark:border-gray-800 dark:border-t-gray-200" />
    </div>
  );
}
