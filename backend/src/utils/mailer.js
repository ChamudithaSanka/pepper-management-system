import nodemailer from 'nodemailer';

let cachedTransporter = null;

export function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP configuration is missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    }

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return cachedTransporter;
}

export async function sendMail({ to, subject, html, text }) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const transporter = getTransporter();
    return transporter.sendMail({ from, to, subject, html, text });
}


