import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  healthCheck(){
    return {
      status:'Kings of Lucis! Come to me!'
    }
  }
}
