import { Controller, Post } from '@nestjs/common';
import { CodeRunnerService } from './code-runner.service';

@Controller('/api/code-runner')
export class CodeRunnerController {
  constructor(private readonly codeRunnerService: CodeRunnerService) {}

  @Post()
  async runCode(): Promise<string> {
    const res = await this.codeRunnerService.executeCode();
    return res;
  }
}
