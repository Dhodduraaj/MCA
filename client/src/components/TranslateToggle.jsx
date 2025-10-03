import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  // 👉 extend as needed
];

function TranslateToggle() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("en");
  const dropdownRef = useRef(null);

  // Load Google Translate script once
  useEffect(() => {
    const initFunctionName = "googleTranslateElementInit";

    const initWidget = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        );
      }
    };

    if (!window[initFunctionName]) {
      window[initFunctionName] = initWidget;
    }

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=" + initFunctionName;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      initWidget();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Change language programmatically
  const changeLanguage = (lang) => {
    setSelected(lang);
    setOpen(false);

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  };

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative ml-3" ref={dropdownRef}>
      {/* Hidden Google Translate widget (for functionality only) */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition shadow-md flex items-center"
      >
        🌐
        <span className="ml-2 text-sm">
          {LANGUAGES.find((l) => l.code === selected)?.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white text-gray-800 rounded-lg shadow-xl p-3 z-50">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language..."
            className="w-full mb-2 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {/* Language list */}
          <div className="max-h-56 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-indigo-100 ${
                    selected === lang.code ? "bg-indigo-200 font-medium" : ""
                  }`}
                >
                  {lang.name}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 px-3 py-2">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TranslateToggle;
