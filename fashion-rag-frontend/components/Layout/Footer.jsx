export function Footer({ isDark }) {
  return (
    <footer
      className={`mt-10 border-t pt-4 text-xs ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}
    >
      Built for demo · Fashion Retrieval + RAG · Backend: FastAPI · Frontend: Next.js + Tailwind
    </footer>
  );
}
