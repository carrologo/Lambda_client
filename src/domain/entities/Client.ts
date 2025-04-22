export class Client {
  constructor(
    public name: string,
    public lastName: string,
    public email: string,
    public identification: string,
    public birthdate: Date,
    public contact: string,
    public comment: string,
    public isActive: boolean = true,
    public id?: string,
  ) {}
}
