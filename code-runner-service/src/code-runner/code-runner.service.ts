import { Injectable } from '@nestjs/common';
import { ExcuteCodeRes, TestCase, Language } from './code-runner.dto';
import { K8sService } from 'src/k8s/k8s.service';

@Injectable()
export class CodeRunnerService {
  constructor(private k8sService: K8sService) {}

  async executeCode(
    testCases: TestCase[],
    language: Language,
    userInputCode: string,
  ): Promise<ExcuteCodeRes> {
    const image = `andy45630/${language}-code-runner`;

    for (const testCase of testCases) {
      // 產生 code runner 執行程式碼
      const executeCode = this._generateExecuteCode(userInputCode, testCase);

      // 產生 pod 執行程式碼
      const { codeRunnerRes, isPodSuccess } = await this.k8sService.executeCode(
        executeCode,
        image,
      );

      // 解析 code runner response
      const res = this._parseCodeRunnerRes(codeRunnerRes);

      // 如果 code-runner 執行錯誤
      if (!isPodSuccess) {
        return {
          success: false,
          error: codeRunnerRes,
        };
      }

      // 如果測試項目失敗，回傳錯誤的測試項目跟預期輸出
      if (res != testCase.output) {
        return {
          success: false,
          input: testCase.input,
          actualOutput: res,
          expectedOutput: testCase.output,
        };
      }
    }
    return { success: true };
  }

  private _generateExecuteCode(
    userInputCode: string,
    testCase: TestCase,
  ): string {
    const input: string = testCase.input
      .map((v) => (typeof v === 'string' ? `'${v}'` : v))
      .join(',');

    return `
        try {
          ${userInputCode}
          const input = JSON.parse(process.env.INPUT ?? '{}');

          const result = run(${input});

          console.log('__RESULT_START__');
          console.log(JSON.stringify(result));
          console.log('__RESULT_END__');

        } catch (err) {
          console.error('__ERROR_START__');
          console.error(err);
          console.error('__ERROR_END__');
        }
      `;
  }

  private _parseCodeRunnerRes(log: string): string {
    const resStart = log.indexOf('__RESULT_START__');
    const resEnd = log.indexOf('__RESULT_END__');
    const errorStart = log.indexOf('__ERROR_START__');
    const errorEnd = log.indexOf('__ERROR_END__');

    // 解析 __RESULT_START__ 跟 __RESULT_END__ 中間的結果
    if (resStart !== -1 && resEnd !== -1) {
      const result = log
        .slice(resStart + '__RESULT_START__'.length, resEnd)
        .trim();
      return JSON.stringify(JSON.parse(result));
    }

    // 當發生錯誤時，解析 __ERROR_START__ 跟 __ERROR_END__ 中間的結果
    if (resStart !== -1 && resEnd !== -1) {
      const result = log
        .slice(errorStart + '__ERROR_START__'.length, errorEnd)
        .trim();
      return JSON.stringify(JSON.parse(result));
    }

    return log;
  }
}
