import { Column, Entity, ManyToMany, JoinTable, VirtualColumn } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { UserModel } from './user.dto';
import { Role } from '../role/role.entity';
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

  @ManyToMany(() => Role, { eager: false })
  @JoinTable({ name: 'user_roles' })
  roles?: Role[];

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
      roles: eager && this.roles ? this.roles.map((r) => r.uid) : undefined,
      roleName: this.roles ? this.roles.map((r) => r.name).join(' | ') : undefined,
      isActive: this.active,
    };
  }
}
