import { Injectable } from '@nestjs/common';
import { ExcuteCodeRes, TestCase, Language } from './code-runner.dto';
import { K8sService } from 'src/k8s/k8s.service';

@Injectable()
export class CodeRunnerService {
  constructor(private k8sService: K8sService) {}

  async executeCode(
    testCases: TestCase[],
    language: Language,
    code: string,
  ): Promise<ExcuteCodeRes> {
    const image = `andy45630/${language}-code-runner`;

    for (const testCase of testCases) {
      const codeRunnerRes = await this.k8sService.executeCode(code, image);
      if (codeRunnerRes != testCase.output) {
        return {
          success: false,
          input: testCase.input,
          actualOutput: codeRunnerRes,
          expectedOutput: testCase.output,
        };
      }
    }
    return { success: true };
  }
}
