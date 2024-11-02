import { Preferences, Cities, Section } from 'src/types/enums';
import { Tag, Departure, DepartureType } from '../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class FormCreateRequest {
  @ApiProperty({ enum: Preferences, isArray: true })
  preference: Preferences[];
  @ApiProperty()
  phone: number;
  @ApiProperty()
  telegram: string;
  @ApiProperty()
  whatsapp: number;
  @ApiProperty()
  fromAge: number;
  @ApiProperty()
  beforeAge: number;
  @ApiProperty()
  city: Cities;
  @ApiProperty()
  section: Section;
  @ApiProperty()
  photos: string[];
  @ApiProperty()
  videos: string[];
  @ApiProperty()
  tags: Tag[];
  @ApiProperty({ enum: Departure })
  departure: Departure;
  @ApiProperty({ enum: DepartureType, isArray: true })
  departureType: DepartureType[];
  @ApiProperty()
  cost1hAppart: number;
  @ApiProperty()
  cost2hAppart: number;
  @ApiProperty()
  costNightAppart: number;
  @ApiProperty()
  cost1hArrive: number;
  @ApiProperty()
  cost2hArrive: number;
  @ApiProperty()
  costNightArrive: number;
  @ApiProperty()
  userId: string;
}
