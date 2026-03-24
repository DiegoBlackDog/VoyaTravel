const transporter = require('../config/email');

const esc = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── enviarConsulta ──
const enviarConsulta = async (req, res, next) => {
  try {
    const { nombre, email, celular, mensaje, paquete_titulo, adultos, ninos, infantes } = req.body;

    const html = `
      <h2>Nueva consulta desde el sitio web</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td><strong>Nombre:</strong></td><td>${esc(nombre)}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${esc(email)}</td></tr>
        <tr><td><strong>Celular:</strong></td><td>${esc(celular)}</td></tr>
        ${paquete_titulo ? `<tr><td><strong>Paquete:</strong></td><td>${esc(paquete_titulo)}</td></tr>` : ''}
        ${adultos ? `<tr><td><strong>Adultos:</strong></td><td>${esc(adultos)}</td></tr>` : ''}
        ${ninos ? `<tr><td><strong>Niños:</strong></td><td>${esc(ninos)}</td></tr>` : ''}
        ${infantes ? `<tr><td><strong>Infantes:</strong></td><td>${esc(infantes)}</td></tr>` : ''}
      </table>
      <h3>Mensaje:</h3>
      <p>${esc(mensaje)}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Consulta de ${esc(nombre)}${paquete_titulo ? ` - ${esc(paquete_titulo)}` : ''}`,
      html,
    });

    res.json({ mensaje: 'Consulta enviada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { enviarConsulta };
