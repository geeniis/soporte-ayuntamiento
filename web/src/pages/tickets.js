import { useState } from 'react';

export default function Tickets() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    if (imagen) formData.append('imagen', imagen);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        setMensaje('Ticket creado correctamente ✅');
        setTitulo('');
        setDescripcion('');
        setImagen(null);
      } else {
        setMensaje('Error al crear el ticket ❌');
      }
    } catch (err) {
      console.error(err);
      setMensaje('Error de conexión ❌');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Soporte Técnico - Nuevo Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Título:</label><br />
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Descripción:</label><br />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Imagen (opcional):</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Enviar Ticket</button>
      </form>
      {mensaje && <p style={{ marginTop: '20px' }}>{mensaje}</p>}
    </div>
  );
}
