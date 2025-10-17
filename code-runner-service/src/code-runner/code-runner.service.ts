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

    // 產生 code runner 執行程式碼
    const executeCode = this._generateExecuteCode(userInputCode, testCases);

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
    for (let i = 0; i < testCases.length; i++) {
      const expectedOutput = testCases[i].output;
      const actualOutput = res[i];
      if (actualOutput != expectedOutput) {
        return {
          success: false,
          error: `Test case ${i + 1} failed. Expected: ${expectedOutput}, Actual: ${actualOutput}`,
        };
      }
    }

    return { success: true };
  }

  private _generateExecuteCode(
    userInputCode: string,
    testCases: TestCase[],
  ): string {
    const input: (string | number | boolean)[][] = testCases.map((testCase) => {
      return testCase.input.map((v) => v);
    });

    const stringifiedInputs = JSON.stringify(input);

    return `
        const inputs = JSON.parse('${stringifiedInputs}');
        for (const input of inputs) {
          try {
            ${userInputCode}
            const result = (run as any)(...(input));

            console.log('__RESULT_START__');
            console.log(JSON.stringify(result));
            console.log('__RESULT_END__');

          } catch (err) {
            console.error('__ERROR_START__');
            console.error(err);
            console.error('__ERROR_END__');
          }
        }
      `;
  }

  private _parseCodeRunnerRes(log: string): string[] {
    const results: string[] = [];

    const resultRegex = /__RESULT_START__([\s\S]*?)__RESULT_END__/g;
    const errorRegex = /__ERROR_START__([\s\S]*?)__ERROR_END__/g;

    // 解析所有 result 區塊
    let match: RegExpExecArray | null;
    while ((match = resultRegex.exec(log)) !== null) {
      const content = match[1].trim();
      try {
        results.push(JSON.stringify(JSON.parse(content)));
      } catch {
        results.push(content); // 若不是 JSON 格式，就直接回傳原文字
      }
    }

    // 解析所有 error 區塊
    while ((match = errorRegex.exec(log)) !== null) {
      const content = match[1].trim();
      try {
        results.push(JSON.stringify(JSON.parse(content)));
      } catch {
        results.push(`Error: ${content}`);
      }
    }

    return results;
  }
}
