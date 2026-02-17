// In-memory store for development (resets on server restart)
const sentEmails = new Map();

const sendEmail = async ({ to, subject, text, html }) => {
    const emailId = Date.now().toString();
    const emailData = {
        id: emailId,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
        date: new Date()
    };

    sentEmails.set(emailId, emailData);

    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
    console.log(`[Mock Email] Preview: http://localhost:3000/dev/email/${emailId}`);

    return {
        messageId: emailId,
        previewUrl: `http://localhost:3000/dev/email/${emailId}` // Local URL
    };
};

const getEmail = (id) => sentEmails.get(id);

module.exports = { sendEmail, getEmail };
