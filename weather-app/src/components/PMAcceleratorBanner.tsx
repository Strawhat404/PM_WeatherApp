// ─────────────────────────────────────────────
// TODO: Replace "Your Name" with your actual name before submitting
// ─────────────────────────────────────────────

export default function PMAcceleratorBanner() {
  return (
    <footer className="mt-auto w-full border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Built by{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Your Name
          </span>{" "}
          ·{" "}
          <a
            href="https://www.linkedin.com/company/product-manager-accelerator"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            PM Accelerator
          </a>{" "}
          Technical Assessment — Full Stack
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-gray-500 dark:text-gray-400">
          Product Manager Accelerator is the world&apos;s first AI-powered product
          management career accelerator. We help aspiring and experienced PMs land
          top product roles through structured mentorship, real-world projects, and
          a global community of product leaders.
        </p>
      </div>
    </footer>
  );
}
