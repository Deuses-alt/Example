import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Form, FormStatus } from './entities/form.entity';
import { Between, In, Repository } from 'typeorm';
import { FormCreateRequest } from './requests/form.create.request';
import { generateUniqueId } from './utils/generateNumber';
import {
  GetPhoneResponse,
  GetTelegramResponse,
  GetWhatsAppResponse,
} from './responses/form.find.response';
import { FormFindAllRequest } from './requests/form.find.request';
import { Cities, Role, Section } from 'src/types/enums';
import { WorkerService } from 'src/worker/worker.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FormService {
  public constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    private readonly workerService: WorkerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private readonly cityCategoryRates = {
    [Cities.Astana]: {
      Prostitutes: 3.024,
      Elite: 6.048,
      Premium: 12.096,
      Individual: 1.44,
      Bdsm: 1.2096,
    },
    [Cities.Almaty]: {
      Prostitutes: 24192,
      Elite: 4.8384,
      Premium: 9.072,
      Individual: 1.2096,
      Bdsm: 1.2096,
    },
    Другие: {
      Prostitutes: 0, // Бесплатно
      Elite: 0, // Бесплатно
      Premium: null, // Нет категории
      Individual: 0, // Бесплатно
      Bdsm: 0,
    },
  };

  private readonly conversionRate = 1.6;

  public async create(newData: FormCreateRequest): Promise<Form> {
    let id = generateUniqueId(12);
    let i = 0;
    while (i < 10) {
      const existingForm = await this.formRepository.findOne({
        where: { numberId: id },
      });
      if (!existingForm) break;
      id = generateUniqueId(12);
      i++;
    }
    if (i === 10) {
      throw new Error('Failed to generate a unique ID after 10 attempts');
    }
    const form = new Form(
      newData.preference,
      newData.phone,
      newData.telegram,
      newData.whatsapp,
      newData.fromAge,
      newData.beforeAge,
      newData.city,
      newData.section,
      newData.photos,
      newData.videos,
      id,
      newData.tags,
      newData.departure,
      newData.departureType,
      newData.cost1hAppart,
      newData.cost2hAppart,
      newData.costNightAppart,
      newData.cost1hArrive,
      newData.cost2hArrive,
      newData.costNightArrive,
    );

    return await this.formRepository.save(form);
  }

  public async getTelegram(uuid: string): Promise<GetTelegramResponse> {
    const form = await this.formRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
    return { telegram: form.telegram };
  }

  public async getWhatsApp(uuid: string): Promise<GetWhatsAppResponse> {
    const form = await this.formRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
    return { whatsapp: form.whatsapp };
  }

  public async getPhone(uuid: string): Promise<GetPhoneResponse> {
    const form = await this.formRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
    return { phone: form.phone };
  }

  public async findOne(
    formId: string,
    userId: string | null,
    ipAddress: string,
  ): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: {
        uuid: formId,
      },
      relations: {
        worker: true,
        authorizedViews: true,
      },
    });
    if (!form) {
      throw new Error('Профиль не найден!');
    }

    const user = await this.userService.findOneById(userId);

    if (user) {
      if (!form.authorizedViews.some((u) => u.uuid === user.uuid)) {
        form.authorizedViews.push(user);
      }
    } else {
      if (!form.anonymousViews.includes(ipAddress)) {
        form.anonymousViews.push(ipAddress);
      }
    }

    await this.formRepository.save(form);

    return form;
  }

  public async findAll(
    uuid: string,
    newData: FormFindAllRequest,
  ): Promise<Form[]> {
    let status;

    const user = await this.userService.findOneById(uuid);

    if (user && user.role === Role.Admin) {
      status = newData.status;
    } else {
      status = FormStatus.Open;
    }

    const order: any = {};
    switch (newData.sort) {
      case 'score':
        order['viewsCount'] = 'DESC';
        break;
      case 'new':
        order['createdAt'] = 'DESC';
        break;
      case 'price':
        order['cost1hAppart'] = 'ASC';
        break;
      case 'priceDesc':
        order['cost1hAppart'] = 'DESC';
        break;
      default:
        order['createdAt'] = 'DESC'; // Сортировка по умолчанию
        break;
    }

    const whereCondition: any = {
      worker: {
        age: newData.age,
        height: newData.height,
        weight: newData.weight,
        breast: newData.breast,
        shoeSize: newData.shoeSize,
        clothingSize: newData.clothingSize,
        appearance: newData.appearance,
        nationality: newData.nationality,
        bodyType: newData.bodyType,
        hairColor: newData.hairColor,
        intimateHaircut: newData.intimateHaircut,
        bodyArt: newData.bodyArt,
      },
      fromAge: newData.fromAge,
      beforeAge: newData.beforeAge,
      city: newData.city,
      section: newData.section,
      tags: newData.tags && In(newData.tags),
      departure: newData.departure,
      departureType: newData.departureType && In(newData.departureType),
      cost1hAppart: newData.cost1hAppart,
      cost2hAppart: newData.cost2hAppart,
      costNightAppart: newData.costNightAppart,
      cost1hArrive: newData.cost1hArrive,
      cost2hArrive: newData.cost2hArrive,
      costNightArrive: newData.costNightArrive,
      status: status,
    };

    if (newData.age && newData.age.length === 2) {
      whereCondition.worker.age = Between(newData.age[0], newData.age[1]);
    }
    if (newData.height && newData.height.length === 2) {
      whereCondition.worker.height = Between(
        newData.height[0],
        newData.height[1],
      );
    }
    if (newData.weight && newData.weight.length === 2) {
      whereCondition.worker.weight = Between(
        newData.weight[0],
        newData.weight[1],
      );
    }
    if (newData.breast && newData.breast.length === 2) {
      whereCondition.worker.breast = Between(
        newData.breast[0],
        newData.breast[1],
      );
    }
    if (newData.shoeSize && newData.shoeSize.length === 2) {
      whereCondition.worker.shoeSize = Between(
        newData.shoeSize[0],
        newData.shoeSize[1],
      );
    }
    if (newData.clothingSize && newData.clothingSize.length === 2) {
      whereCondition.worker.clothingSize = Between(
        newData.clothingSize[0],
        newData.clothingSize[1],
      );
    }
    if (newData.cost1hAppart && newData.cost1hAppart.length === 2) {
      whereCondition.cost1hAppart = Between(
        newData.cost1hAppart[0],
        newData.cost1hAppart[1],
      );
    }
    if (newData.cost2hAppart && newData.cost2hAppart.length === 2) {
      whereCondition.cost2hAppart = Between(
        newData.cost2hAppart[0],
        newData.cost2hAppart[1],
      );
    }
    if (newData.costNightAppart && newData.costNightAppart.length === 2) {
      whereCondition.costNightAppart = Between(
        newData.costNightAppart[0],
        newData.costNightAppart[1],
      );
    }
    if (newData.cost1hArrive && newData.cost1hArrive.length === 2) {
      whereCondition.cost1hArrive = Between(
        newData.cost1hArrive[0],
        newData.cost1hArrive[1],
      );
    }
    if (newData.cost2hArrive && newData.cost2hArrive.length === 2) {
      whereCondition.cost2hArrive = Between(
        newData.cost2hArrive[0],
        newData.cost2hArrive[1],
      );
    }
    if (newData.costNightArrive && newData.costNightArrive.length === 2) {
      whereCondition.costNightArrive = Between(
        newData.costNightArrive[0],
        newData.costNightArrive[1],
      );
    }

    const forms = await this.formRepository.find({
      relations: {
        worker: true,
      },
      where: whereCondition,
      order: order,
      take: newData.limit,
      skip: newData.limit * (newData.page - 1),
    });

    return forms;
  }

  public async softDelete(formId: string): Promise<void> {
    await this.formRepository.softDelete({ uuid: formId });
  }

  public async lease(): Promise<any> {
    const openForm = await this.formRepository.find({
      relations: {
        worker: true,
      },
      where: {
        status: FormStatus.Open,
      },
    });

    openForm.forEach(async (form) => {
      let rate: number;

      let city = form.city;

      if (form.city === Cities.Astana || form.city === Cities.Almaty) {
        rate = this.cityCategoryRates[city][form.section];
      } else {
        rate = this.cityCategoryRates['Другие'][form.section];
      }

      if (rate !== null && rate > 0) {
        const amount = rate * this.conversionRate;

        if (form.worker.balance >= amount) {
          await this.workerService.decrement(form.worker.uuid, amount);
        } else {
          await this.formRepository.update(
            { uuid: form.uuid },
            { status: FormStatus.Disable },
          );
        }
      }
    });
  }
  public async findOneById(uuid: string): Promise<Form> {
    return await this.formRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
  }
}
