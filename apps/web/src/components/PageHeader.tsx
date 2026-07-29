export default function PageHeader({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-brand-900 to-brand-500 shrink-0" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 pl-4.5 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

