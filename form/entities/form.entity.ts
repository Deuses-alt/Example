import { IsInt, Max, Min } from 'class-validator';
import { Cities, Preferences } from 'src/types/enums';
import { Section } from '../../types/enums';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Departure, DepartureType, Tag } from '../utils/enums';
import { Worker } from 'src/worker/entities/worker.entity';
import { User } from 'src/user/entities/user.entity';

export enum FormStatus {
  Open = 'open',
  Banned = 'banned',
  Disable = 'disabled',
  Pending = 'pending',
}

@Entity()
export class Form {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: Preferences, array: true })
  preference: Preferences[];

  @Column({ type: 'decimal', precision: 10, scale: 0, select: false })
  phone: number;

  @Column({ nullable: true, default: null, select: false })
  telegram: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 0,
    nullable: true,
    default: null,
    select: false,
  })
  whatsapp: number;

  @Column()
  @IsInt()
  @Min(18)
  fromAge: number;

  @Column()
  @IsInt()
  @Max(100)
  beforeAge: number;

  @Column({ type: 'enum', enum: Cities })
  city: Cities;

  @Column({ type: 'enum', enum: Section })
  section: Section;

  @Column('simple-array')
  photos: string[];

  @Column('simple-array')
  videos: string[];

  @Column({ unique: true })
  numberId: string;

  @Column({ type: 'enum', enum: Tag, array: true })
  tags: Tag[];

  @Column({ type: 'enum', enum: Departure })
  departure: Departure;

  @Column({ type: 'enum', enum: DepartureType, array: true })
  departureType: DepartureType[];

  @Column()
  cost1hAppart: number;

  @Column()
  cost2hAppart: number;

  @Column()
  costNightAppart: number;

  @Column()
  cost1hArrive: number;

  @Column()
  cost2hArrive: number;

  @Column()
  costNightArrive: number;

  @ManyToOne(() => Worker, (worker) => worker.form)
  worker: Worker;

  @Column({ type: 'enum', enum: FormStatus, default: FormStatus.Pending })
  status: FormStatus;

  @DeleteDateColumn()
  deletedDate: Date;

  @ManyToMany(() => User)
  @JoinTable()
  authorizedViews: User[];

  @Column('simple-array', { default: [] })
  anonymousViews: string[];

  @Column({ default: 0 })
  viewsCount: number;

  @CreateDateColumn()
  public readonly createdAt: Date;

  @UpdateDateColumn()
  public readonly updatedAt: Date;

  public constructor(
    preference: Preferences[],
    phone: number,
    telegram: string,
    whatsapp: number,
    fromAge: number,
    beforeAge: number,
    city: Cities,
    section: Section,
    photos: string[],
    videos: string[],
    numberId: string,
    tags: Tag[],
    departure: Departure,
    departureType: DepartureType[],
    cost1hAppart: number,
    cost2hAppart: number,
    costNightAppart: number,
    cost1hArrive: number,
    cost2hArrive: number,
    costNightArrive: number,
  ) {
    this.preference = preference;
    this.phone = phone;
    this.telegram = telegram;
    this.whatsapp = whatsapp;
    this.fromAge = fromAge;
    this.beforeAge = beforeAge;
    this.city = city;
    this.section = section;
    this.photos = photos;
    this.videos = videos;
    this.numberId = numberId;
    this.tags = tags;
    this.departure = departure;
    this.departureType = departureType;
    this.cost1hAppart = cost1hAppart;
    this.cost2hAppart = cost2hAppart;
    this.costNightAppart = costNightAppart;
    this.cost1hArrive = cost1hArrive;
    this.cost2hArrive = cost2hArrive;
    this.costNightArrive = costNightArrive;
  }
}
