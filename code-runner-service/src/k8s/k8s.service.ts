import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class K8sService {
  private batchV1Api: k8s.BatchV1Api;
  private coreV1Api: k8s.CoreV1Api;

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault(); // 通常會讀 ~/.kube/config 或在 K8s 中使用 service account
    this.batchV1Api = kc.makeApiClient(k8s.BatchV1Api);
    this.coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
  }

  async executeCode(code: string, image: string): Promise<string> {
    // 生成唯一的 Job 名稱
    const jobName = `runner-job-${uuidv4()}`;

    // 建立 Job
    const jobManifest: k8s.V1Job = {
      metadata: { name: jobName },
      spec: {
        backoffLimit: 0,
        template: {
          metadata: { name: jobName },
          spec: {
            containers: [
              {
                name: 'runner',
                image,
                env: [
                  {
                    name: 'CODE',
                    value: code,
                  },
                ],
              },
            ],
            restartPolicy: 'Never',
          },
        },
      },
    };

    // 在 default namespace 建立 job
    await this.batchV1Api.createNamespacedJob({
      namespace: 'default',
      body: jobManifest,
    });

    // 等待 Pod 結束
    const podName = await this.waitForPodCompletion(jobName);

    // 取得 log
    const logs = await this.coreV1Api.readNamespacedPodLog({
      name: podName,
      namespace: 'default',
    });

    // 清除 Job 和 Pod
    await this.batchV1Api.deleteNamespacedJob({
      name: jobName,
      namespace: 'default',
      propagationPolicy: 'Foreground',
      gracePeriodSeconds: 0,
    });

    return logs;
  }

  private async waitForPodCompletion(jobName: string): Promise<string> {
    let podName = '';
    while (true) {
      const body = await this.coreV1Api.listNamespacedPod({
        namespace: 'default',
      });
      const pod = body.items.find(
        (p) =>
          p.metadata?.name?.startsWith(jobName) &&
          p.status?.phase === 'Succeeded',
      );
      if (pod) {
        podName = pod.metadata!.name!;
        break;
      }
      await new Promise((res) => setTimeout(res, 1000));
    }
    return podName;
  }
}
