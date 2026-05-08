const LanguageSelector = ({ language, setLanguage }) => {
  return (
    <select
      className="lang-select"   // 👈 ADD HERE
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      <option value="cpp">C++</option>
      <option value="c">C</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
    </select>
  );
};

export default LanguageSelector;