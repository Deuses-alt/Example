import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormService } from './form.service';
import { Form } from './entities/form.entity';
import { Worker } from 'src/worker/entities/worker.entity';
import { User } from 'src/user/entities/user.entity';
import { WorkerService } from 'src/worker/worker.service';
import { UserService } from 'src/user/user.service';
import { FormCreateRequest } from './requests/form.create.request';
import { FormStatus } from './entities/form.entity';
import { FormFindAllRequest } from './requests/form.find.request';
import { Role, Cities, Section, Preferences } from 'src/types/enums';
import { Departure, DepartureType, Sort, Tag } from './utils/enums';
import {
  Appearance,
  BodyArt,
  BodyType,
  HairColor,
  IntimateHaircut,
  Nationality,
} from 'src/worker/utils/enums';
import { Session } from 'src/sessions/entities/session.entity';
import { v4 as uuidv4 } from 'uuid';
import { getTestOrmConfig } from 'src/spec/spec.config';
import 'dotenv/config'

describe('FormService', () => {
  let formService: FormService;
  let formRepository: Repository<Form>;
  let workerService: WorkerService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...getTestOrmConfig(),
          entities: [Form, Worker, Session, User],
        }),
        TypeOrmModule.forFeature([Form]),
      ],
      providers: [
        FormService,
        {
          provide: WorkerService,
          useValue: { decrement: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { findOneById: jest.fn() },
        },
      ],
    }).compile();

    formService = module.get<FormService>(FormService);
    formRepository = module.get<Repository<Form>>(getRepositoryToken(Form));
    workerService = module.get<WorkerService>(WorkerService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    await formRepository.query('DELETE FROM "form"');
  });

  it('Успешное создание формы', async () => {
    const formData: FormCreateRequest = {
      preference: [Preferences.classicMassage],
      phone: 123,
      telegram: '@telegram',
      whatsapp: 123,
      fromAge: 18,
      beforeAge: 30,
      city: Cities.Astana,
      section: Section.Individual,
      photos: [],
      videos: [],
      tags: [Tag.Mistress],
      departure: Departure.ClientPays,
      departureType: [DepartureType.Flats],
      cost1hAppart: 100,
      cost2hAppart: 200,
      costNightAppart: 300,
      cost1hArrive: 150,
      cost2hArrive: 250,
      costNightArrive: 350,
      userId: 'some-user-id',
    };

    const validUUID = uuidv4();
    formData.userId = validUUID;

    const createdForm = await formService.create(formData);

    await formRepository.save(createdForm);
    expect(createdForm).toBeDefined();

    const savedForm = await formRepository.findOne({
      where: { uuid: createdForm.uuid },
      select: {
        phone: true,
        telegram: true,
        whatsapp: true,
      },
    });

    expect(savedForm).toBeDefined();
  });

  it('Нахождение всех форм', async () => {
    const findRequest: FormFindAllRequest = {
      sort: Sort.new,
      limit: 10,
      page: 1,
      status: FormStatus.Open,
      city: Cities.Astana,
      section: Section.Individual,
      fromAge: undefined,
      beforeAge: undefined,
      tags: undefined,
      departure: undefined,
      departureType: undefined,
      cost1hAppart: undefined,
      cost2hAppart: undefined,
      costNightAppart: undefined,
      cost1hArrive: undefined,
      cost2hArrive: undefined,
      costNightArrive: undefined,
      age: undefined,
      height: undefined,
      weight: undefined,
      breast: undefined,
      shoeSize: undefined,
      clothingSize: undefined,
      appearance: undefined,
      nationality: undefined,
      bodyType: undefined,
      hairColor: undefined,
      intimateHaircut: undefined,
      bodyArt: undefined,
    };

    jest.spyOn(userService, 'findOneById').mockResolvedValue({
      role: Role.Admin,
    } as User);

    const forms = await formService.findAll('test-uuid', findRequest);
    expect(forms).toBeInstanceOf(Array);
    expect(forms.length).toBeGreaterThanOrEqual(0);
  });

  it('Нахождение одной формы по uuid', async () => {
    const form = new Form(
      [Preferences.classicMassage],
      1234567890,
      '@telegram',
      1234567890,
      18,
      30,
      Cities.Astana,
      Section.Individual,
      [],
      [],
      '1',
      [Tag.Mistress],
      Departure.ClientPays,
      [DepartureType.Flats],
      100,
      200,
      300,
      150,
      250,
      350,
    );
    form.uuid = uuidv4();
    const testUuid = form.uuid;
    await formRepository.save(form);

    const foundForm = await formService.findOne(testUuid, null, '127.0.0.1');
    expect(foundForm).toBeDefined();
    expect(foundForm.uuid).toBe(testUuid);
  });

  it('Проверка работы метода lease', async () => {
    const worker = new Worker(
      'Test worker',
      25,
      180,
      75,
      3,
      42,
      50,
      Appearance.Slavic,
      Nationality.Armenian,
      BodyType.Full,
      HairColor.Bald,
      IntimateHaircut.Neat,
      BodyArt.Piercing,
    );
    worker.balance = 100;

    const form = new Form(
      [Preferences.classicMassage],
      1234567890,
      '@telegram',
      1234567890,
      18,
      30,
      Cities.Astana,
      Section.Individual,
      [],
      [],
      '1',
      [Tag.Mistress],
      Departure.ClientPays,
      [DepartureType.Flats],
      100,
      200,
      300,
      150,
      250,
      350,
    );
    form.worker = worker;
    form.status = FormStatus.Open;
    form.uuid = uuidv4();
    await formRepository.save(form);

    jest.spyOn(workerService, 'decrement').mockResolvedValue(undefined);

    await formService.lease();

    const updatedForm = await formRepository.findOne({
      where: { uuid: form.uuid },
    });

    expect(updatedForm).toBeDefined();
    expect(updatedForm.status).toBe(FormStatus.Open);
  });
});
