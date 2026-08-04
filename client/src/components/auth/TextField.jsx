import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  const isPhone = /^[0-9]/.test(value);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 h-14">
      {isPhone ? (
        <FaPhoneAlt className="text-slate-400" />
      ) : (
        <MdEmail className="text-slate-400" />
      )}

      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
      />
    </div>
  );
}

export default TextField;