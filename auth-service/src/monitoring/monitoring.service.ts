import { Injectable } from '@nestjs/common';
import * as si from 'systeminformation';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from './metric.entity';
import { Alert } from './alert.entity';
import { ServiceStatus } from './service-status.entity';
import { Threshold } from './threshold.entity';
import { ThresholdCheckerService } from './threshold-checker.service';

const execAsync = promisify(exec);

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricRepo: Repository<Metric>,
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
    @InjectRepository(ServiceStatus)
    private readonly statusRepo: Repository<ServiceStatus>,
    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,
    private readonly checker: ThresholdCheckerService, // ⬅️ новый DI
  ) {}
  

  async getStats() {
    const [cpuLoad, memory, disks] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize().catch(() => []),
    ]);

    const cpu = parseFloat(cpuLoad.currentLoad.toFixed(1));
    const ramUsed = +(memory.used / 1024 / 1024 / 1024).toFixed(2);
    const ramTotal = +(memory.total / 1024 / 1024 / 1024).toFixed(2);
    const ramPercent = +(ramUsed / ramTotal * 100).toFixed(1);

    const diskUsed = disks[0] ? +(disks[0].used / 1024 / 1024 / 1024).toFixed(2) : null;
    const diskTotal = disks[0] ? +(disks[0].size / 1024 / 1024 / 1024).toFixed(2) : null;

    // 🔥 Пороговые уведомления
    const cpuThreshold = await this.thresholdRepo.findOne({ where: { type: 'cpu' } });
    if (cpuThreshold && cpu > cpuThreshold.value) {
      await this.alertRepo.save({
        type: 'cpu',
        value: cpu,
        message: `CPU превышает порог ${cpuThreshold.value}%: ${cpu}%`,
      });
      await this.checker.check('cpu', cpu);
      await this.checker.check('ram', ramPercent);
    }

    const ramThreshold = await this.thresholdRepo.findOne({ where: { type: 'ram' } });
    if (ramThreshold && ramPercent > ramThreshold.value) {
      await this.alertRepo.save({
        type: 'ram',
        value: ramPercent,
        message: `RAM превышает порог ${ramThreshold.value}%: ${ramPercent}%`,
      });
    }

    // 💾 Сохраняем метрику
    await this.metricRepo.save({
      cpu,
      ramUsed,
      ramTotal,
      diskUsed,
      diskTotal,
    } as Partial<Metric>);

    return {
      cpuUsage: `${cpu}%`,
      memoryUsage: `${ramUsed} GB / ${ramTotal} GB`,
      diskUsage: diskUsed !== null ? `${diskUsed} GB / ${diskTotal} GB` : '🔒 Недоступно',
      services: await this.checkServices(),
      timestamp: new Date().toISOString(),
    };
  }


  async getTopProcesses() {
  const [cpuProcs, memProcs] = await Promise.all([
    si.processes(),
    si.processes(), // один вызов даст и CPU, и RAM
  ]);

  const byCpu = cpuProcs.list
    .filter(p => p.cpu > 0)
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: p.cpu.toFixed(1),
    }));

  const byRam = memProcs.list
    .filter(p => p.memRss > 0)
    .sort((a, b) => b.memRss - a.memRss)
    .slice(0, 5)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      ramMB: (p.memRss / 1024 / 1024).toFixed(2),
    }));

  return { byCpu, byRam };
}

  async getAlerts() {
    return this.alertRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getHistory() {
    return this.metricRepo.find({
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  async getServiceHistory(name: string) {
    return this.statusRepo.find({
      where: { name },
      order: { timestamp: 'DESC' },
      take: 20,
    });
  }

  async checkServices() {
    const results: Record<string, string> = {};

    const redis = await this.pingPort(6379) ? 'работает' : 'нет связи';
    const db = await this.pingPort(5433) ? 'работает' : 'нет связи';
    const auth = await this.checkDockerContainer('auth-service');
    const user = await this.checkDockerContainer('user-service');

    results['redis'] = redis;
    results['db'] = db;
    results['auth-service'] = auth;
    results['user-service'] = user;

    for (const [name, status] of Object.entries(results)) {
      const last = await this.statusRepo.findOne({
        where: { name },
        order: { timestamp: 'DESC' },
      });

      if (!last || last.status !== status) {
        await this.statusRepo.save({ name, status });
      }
    }

    return results;
  }

  private async pingPort(port: number): Promise<boolean> {
    const net = await import('net');
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
      socket.once('timeout', () => resolve(false));
      socket.connect(port, '127.0.0.1');
    });
  }

  private async checkDockerContainer(name: string): Promise<string> {
    try {
      const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
      return stdout.includes(name) ? 'работает' : 'не запущен';
    } catch {
      return '⚠️ Docker недоступен';
    }
  }
}
