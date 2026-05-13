import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDTO,
  CreateUserDTO,
  ResetPasswordDTO,
  UpdateUserDTO,
  UserModel,
} from './user.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { CredentialDTO } from './credentials.dto';
import { Role } from '../role/role.entity';
import { makeId } from '../../shared/constants';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private transactionManager: EntityManager,
  ) { }

  async createUser(userObject: CreateUserDTO): Promise<User> {
    // console.log({ userObject });
    try {
      if (!userObject.password) {
        throw new BadRequestException('Password is required');
      }
      const userPayload: User = await this.getUserPayloadFromDTO(userObject);
      const oldUser = await this.repository.findOne({
        where: { uid: userPayload.uid },
      });
      if (oldUser) {
        Logger.warn('User already exists: ' + JSON.stringify(oldUser));
        throw new ConflictException(
          `User with this ID [${userPayload.uid}] already exists`,
        );
      }

      // Assign roles if provided
      if (userObject.roles && userObject.roles.length > 0) {
        const roles = await this.roleRepository.find({
          where: userObject.roles.map((roleId) => ({ uid: roleId })),
        });

        if (roles.length !== userObject.roles.length) {
          const foundRoleIds = roles.map((r) => r.uid);
          const notFoundRoles = userObject.roles.filter(
            (roleId) => !foundRoleIds.includes(roleId),
          );
          throw new BadRequestException(
            `The following role(s) do not exist: ${notFoundRoles.join(', ')}`,
          );
        }

        userPayload.roles = roles;
      }

      const createdUser: User = await this.repository.save(userPayload);
      // Logger.log('User Created: ' + JSON.stringify(createdUser));
      // return this.getUserDTOFromUSer(createdUser);
      return createdUser;
    } catch (e) {
      console.error(e);
      Logger.error('Failed to create user', e);
      throw e;
    }
  }

  async updateUser(userObject: UpdateUserDTO): Promise<UserModel> {
    try {
      const existingUser = await this.repository.findOne({
        where: { uid: userObject.id },
        relations: ['roles'],
      });

      if (!existingUser) {
        throw new NotFoundException(
          `User with ID ${userObject.id} does not exist`,
        );
      }

      existingUser.firstName = userObject.firstName || existingUser.firstName;
      existingUser.surname = userObject.surname || existingUser.surname;
      existingUser.email = userObject.email || existingUser.email;

      // Update roles if provided
      if (userObject.roles && userObject.roles.length > 0) {
        const roles = await this.roleRepository.find({
          where: userObject.roles.map((roleId) => ({ uid: roleId })),
        });

        if (roles.length !== userObject.roles.length) {
          const foundRoleIds = roles.map((r) => r.uid);
          const notFoundRoles = userObject.roles.filter(
            (roleId) => !foundRoleIds.includes(roleId),
          );
          throw new BadRequestException(
            `The following role(s) do not exist: ${notFoundRoles.join(', ')}`,
          );
        }

        existingUser.roles = roles;
      } else if (userObject.roles !== undefined) {
        // If roles is explicitly set to empty array, clear all roles
        existingUser.roles = [];
      }

      const updatedUser = await this.repository.save(existingUser);
      return updatedUser.toDTO({ eager: true });
    } catch (e) {
      console.error(e);
      Logger.error('Failed to update user', e);
      throw e;
    }
  }

  // async resetPassword(data: ResetPasswordDTO) {
  //   try {
  //     await this.transactionManager.transaction(async (txManager) => {
  //       const { referenceNumber, password, otp } = data;
  //       // const phoneNumberToCheck = formatUserPhoneNumber(data.phoneNumber);
  //       const otpRecord = await txManager.findOne(OTPVerification, {
  //         where: {
  //           uid: referenceNumber,
  //         },
  //       });
  //       if (!otpRecord) {
  //         throw new BadRequestException(
  //           // 'Invalid OTP or phone number provided or OTP already used',
  //           `Either OTP is invalid, phone number is incorrect, reference number is invalid or OTP already used`,
  //         );
  //       }

  //       if (otpRecord.purpose !== OtpPurposeType.resetPassword) {
  //         throw new BadRequestException('This OTP is not for password reset');
  //       }

  //       if (!otpRecord.isUsed) {
  //         throw new BadRequestException('This OTP is not verified yet');
  //       }

  //       if (otpRecord.otp !== otp) {
  //         throw new BadRequestException('Invalid OTP provided');
  //       }
  //       const phoneNumberToCheck = otpRecord.phoneNumber;
  //       const user = await txManager.findOne(User, {
  //         where: { phoneNumber: phoneNumberToCheck },
  //       });
  //       if (!user) {
  //         throw new BadRequestException(
  //           `User with phone number ${phoneNumberToCheck} does not exist`,
  //         );
  //       }
  //       const hashedPassword = await this.getHashedPassword(password);
  //       user.password = hashedPassword.password;
  //       user.salt = hashedPassword.salt;
  //       await txManager.save(user);

  //       otpRecord.attempts += 1;
  //       otpRecord.isUsed = true;
  //       await txManager.save(otpRecord);
  //     });
  //   } catch (e) {
  //     console.error(e);
  //     Logger.error('Failed to restore password', e);
  //     throw e;
  //   }
  // }
  async changePassword(data: ChangePasswordDTO, user: User) {
    try {
      const { currentPassword, newPassword } = data;
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      if (currentPassword === newPassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }
      const passwordIsValid = await user.validatePassword(currentPassword);
      if (!passwordIsValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      const hashedPassword = await this.getHashedPassword(newPassword);
      user.password = hashedPassword.password;
      user.salt = hashedPassword.salt;
      await this.repository.save(user);
    } catch (e) {
      console.error(e);
      Logger.error('Failed to restore password', e);
      throw e;
    }
  }

  async getAllUsers(): Promise<UserModel[]> {
    try {
      const users: User[] = await this.repository.find({
        relations: ['roles', 'roles.permissions'],
        where: { uid: Not('ADMINUSER') }
      });
      return users.map((user) => this.getUserDTOFromUSer(user, { eager: true }));
    } catch (e) {
      console.error('Failed to get users', e);
      Logger.error('Failed to get users', e);
      throw e;
    }
  }

  getMe(user: User): UserModel {
    try {
      const userModel = this.getUserDTOFromUSer(user, { eager: true });
      const userPermissions: string[] = [];
      if (user.roles) {
        for (const role of user.roles) {
          if (role.permissions) {
            for (const perm of role.permissions) {
              if (!userPermissions.includes(perm.key)) {
                userPermissions.push(perm.key);
              }
            }
          }
        }
      }
      delete userModel.roles;
      userModel.permissions = userPermissions;
      return userModel;
    } catch (e) {
      console.error('Failed to get users', e);
      Logger.error('Failed to get users', e);
      throw e;
    }
  }

  async authenticateUser(credentials: { username: string; password: string }) {
    try {
      const { username, password } = credentials;
      const user = await this.repository.findOne({
        where: { username },
        relations: ['roles', 'roles.permissions'],
      });
      if (user) {
        const passWordValid = await user.validatePassword(password);
        if (passWordValid) {
          const permissions: string[] = [];
          if (user.roles) {
            for (const role of user.roles) {
              if (role.permissions) {
                for (const perm of role.permissions) {
                  if (!permissions.includes(perm.key)) {
                    permissions.push(perm.key);
                  }
                }
              }
            }
          }
          const userModel = this.getUserDTOFromUSer(user);
          if (!permissions.length) {
            permissions.push('ALL');
          }
          userModel.permissions = permissions;
          // delete userModel.roles;
          return userModel;
        } else {
          console.log('Wrong username or password provided');
          throw new UnauthorizedException(
            'Wrong username or password provided',
          );
        }
      } else {
        console.log('User does not exist');
        throw new UnauthorizedException('Wrong username or password provided');
        // throw new UnauthorizedException('User does not exist');
      }
    } catch (e) {
      console.error('Failed to get user', e);
      throw e;
    }
  }

  async login(credentials: CredentialDTO): Promise<UserModel> {
    try {
      const user = await this.authenticateUser(credentials);
      return user;
    } catch (e) {
      Logger.error('Failed to login', e);
      throw e;
    }
  }

  async getHashedPassword(
    password: string,
  ): Promise<{ password: string; salt: string }> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      return { password: hashedPassword, salt: salt };
    } catch (e) {
      console.error(e);
      Logger.error('Failed to hash password', e);
      throw e;
    }
  }

  async getUserPayloadFromDTO(user: CreateUserDTO): Promise<User> {
    try {
      const hashedPassword = await this.getHashedPassword(user.password ?? '');
      const userPayload: User = this.repository.create();
      userPayload.uid = user.id || makeId();
      userPayload.firstName = user.firstName;
      userPayload.surname = user.surname;
      if (user.email) userPayload.email = user.email;
      userPayload.phoneNumber = user.phoneNumber;
      userPayload.username = user.username;
      userPayload.password = hashedPassword.password;
      userPayload.salt = hashedPassword.salt;
      userPayload.active = user.isActive ?? true;
      return userPayload;
    } catch (e) {
      console.error(e);
      Logger.error('Failed to get user payload from DTO', e);
      throw e;
    }
  }

  async getUserById(id: string, eager: boolean = false): Promise<UserModel | null> {
    try {
      const user = await this.repository.findOne({
        where: { uid: id },
        relations: eager ? ['roles', 'roles.permissions'] : [],
        loadEagerRelations: false,
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user.toDTO({ eager });
    } catch (e) {
      console.error(e);
      Logger.error('Failed to get user by username', e);
      throw e;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { username },
        relations: ['roles', 'roles.permissions'],
      });
    } catch (e) {
      console.error(e);
      Logger.error('Failed to get user by username', e);
      throw e;
    }
  }

  getUserDTOFromUSer(user: User, options?: { eager: boolean }): UserModel {
    return user.toDTO(options);
  }
}
