export default interface IUser {
  id: string;
  name: string;
  email: string;
  referred_by?: string;
  is_developer: boolean;
  created_at: Date;
}
