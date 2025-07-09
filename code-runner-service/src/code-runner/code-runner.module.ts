import { Module } from '@nestjs/common';
import { CodeRunnerController } from './code-runner.controller';
import { CodeRunnerService } from './code-runner.service';

@Module({
  imports: [],
  controllers: [CodeRunnerController],
  providers: [CodeRunnerService],
})
export class CodeRunnerModule {}
