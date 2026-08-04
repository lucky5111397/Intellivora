function AuthDivider({ text = "OR" }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs uppercase tracking-widest text-slate-500">
        {text}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

export default AuthDivider;