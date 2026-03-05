import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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
    console.log('[MAIL] ethereal smtp', test.smtp);
    console.log('[MAIL] ethereal ready', test.user);
    return t;
  }

  if (mode === 'json') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const host = process.env.SMTP_HOST || '127.0.0.1';
  const port = Number(process.env.SMTP_PORT || 1025);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const requireTLS =
    String(process.env.SMTP_REQUIRE_TLS).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    requireTLS: requireTLS || false,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    logger: true,
    debug: true,
  };

  const transporter = nodemailer.createTransport(options);

  try {
    await transporter.verify();
    console.log('[MAIL] smtp ready', { host, port, secure, auth: !!user });
  } catch (e) {
    console.error('[MAIL] smtp verify FAILED', e);
  }

  return transporter;
}
