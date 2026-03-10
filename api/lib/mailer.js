import { Resend } from 'resend';
import PDFDocument from 'pdfkit';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

/**
 * Generate a PDF Receipt as a Buffer
 */
export const generateReceiptPDF = (booking) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text('Sripada Studios - Booking Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Booking Reference: ${booking.booking_id}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(14).text('Client Information', { underline: true });
    doc.fontSize(12).text(`Name: ${booking.client_name}`);
    doc.text(`Email: ${booking.client_email}`);
    doc.text(`Phone: ${booking.client_phone}`);
    if (booking.client_company) doc.text(`Company: ${booking.client_company}`);
    if (booking.client_gst) doc.text(`GST: ${booking.client_gst}`);
    doc.moveDown();

    doc.fontSize(14).text('Booking Details', { underline: true });
    doc.fontSize(12).text(`Package: ${booking.package_name}`);
    doc.text(`Shoot Date: ${new Date(booking.booking_date).toLocaleDateString()}`);
    doc.text(`Time: ${booking.start_time} - ${booking.end_time}`);
    doc.moveDown();

    doc.fontSize(14).text('Payment Information', { underline: true });
    doc.fontSize(12).text(`Total Amount: INR ${booking.amount.toLocaleString()}`);
    doc.text(`Status: Paid`);
    doc.text(`Transaction ID: ${booking.razorpay_payment_id}`);
    doc.moveDown();

    doc.fontSize(10).text('Thank you for choosing Sripada Studios!', { align: 'center' });
    doc.end();
  });
};

/**
 * Send booking confirmation email with PDF receipt to client.
 */
export const sendConfirmationEmail = async (booking) => {
  try {
    if (!process.env.RESEND_API_KEY) return false;
    const pdfBuffer = await generateReceiptPDF(booking);

    await resend.emails.send({
      from: 'Sripada Studios <contact@sripadastudios.in>',
      to: [booking.client_email],
      subject: `Confirmed: Your Studio Booking - ${booking.booking_id}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;">
          <h2 style="color:#327d7d;text-align:center;">Booking Confirmed!</h2>
          <p>Hi <strong>${booking.client_name}</strong>,</p>
          <p>Your booking at <strong>Sripada Studios</strong> is confirmed. We received your payment of <strong>INR ${booking.amount.toLocaleString()}</strong>.</p>
          <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;">Session Details</h3>
            <p><strong>Package:</strong> ${booking.package_name}</p>
            <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
            <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
          </div>
          <p>Your digital receipt is attached.</p>
          <p>Best Regards,<br><strong>The Sripada Studios Team</strong></p>
        </div>
      `,
      attachments: [{ filename: `Receipt_${booking.booking_id}.pdf`, content: pdfBuffer }],
    });
    return true;
  } catch (err) {
    console.error('sendConfirmationEmail error:', err);
    return false;
  }
};

/**
 * Send admin notification for a new booking.
 */
export const sendAdminNotification = async (booking) => {
  try {
    if (!process.env.RESEND_API_KEY) return false;

    await resend.emails.send({
      from: 'Sripada Studios Alerts <contact@sripadastudios.in>',
      to: [process.env.ADMIN_EMAIL || 'aditya@sripadastudios.in'],
      subject: `New Booking Alert: ${booking.booking_id}`,
      html: `
        <h3>New Studio Booking Received</h3>
        <p><strong>Client:</strong> ${booking.client_name} (${booking.client_email})</p>
        <p><strong>Package:</strong> ${booking.package_name}</p>
        <p><strong>Time:</strong> ${new Date(booking.booking_date).toLocaleDateString()} | ${booking.start_time} - ${booking.end_time}</p>
        <p><strong>Amount:</strong> INR ${booking.amount.toLocaleString()}</p>
        <p><strong>Notes:</strong> ${booking.client_notes || 'None'}</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('sendAdminNotification error:', err);
    return false;
  }
};
