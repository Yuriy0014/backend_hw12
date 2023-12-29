export type NotConfirmedAccountDBModel = {
  email: string;
  confirmationCode: string;
  expiryDate: Date;
  isConfirmed: boolean;
};
