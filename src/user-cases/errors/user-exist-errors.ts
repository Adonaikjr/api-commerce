export class UserErrors extends Error {
  constructor() {
    super('Email já cadastrado!')
  }
}
