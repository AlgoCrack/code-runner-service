import { Module } from '@nestjs/common';
import { CodeRunnerController } from './code-runner.controller';
import { CodeRunnerService } from './code-runner.service';
import { K8sModule } from 'src/k8s/k8s.module';

@Module({
  imports: [K8sModule],
  controllers: [CodeRunnerController],
  providers: [CodeRunnerService],
})
export class CodeRunnerModule {}
