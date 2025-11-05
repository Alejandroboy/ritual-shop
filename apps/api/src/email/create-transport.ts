import nodemailer, { Transporter } from 'nodemailer';

type MailMode = 'smtp' | 'ethereal' | 'json';

export async function createTransport(): Promise<Transporter> {
  const mode: MailMode = (process.env.MAIL_MODE as MailMode) || 'smtp';

  if (mode === 'ethereal') {
    const test = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[MAIL] ethereal ready', test.user);
    return t;
  }

  if (mode === 'json') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  // SMTP (SendPulse)
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // 465 -> true; 587/2525 -> false
    auth: user && pass ? { user, pass } : undefined,
  });

  // Проверим соединение при старте
  try {
    await transporter.verify();
    console.log('[MAIL] smtp ready', { host, port, secure, auth: !!user });
  } catch (e) {
    console.error('[MAIL] smtp verify FAILED', e);
  }

  return transporter;
}
