import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigurationService } from '../config/configuration.service';

export async function createTransport(
  config: ConfigurationService,
): Promise<Transporter> {
  const mode = config.get('MAIL_MODE');

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

  const host = config.get('SMTP_HOST');
  const port = config.get('SMTP_PORT') ?? 1025;
  const secure = config.get('SMTP_SECURE');
  const requireTLS = config.get('SMTP_REQUIRE_TLS');
  const user = config.get('SMTP_USER');
  const pass = config.get('SMTP_PASS');

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
