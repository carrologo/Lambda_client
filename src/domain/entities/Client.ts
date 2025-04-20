export class Client {
  constructor(
    public name: string,
    public email: string,
    public identification: string,
    public birthdate: Date,
    public contact: number,
    public id?: string
  ) {}
}
