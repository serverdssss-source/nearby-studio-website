import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

// Configure the transporter with placeholders - user should ideally provide real SMTP details
// For now, we'll try to use environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Generate a PDF Receipt as a Buffer
 */
export const generateReceiptPDF = (booking) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // Header
        doc.fontSize(20).text('Nearby Studio - Booking Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Booking Reference: ${booking.booking_id}`, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Client Info
        doc.fontSize(14).text('Client Information', { underline: true });
        doc.fontSize(12).text(`Name: ${booking.client_name}`);
        doc.text(`Email: ${booking.client_email}`);
        doc.text(`Phone: ${booking.client_phone}`);
        if (booking.client_company) doc.text(`Company: ${booking.client_company}`);
        if (booking.client_gst) doc.text(`GST: ${booking.client_gst}`);
        doc.moveDown();

        // Booking Info
        doc.fontSize(14).text('Booking Details', { underline: true });
        doc.fontSize(12).text(`Package: ${booking.package_name}`);
        doc.text(`Shoot Date: ${new Date(booking.booking_date).toLocaleDateString()}`);
        doc.text(`Time: ${booking.start_time} - ${booking.end_time}`);
        doc.moveDown();

        // Payment Info
        doc.fontSize(14).text('Payment Information', { underline: true });
        doc.fontSize(12).text(`Total Amount: INR ${booking.amount.toLocaleString()}`);
        doc.text(`Status: Paid`);
        doc.text(`Transaction ID: ${booking.razorpay_payment_id}`);
        doc.moveDown();

        // Footer
        doc.fontSize(10).text('Thank you for choosing Nearby Studio!', { align: 'center', color: 'gray' });

        doc.end();
    });
};

/**
 * Send Confirmation Email
 */
export const sendConfirmationEmail = async (booking) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials missing. Email not sent.');
            return false;
        }

        const pdfBuffer = await generateReceiptPDF(booking);

        const mailOptions = {
            from: `"Nearby Studio" <${process.env.SMTP_USER}>`,
            to: booking.client_email,
            subject: `Confirmed: Your Studio Booking - ${booking.booking_id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #00c2a8; text-align: center;">Booking Confirmed!</h2>
                    <p>Hi <strong>${booking.client_name}</strong>,</p>
                    <p>Your booking at <strong>Nearby Studio</strong> has been successfully confirmed. We have received your payment of <strong>INR ${booking.amount.toLocaleString()}</strong>.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Session Details</h3>
                        <p><strong>Package:</strong> ${booking.package_name}</p>
                        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
                        <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                    </div>

                    <p>Please find your digital receipt attached to this email.</p>
                    <p>If you have any questions or need to reschedule, please contact us at help@nearby-studio.in.</p>
                    <br>
                    <p>See you at the studio!</p>
                    <p>Best Regards,<br><strong>The Nearby Studio Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `Receipt_${booking.booking_id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

/**
 * Send Admin Notification
 */
export const sendAdminNotification = async (booking) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return false;

        const mailOptions = {
            from: `"Nearby Studio Alerts" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || 'aditya@sripadastudios.in',
            subject: `New Booking Alert: ${booking.booking_id}`,
            html: `
                <h3>New Studio Booking Received</h3>
                <p><strong>Client:</strong> ${booking.client_name} (${booking.client_email})</p>
                <p><strong>Package:</strong> ${booking.package_name}</p>
                <p><strong>Time:</strong> ${new Date(booking.booking_date).toLocaleDateString()} | ${booking.start_time} - ${booking.end_time}</p>
                <p><strong>Amount:</strong> INR ${booking.amount.toLocaleString()}</p>
                <p><strong>Notes:</strong> ${booking.client_notes || 'None'}</p>
                <a href="http://localhost:5173/adminbs" style="display: inline-block; padding: 10px 20px; background: #00c2a8; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Admin alert failed:', error);
        return false;
    }
};
