import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { UserModel } from './user.dto';
import { BaseAppEntity } from '../../shared/base-app-entity';

@Entity('users')
export class User extends BaseAppEntity<UserModel> {
  @Column({ nullable: false, length: 50 })
  firstName: string;
  @Column({ nullable: false, length: 50 })
  surname: string;
  @Column({ nullable: true, length: 50 })
  email: string;
  @Column({ nullable: true, length: 50, unique: true })
  phoneNumber: string;
  @Column({ nullable: false, length: 50 })
  username: string;
  @Column({ nullable: false })
  password: string;
  @Column({ nullable: false })
  salt: string;

  async validatePassword(password: string) {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  toDTO(options?: { eager: boolean }): UserModel {
    const { eager = false } = options ?? {};

    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      firstName: this.firstName,
      surname: this.surname,
      email: this.email,
      phoneNumber: this.phoneNumber,
      username: this.username,
    };
  }
}
