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
  UserModel,
} from './user.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CredentialDTO } from './credentials.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private transactionManager: EntityManager,
  ) {}

  async createUser(userObject: CreateUserDTO): Promise<User> {
    // console.log({ userObject });
    try {
      if (!userObject.password) {
        throw new BadRequestException('Password is required');
      }
      const userPayload: User = await this.getUserPayloadFromDTO(userObject);
      const oldUser = await this.repository.findOne({
        where: { phoneNumber: userPayload.phoneNumber },
      });
      if (oldUser) {
        Logger.warn('User already exists: ' + JSON.stringify(oldUser));
        throw new ConflictException(
          `User with this phone number [${userPayload.phoneNumber}] already exists`,
        );
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

  async updateUser(userObject: CreateUserDTO): Promise<UserModel> {
    try {
      const existingUser = await this.repository.findOne({
        where: { uid: userObject.id },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `User with ID ${userObject.id} does not exist`,
        );
      }

      existingUser.firstName = userObject.firstName || existingUser.firstName;
      existingUser.surname = userObject.surname || existingUser.surname;
      existingUser.email = userObject.email || existingUser.email;

      const updatedUser = await this.repository.save(existingUser);
      return updatedUser.toDTO();
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
      const users: User[] = await this.repository.find();
      return users.map((user) => this.getUserDTOFromUSer(user));
    } catch (e) {
      console.error('Failed to get users', e);
      Logger.error('Failed to get users', e);
      throw e;
    }
  }

  getMe(user: User): UserModel {
    try {
      return this.getUserDTOFromUSer(user, { eager: true });
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
        loadEagerRelations: false,
      });
      if (user) {
        const passWordValid = await user.validatePassword(password);
        if (passWordValid) {
          return this.getUserDTOFromUSer(user);
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
      return await this.authenticateUser(credentials);
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
      userPayload.uid = user.id;
      userPayload.firstName = user.firstName;
      userPayload.surname = user.surname;
      if (user.email) userPayload.email = user.email;
      userPayload.phoneNumber = user.phoneNumber;
      userPayload.username = user.phoneNumber;
      userPayload.password = hashedPassword.password;
      userPayload.salt = hashedPassword.salt;
      return userPayload;
    } catch (e) {
      console.error(e);
      Logger.error('Failed to get user payload from DTO', e);
      throw e;
    }
  }

  async getUserById(id: string): Promise<UserModel | null> {
    try {
      const user = await this.repository.findOne({
        where: { uid: id },
        // relations: { business: true },
        loadEagerRelations: false,
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user.toDTO();
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
        loadEagerRelations: false,
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
