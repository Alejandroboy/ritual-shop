import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false,
  ignoreTLS: true,
  tls: { rejectUnauthorized: false },
});

await t.verify();
const info = await t.sendMail({
  from: 'test@local',
  to: 'you@example.com',
  subject: 'SMTP Smoke',
  text: 'Just a smoke test.',
});
console.log('OK', info.messageId);
