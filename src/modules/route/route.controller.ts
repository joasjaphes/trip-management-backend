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
import { RouteService } from './route.service';
import { CreateRouteDTO, RouteModel } from './route.dto';

@Controller('routes')
export class RouteController {
  constructor(private routeService: RouteService) {}

  @Get()
  async getAllRoutes(): Promise<RouteModel[]> {
    return this.routeService.getAllRoutes();
  }

  @Get('/:id')
  async getRouteById(@Param('id') id: string): Promise<RouteModel> {
    return this.routeService.getRouteById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createRoute(@Body() data: CreateRouteDTO): Promise<RouteModel> {
    return this.routeService.createRoute(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateRoute(@Body() data: CreateRouteDTO): Promise<RouteModel> {
    return this.routeService.updateRoute(data);
  }
}
