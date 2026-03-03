import nodemailer, { Transporter } from 'nodemailer';

type MailMode = 'smtp' | 'ethereal' | 'json';

export async function createTransport(): Promise<Transporter> {
  console.log(
    '[MAIL] mode=',
    process.env.MAIL_MODE,
    'host=',
    process.env.SMTP_HOST,
    'port=',
    process.env.SMTP_PORT,
  );
  const mode: MailMode = (process.env.MAIL_MODE as MailMode) || 'smtp';

  if (mode === 'ethereal') {
    const test = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[MAIL] ethereal smtp', test.smtp);
    console.log('[MAIL] ethereal ready', test.user);
    return t;
  }

  if (mode === 'json') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  try {
    await transporter.verify();
    console.log('[MAIL] smtp ready', { host, port, secure, auth: !!user });
  } catch (e) {
    console.error('[MAIL] smtp verify FAILED', e);
  }

  return transporter;
}
