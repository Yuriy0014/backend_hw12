export type NotRecoveredPasswordDBModel = {
  email: string;
  confirmationCode: string;
  expiryDate: Date;
};
