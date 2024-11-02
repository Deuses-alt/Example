import { forwardRef, Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { UserModule } from 'src/user/user.module';
import { WorkerService } from 'src/worker/worker.service';
import { WorkerModule } from 'src/worker/worker.module';

@Module({
  imports: [TypeOrmModule.forFeature([Form]), WorkerModule, forwardRef(()=> UserModule)],
  exports: [FormService],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
