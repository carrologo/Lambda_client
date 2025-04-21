export class Client {
  constructor(
    public name: string,
    public email: string,
    public identification: string,
    public birthdate: Date,
    public contact: number,
    public comment: string,
    public isActive: boolean = true,
    public id?: string,
  ) {}
}
