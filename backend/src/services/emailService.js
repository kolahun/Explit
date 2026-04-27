const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD
    }
  });
}

async function sendExpenseCreatedEmail({ recipients, groupName, payerName, amount }) {
  const transporter = createTransporter();
  if (!transporter || recipients.length === 0) return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_EMAIL,
    to: recipients.join(","),
    subject: `New expense in ${groupName}`,
    text: `${payerName} added a new expense of ${amount.toFixed(2)} in ${groupName}. Open Expense Splitter to review your updated balances.`
  });
}

module.exports = { sendExpenseCreatedEmail };
