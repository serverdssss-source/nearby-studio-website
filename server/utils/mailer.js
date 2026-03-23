import { Resend } from 'resend';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generate a PDF Receipt as a Buffer
 */
export const generateReceiptPDF = (booking) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(20).text('Nearby Studio - Booking Receipt', { align: 'center' });
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

        doc.fontSize(10).text('Thank you for choosing Nearby Studio!', { align: 'center' });
        doc.end();
    });
};

/**
 * Send Confirmation Email to Client
 */
export const sendConfirmationEmail = async (booking) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY missing. Email not sent.');
            return false;
        }

        const resend = new Resend(apiKey);
        const fromEmail = process.env.FROM_EMAIL || 'bookings@nearbystudio.in';
        const pdfBuffer = await generateReceiptPDF(booking);

        const { error } = await resend.emails.send({
            from: fromEmail,
            to: booking.client_email,
            subject: `Confirmed: Your Studio Booking - ${booking.booking_id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #00c2a8; text-align: center;">Booking Confirmed!</h2>
                    <p>Hi <strong>${booking.client_name}</strong>,</p>
                    <p>Your booking at <strong>Nearby Studio</strong> has been confirmed. Payment of <strong>INR ${booking.amount.toLocaleString()}</strong> received.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Session Details</h3>
                        <p><strong>Package:</strong> ${booking.package_name}</p>
                        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
                        <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                    </div>
                    <p>Your receipt is attached to this email.</p>
                    <p>Questions? Contact us at help@nearby-studio.in</p>
                    <br>
                    <p>See you at the studio!<br><strong>The Nearby Studio Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `Receipt_${booking.booking_id}.pdf`,
                    content: pdfBuffer,
                }
            ]
        });

        if (error) {
            console.error('Resend error (client):', error);
            return false;
        }

        console.log(`Confirmation email sent to ${booking.client_email}`);
        return true;
    } catch (err) {
        console.error('Error sending confirmation email:', err);
        return false;
    }
};

/**
 * Send Admin Notification
 */
export const sendAdminNotification = async (booking) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return false;

        const resend = new Resend(apiKey);
        const fromEmail = process.env.FROM_EMAIL || 'bookings@nearbystudio.in';
        const adminEmail = process.env.ADMIN_EMAIL || 'aditya@sripadastudios.in';

        const { error } = await resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `New Booking: ${booking.booking_id}`,
            html: `
                <h3>New Studio Booking Received</h3>
                <p><strong>Client:</strong> ${booking.client_name} (${booking.client_email})</p>
                <p><strong>Phone:</strong> ${booking.client_phone}</p>
                <p><strong>Package:</strong> ${booking.package_name}</p>
                <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()} | ${booking.start_time} - ${booking.end_time}</p>
                <p><strong>Amount:</strong> INR ${booking.amount.toLocaleString()}</p>
                <p><strong>Notes:</strong> ${booking.client_notes || 'None'}</p>
            `
        });

        if (error) {
            console.error('Resend error (admin):', error);
            return false;
        }

        console.log('Admin notification sent');
        return true;
    } catch (err) {
        console.error('Admin alert failed:', err);
        return false;
    }
};
