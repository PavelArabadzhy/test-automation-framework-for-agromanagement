import { AuthClient } from "../clients/AuthClient";

export class AuthService {
  constructor(private readonly authClient: AuthClient) {}

  async authenticate(username: string, password: string): Promise<void> {
    await this.authClient.loginWithFormSession({ username, password });
  }
}
