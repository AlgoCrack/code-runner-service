import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsEnum,
  IsObject,
  IsDate,
  IsArray,
} from 'class-validator';

export enum Language {
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  PYTHON = 'python',
  TYPESCRIPT = 'typescript',
}

export class ExecuteCodeReq {
  @ApiProperty({
    description: 'test cases',
    example: [
      {
        input: [3, 4],
        output: '7',
      },
      {
        input: [2, 7],
        output: '9',
      },
    ],
  })
  @IsArray()
  testCases: TestCase[];

  @ApiProperty({ description: 'program language', example: 'typescript' })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({
    description: 'program code',
    example: 'const run = (a: number, b: number): number => {return a + b;}',
  })
  @IsString()
  code: string;
}

export class ExcuteCodeRes {
  @ApiProperty({ description: 'is it successful?', example: true })
  @IsString()
  success: boolean;

  @ApiProperty({
    description: 'function input',
    example: { nums: '[1, 2, 3]', str: 'aaa' },
  })
  input?: object;

  @ApiProperty({ description: 'function actualOutput', example: '[1]' })
  @IsObject()
  actualOutput?: string;

  @ApiProperty({ description: 'function expectedOutput', example: '[0,1]' })
  @IsObject()
  expectedOutput?: string;

  @ApiProperty({ description: 'error', example: 'error' })
  @IsObject()
  error?: string;
}

export class TestCase {
  @ApiProperty({ description: 'test case id', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'problem id', example: 1 })
  @IsInt()
  problemId: number;

  @ApiProperty({ description: 'input', example: '1 + 1 = ?' })
  input: (string | number | boolean)[];

  @ApiProperty({ description: 'input', example: 1 })
  @IsInt()
  output: string;

  @ApiProperty({ description: 'created time', example: new Date() })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'updated time', example: new Date() })
  @IsDate()
  updatedAt: Date;
}
