export interface IUser {
  name: string;
  email: string;
  password: string;
  lineToken: {
    accessToken: string;
    secretToken: string;
  } | null;
}
