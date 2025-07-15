import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class Pod {
  @ApiProperty({ description: 'pod name', example: 'xxx-code-runner' })
  @IsString()
  podName: string;

  @ApiProperty({ description: 'Is pod successed?', example: true })
  @IsBoolean()
  isPodSuccess: boolean;
}

export class ExecuteCodeRes {
  @ApiProperty({ description: 'code runner response', example: '123' })
  @IsString()
  codeRunnerRes: string;

  @ApiProperty({ description: 'Is pod successed?', example: true })
  @IsBoolean()
  isPodSuccess: boolean;
}
