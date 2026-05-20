export default function PMAcceleratorBanner() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white/5 py-6">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="text-sm font-medium text-slate-300">
          Built by{" "}
          <span className="font-semibold text-sky-400">Yoseph Tesfaye</span>
          {" "}·{" "}
          <a
            href="https://www.linkedin.com/company/product-manager-accelerator"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-400 hover:underline"
          >
            PM Accelerator
          </a>{" "}
          Technical Assessment — Full Stack
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-500">
          Product Manager Accelerator is the world&apos;s first AI-powered product
          management career accelerator. We help aspiring and experienced PMs land
          top product roles through structured mentorship, real-world projects, and
          a global community of product leaders.
        </p>
      </div>
    </footer>
  );
}
