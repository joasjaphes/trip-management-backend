import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  greet: string = '';
  constructor(private readonly appService: AppService) {
    this.greet = 'Hello';
  }

  @Get()
  getHello(): string {
    this.greet = this.appService.getHello();
    return this.greet;
  }
}
