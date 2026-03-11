import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreatePermitRegistrationDTO,
  PermitRegistrationModel,
} from './permit-registration.dto';
import { PermitRegistrationService } from './permit-registration.service';

@Controller('permit-registrations')
export class PermitRegistrationController {
  constructor(private permitRegistrationService: PermitRegistrationService) {}

  @Get()
  async getAllPermitRegistrations(): Promise<PermitRegistrationModel[]> {
    return this.permitRegistrationService.getAllPermitRegistrations();
  }

  @Get('/:id')
  async getPermitRegistrationById(
    @Param('id') id: string,
  ): Promise<PermitRegistrationModel> {
    return this.permitRegistrationService.getPermitRegistrationById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createPermitRegistration(
    @Body() data: CreatePermitRegistrationDTO,
  ): Promise<PermitRegistrationModel> {
    return this.permitRegistrationService.createPermitRegistration(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updatePermitRegistration(
    @Body() data: CreatePermitRegistrationDTO,
  ): Promise<PermitRegistrationModel> {
    return this.permitRegistrationService.updatePermitRegistration(data);
  }
}
