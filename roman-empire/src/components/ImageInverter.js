import { useState } from 'react';
import axios from 'axios';

const INVERT_URL = 'http://127.0.0.1:8000/invert-image';

const ImageInverter = () => {
  const [preview, setPreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    axios
      .post(INVERT_URL, formData, { responseType: 'blob' })
      .then((res) => {
        const imageUrl = URL.createObjectURL(res.data);
        setResultUrl(imageUrl);
      })
      .catch((error) => console.error('Upload error:', error))
      .finally(() => setIsLoading(false));
  };

  return (
    <section className="image-inverter">
      <h2 className="subheading">Инвертирование изображения</h2>
      <p>Загрузите картинку, сервер вернёт версию с инвертированными цветами.</p>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <div className="image-inverter__preview">
        {preview && (
          <div>
            <h3>Исходное изображение</h3>
            <img src={preview} alt="Исходник" />
          </div>
        )}
        {isLoading && <p>Обработка...</p>}
        {resultUrl && (
          <div>
            <h3>Инвертированное изображение</h3>
            <img src={resultUrl} alt="Инвертированное" />
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageInverter;
