import { Resend } from 'resend';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

/**
 * Generate a PDF Receipt as a Buffer
 */
export const generateReceiptPDF = (booking) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
        });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // Branding & Logo
        const logoPath = '/Users/ssmacmini04/Desktop/ssstudio/public/Untitled design.png';
        try {
            doc.image(logoPath, 50, 45, { width: 100 });
        } catch (e) {
            console.warn('PDF Logo not found at path:', logoPath);
            doc.fontSize(20).text('Nearby Studio', 50, 45);
        }

        doc.fontSize(22).text('BOOKING CONFIRMATION', 0, 50, { align: 'right' });
        doc.fontSize(10).text(`ID: ${booking.booking_id}`, 0, 80, { align: 'right' });
        doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 0, 95, { align: 'right' });

        doc.moveDown(4);

        // Divider
        doc.moveTo(50, 140).lineTo(545, 140).strokeColor('#00c2a8').stroke();
        doc.moveDown(2);

        // Main Layout: Two Columns
        const midPoint = 300;
        
        // Left Column: Client Info
        doc.fillColor('#000000').fontSize(12).text('CLIENT DETAILS', 50, 160, { underline: true });
        doc.fontSize(11).text('Name:', 50, 185).text(booking.client_name, 120, 185);
        doc.text('Email:', 50, 205).text(booking.client_email, 120, 205);
        doc.text('Phone:', 50, 225).text(booking.client_phone, 120, 225);
        
        if (booking.client_company) {
            doc.text('Company:', 50, 245).text(booking.client_company, 120, 245);
        }
        if (booking.client_gst) {
            doc.text('GST:', 50, 265).text(booking.client_gst, 120, 265);
        }

        // Right Column: Session Details
        doc.fontSize(12).text('SESSION DETAILS', midPoint, 160, { underline: true });
        doc.fontSize(11).text('Package:', midPoint, 185).text(booking.package_name, midPoint + 80, 185);
        
        if (booking.package_description) {
            doc.fontSize(10).fillColor('#666').text(booking.package_description, midPoint, 205, { width: 245 });
            doc.fillColor('#000').fontSize(11).text('Date:', midPoint, 245).text(new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), midPoint + 80, 245);
            doc.text('Time:', midPoint, 265).text(`${booking.start_time} - ${booking.end_time}`, midPoint + 80, 265);
        } else {
            doc.text('Date:', midPoint, 205).text(new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), midPoint + 80, 205);
            doc.text('Time:', midPoint, 225).text(`${booking.start_time} - ${booking.end_time}`, midPoint + 80, 225);
        }

        doc.moveDown(5);

        // Table Header for Payment
        doc.fontSize(12).text('PAYMENT SUMMARY', 50, 310, { underline: true });
        doc.fontSize(11).text('Status:', 50, 335).fillColor('#00c2a8').text('PAID (CONFIRMED)', 120, 335).fillColor('#000');
        doc.text('Transaction ID:', 50, 355).text(booking.razorpay_payment_id || 'N/A', 150, 355);
        doc.fontSize(14).text('Total Paid:', 350, 335).fontSize(14).text(`INR ${booking.amount.toLocaleString('en-IN')}`, 450, 335);

        doc.moveDown(3);

        // Notes Section
        if (booking.client_notes) {
            doc.moveTo(50, 400).lineTo(545, 400).strokeColor('#eeeeee').stroke();
            doc.moveDown(1);
            doc.fontSize(11).fillColor('#444').text('ADDITIONAL NOTES / REQUIREMENTS:', 50, 420);
            doc.fontSize(10).fillColor('#666').text(booking.client_notes, 50, 440, { width: 495 });
        }

        // Footer
        doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#eeeeee').stroke();
        doc.fontSize(9).fillColor('gray').text('Nearby Studio PVT. LTD. | www.nearbystudio.in | Rajajinagar, Bengaluru', 50, 765, { align: 'center' });
        doc.text('This is an electronically generated confirmation of your studio booking.', 50, 780, { align: 'center' });

        doc.end();
    });
};

/**
 * Send Confirmation Email
 */
export const sendConfirmationEmail = async (booking) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('Resend API key missing. Email not sent.');
            return false;
        }

        const pdfBuffer = await generateReceiptPDF(booking);

        const emailResponse = await resend.emails.send({
            from: 'Nearby Studio <contact@nearbystudio.in>',
            reply_to: 'nearbystudiosocial@gmail.com',
            to: [booking.client_email],
            cc: ['nearbystudiosocial@gmail.com'],
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

                    <p>If you have any questions or need to reschedule, please contact us at help@nearby-studio.in.</p>
                    <br>
                    <p>Thank you so much!</p>
                    <p>Please find your digital receipt attached to this email.</p>
                    <p>Also, check out a quick glimpse of our space in the attached video!</p>
                    <p>See you at the studio!</p>
                    <p>Best Regards,<br><strong>The Nearby Studio Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `Receipt_${booking.booking_id}.pdf`,
                    content: pdfBuffer
                },
                {
                    filename: 'nearby_studio_trailer.webm',
                    path: '/Users/ssmacmini04/Desktop/ssstudio/public/nearby alpha logo.webm'
                }
            ]
        });

        console.log('Confirmation email sent via Resend:', emailResponse);
        return true;
    } catch (error) {
        console.error('Error sending confirmation email via Resend:', error);
        return false;
    }
};

/**
 * Send Admin Notification
 */
export const sendAdminNotification = async (booking) => {
    try {
        if (!process.env.RESEND_API_KEY) return false;

        const emailResponse = await resend.emails.send({
            from: 'Nearby Studio Alerts <contact@nearbystudio.in>',
            reply_to: 'nearbystudiosocial@gmail.com',
            to: [process.env.ADMIN_EMAIL || 'nearbystudiosocial@gmail.com'],
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
        });

        console.log('Admin alert sent via Resend:', emailResponse);
        return true;
    } catch (error) {
        console.error('Admin alert failed via Resend:', error);
        return false;
    }
};
