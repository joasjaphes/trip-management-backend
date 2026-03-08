import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  Request,
  UseGuards,
  UseInterceptors,
  Put,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import * as userDto from './user.dto';
import type { CredentialDTO } from './credentials.dto';
import { AuthGuard } from '../../guards/auth.guard';
import {
  isPasswordValid,
  passwordRegexFailedMessage,
} from '../../shared/constants';
import type { Response } from 'express';
import { CurrentUserInterceptor } from '../../interceptors/current-user.interceptor';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(CurrentUserInterceptor)
  @Get()
  async getUsers(@Request() req: any): Promise<userDto.UserModel[]> {
    return await this.userService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(CurrentUserInterceptor)
  @Get('/me')
  me(@Request() req: any): userDto.UserModel {
    const user: User = req.currentUser;
    return this.userService.getMe(user);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<userDto.UserModel | null> {
    return await this.userService.getUserById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(@Body() user: userDto.CreateUserDTO) {
    if (!isPasswordValid(user.password ?? '')) {
      throw new BadRequestException({
        message: `Invalid password format, ${passwordRegexFailedMessage}`,
      });
    }
    const newUser = await this.userService.createUser(user);
    return newUser.toDTO();
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Put()
  async updateUser(@Body() user: userDto.CreateUserDTO): Promise<userDto.UserModel> {
    return await this.userService.updateUser(user);
  }

  // @Post('/resetPassword')
  // @UsePipes(new ValidationPipe())
  // async resetPassword(@Body() data: userDto.ResetPasswordDTO, @Res() res: Response) {
  //   if (!isPasswordValid(data.password ?? '')) {
  //     throw new BadRequestException({
  //       message: `Invalid password format, ${passwordRegexFailedMessage}`,
  //     });
  //   }
  //   await this.userService.resetPassword(data);
  //   res.status(200).send({ message: 'Password reset successfully' });
  // }

  @UseGuards(AuthGuard)
  @UseInterceptors(CurrentUserInterceptor)
  @UsePipes(new ValidationPipe())
  @Post('/changePassword')
  async changePassword(
    @Body() data: userDto.ChangePasswordDTO,
    @Request() req: any,
    @Res() res: Response,
  ) {
    if (!isPasswordValid(data.newPassword ?? '')) {
      throw new BadRequestException({
        message: `Invalid password format, ${passwordRegexFailedMessage}`,
      });
    }
    await this.userService.changePassword(data, req.currentUser);
    res.status(200).send({ message: 'Password changed successfully' });
  }

  @Post('/signin')
  async login(@Body() credentials: CredentialDTO) {
    return await this.userService.login(credentials);
  }
}
