import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoiceNo, clientEmail, clientName, invoice, pdfBase64 } = req.body;

    if (!clientEmail || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'aditya@sripadastudios.in';
    const ccEmails = new Set([adminEmail]);

    if (invoice.ccEmail1) ccEmails.add(invoice.ccEmail1);
    if (invoice.ccEmail2) ccEmails.add(invoice.ccEmail2);
    if (invoice.ccEmails && Array.isArray(invoice.ccEmails)) {
      invoice.ccEmails.forEach(e => { if (e && e.trim()) ccEmails.add(e.trim()); });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const emailResponse = await resend.emails.send({
      from: 'Sripada Studios <contact@sripadastudios.in>',
      to: [clientEmail],
      cc: Array.from(ccEmails),
      subject: `Invoice ${invoiceNo} from Sripada Studios`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#327d7d;">Your Invoice from Sripada Studios</h2>
          <p>Hi <strong>${clientName}</strong>,</p>
          <p>Please find your invoice <strong>#${invoiceNo}</strong> attached.</p>
          <p>Total Amount: <strong>INR ${invoice.amount?.toLocaleString('en-IN') ?? ''}</strong></p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <br>
          <p>Best regards,<br>The Sripada Studios Team</p>
        </div>
      `,
      attachments: [
        { filename: `Invoice_${invoiceNo}.pdf`, content: pdfBuffer },
      ],
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return res.status(500).json({ error: 'Failed to send invoice', details: emailResponse.error });
    }

    return res.status(200).json({ success: true, message: 'Invoice sent successfully', id: emailResponse.data?.id });
  } catch (error) {
    console.error('send-invoice error:', error);
    return res.status(500).json({ error: 'Internal server error while sending invoice' });
  }
}
