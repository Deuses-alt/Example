import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { query } from 'express';
import {
  FormFindAllRequest,
  FormFindRequest,
} from './requests/form.find.request';
import {
  GetFormByIdResponse,
  GetPhoneResponse,
  GetTelegramResponse,
  GetWhatsAppResponse,
} from './responses/form.find.response';
import { Public } from 'src/auth/utils/auth.guard.metadata';
import { Cron } from '@nestjs/schedule';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Public()
  @Post(':id/telegram')
  async getTelegram(@Param('id') id: string): Promise<GetTelegramResponse> {
    return await this.formService.getTelegram(id);
  }

  @Public()
  @Post(':id/phoneNumber')
  async getPhoneNumber(@Param('id') id: string): Promise<GetPhoneResponse> {
    return await this.formService.getPhone(id);
  }

  @Public()
  @Post(':id/whatsapp')
  async getWhatsApp(@Param('id') id: string): Promise<GetWhatsAppResponse> {
    return await this.formService.getWhatsApp(id);
  }

  @Public()
  @Get(':id')
  async getForm(@Param('id') id: string, @Req() request: any): Promise<GetFormByIdResponse> {
    return await this.formService.findOne(id, request?.userId, request.ip);
  }
 
  @Delete(':id')
  async softDeleteForm(@Param('id') id: string): Promise<void> {
    await this.formService.softDelete(id);
  }

  // @Public()
  @Get()
  async findAll(
    @Query() query: FormFindAllRequest,
    @Req() request: any
  ): Promise<any> {
    return await this.formService.findAll(request?.userId, query);
  }

  @Cron('*/5 * * * *')
  async handleCron() {
    this.formService.lease();
  }
}
