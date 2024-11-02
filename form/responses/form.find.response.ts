import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cities, Section } from 'src/types/enums';
import { Tag, Departure, DepartureType } from '../utils/enums';

export interface GetTelegramResponse {
  telegram: string;
}

export class GetWhatsAppResponse {
  @ApiProperty()
  whatsapp: number;
}

export class GetPhoneResponse {
  @ApiProperty()
  phone: number;
}

export class GetFormByIdResponse {
  @ApiPropertyOptional()
  fromAge: number;
  @ApiPropertyOptional()
  beforeAge: number;
  @ApiPropertyOptional()
  city: Cities;
  @ApiPropertyOptional({ enum: Section })
  section: Section;
  @ApiPropertyOptional({ enum: Tag, isArray: true })
  tags: Tag[];
  @ApiPropertyOptional({ enum: Departure })
  departure: Departure;
  @ApiPropertyOptional({ enum: DepartureType, isArray: true })
  departureType: DepartureType[];
  @ApiPropertyOptional()
  cost1hAppart: number;
  @ApiPropertyOptional()
  cost2hAppart: number;
  @ApiPropertyOptional()
  costNightAppart: number;
  @ApiPropertyOptional()
  cost1hArrive: number;
  @ApiPropertyOptional()
  cost2hArrive: number;
  @ApiPropertyOptional()
  costNightArrive: number;
}
