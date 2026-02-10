import { Injectable } from '@nestjs/common';

// In-memory user storage (replace with database in production)
interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

@Injectable()
export class UserService {
  private users: User[] = [];

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findOne(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((u) => u.username === username) || null;
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return (
      this.users.find((u) => u.email === email || u.username === username) ||
      null
    );
  }
}
