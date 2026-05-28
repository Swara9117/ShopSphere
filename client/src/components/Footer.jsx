export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-white py-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
        <p className="mt-1">Modern MERN Stack E-Commerce Platform</p>
      </div>
    </footer>
  );
}
