const formidable = require("formidable");
const { Resend } = require("resend");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://rupamnaskar2711-wq.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024, multiples: false });

  try {
    const [, files] = await form.parse(req);
    const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (!photo || !photo.filepath || !photo.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "An image is required" });
    }

    const fileContent = require("fs").readFileSync(photo.filepath).toString("base64");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.PHOTO_RECIPIENT_EMAIL,
      subject: "New birthday photo",
      text: "Someone agreed to send a photo from the birthday page.",
      attachments: [{ filename: photo.originalFilename || "birthday-photo", content: fileContent }]
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Photo upload failed", error);
    return res.status(500).json({ error: "Photo could not be sent" });
  }
};

