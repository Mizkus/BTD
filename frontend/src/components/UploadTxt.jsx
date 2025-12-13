export default function UploadTxt({ onUpload }) {
  const handleChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="form">
      <label className="muted">Загрузить .txt (каждая строка = точка)</label>
      <input type="file" accept=".txt,text/plain" onChange={handleChange} />
    </div>
  );
}
