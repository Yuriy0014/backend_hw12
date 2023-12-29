export type RegistrationConfirmationCodeModel = {
  code: string;
};

export type RegistrationEmailResending = {
  email: string;
};

export type LoginInputModel = {
  loginOrEmail: string;
  password: string;
};

export type PasswordRecoveryInputModel = {
  email: string;
};

export type NewPasswordRecoveryInputModel = {
  newPassword: string;
  recoveryCode: string;
};
