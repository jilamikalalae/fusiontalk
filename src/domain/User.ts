export interface IUser {
  name: string;
  email: string;
  password: string;
  lineToken: {
    accessTokenIv: string;
    accessToken: string;
    secretTokenIv: string;
    secretToken: string;
    userId: string;
  } | null;
  messengerToken: {
    accessTokenIv: string;
    accessToken: string;
  } | null;
}
