import { Cities, Role, Section } from 'src/types/enums';
import { Tag, Departure, DepartureType, Sort } from '../utils/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Worker } from 'src/worker/entities/worker.entity';
import {
  Appearance,
  Nationality,
  BodyType,
  HairColor,
  IntimateHaircut,
  BodyArt,
} from 'src/worker/utils/enums';
import { FormStatus } from '../entities/form.entity';
import { User } from 'src/user/entities/user.entity';

export interface FormFindRequest {
  uuid: string;
}

class Range {
  @ApiPropertyOptional()
  min: number;

  @ApiPropertyOptional()
  max: number;
}

export class FormFindAllRequest {
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
  @ApiPropertyOptional({ enum: DepartureType })
  departureType: DepartureType[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  cost1hAppart: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  cost2hAppart: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  costNightAppart: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  cost1hArrive: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  cost2hArrive: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  costNightArrive: number[];

  // Worker
  @ApiPropertyOptional({ type: Number, isArray: true })
  age: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  height: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  weight: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  breast: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  shoeSize: number[];
  @ApiPropertyOptional({ type: Number, isArray: true })
  clothingSize: number[];
  @ApiPropertyOptional({ enum: Appearance })
  appearance: Appearance;
  @ApiPropertyOptional({ enum: Nationality })
  nationality: Nationality;
  @ApiPropertyOptional({ enum: BodyType })
  bodyType: BodyType;
  @ApiPropertyOptional({ enum: HairColor })
  hairColor: HairColor;
  @ApiPropertyOptional({ enum: IntimateHaircut })
  intimateHaircut: IntimateHaircut;
  @ApiPropertyOptional({ enum: BodyArt })
  bodyArt: BodyArt;
  @ApiPropertyOptional({ enum: Sort })
  sort: Sort;

  // Пагинация
  @ApiPropertyOptional({ default: 10 })
  limit: number;
  @ApiPropertyOptional({ default: 2 })
  page: number;
  @ApiPropertyOptional({ enum: FormStatus })
  status: FormStatus;
}
