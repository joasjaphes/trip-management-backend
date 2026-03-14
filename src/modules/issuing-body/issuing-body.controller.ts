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
import { IssuingBodyService } from './issuing-body.service';
import { CreateIssuingBodyDTO, IssuingBodyModel } from './issuing-body.dto';

@Controller('issuing-bodies')
export class IssuingBodyController {
  constructor(private issuingBodyService: IssuingBodyService) {}

  @Get()
  async getAllIssuingBodies(): Promise<IssuingBodyModel[]> {
    return this.issuingBodyService.getAllIssuingBodies();
  }

  @Get('/:id')
  async getIssuingBodyById(@Param('id') id: string): Promise<IssuingBodyModel> {
    return this.issuingBodyService.getIssuingBodyById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createIssuingBody(
    @Body() data: CreateIssuingBodyDTO,
  ): Promise<IssuingBodyModel> {
    return this.issuingBodyService.createIssuingBody(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateIssuingBody(
    @Body() data: CreateIssuingBodyDTO,
  ): Promise<IssuingBodyModel> {
    return this.issuingBodyService.updateIssuingBody(data);
  }
}
