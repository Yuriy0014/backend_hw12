import dotenv from 'dotenv';
import { NodemailerAdapter } from '../adapters';

dotenv.config();

const baseUrl = process.env.HOST_URL || 'http://localhost:3000';

export class EmailManager {
  constructor(protected nodeMailerAdapter: NodemailerAdapter) {}
  async sendRegistrationConfirmationMessage(
    email: string,
    confirmationCode: string
  ): Promise<boolean> {
    return this.nodeMailerAdapter.sendMessage({
      email,
      subject: 'Jedi Registration',
      message: `<h1>Hello there!</h1>
 <p>To finish your registration follow the link below:
     <a href='${baseUrl}/auth/registration-confirmation?code=${confirmationCode}'>complete registration</a>
 </p>`,
    });
  }

  async sendPasswordRecoveryMessage(
    email: string,
    confirmationCode: string
  ): Promise<boolean> {
    return this.nodeMailerAdapter.sendMessage({
      email,
      subject: 'Jedi Password recovery',
      message: `<h1>Hello there!</h1>
 <p>To finish password recovery please follow the link below:
     <a href='${baseUrl}/auth/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
 </p>`,
    });
  }
}
