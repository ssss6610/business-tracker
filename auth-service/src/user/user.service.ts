import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, Role, UserType } from './user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // --- базовые методы ---

  async findAdmin(): Promise<User | null> {
    return this.userRepository.findOne({ where: { role: Role.Admin } });
  }

  async createAdmin(password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);

    // если админ уже есть — вернём его (на всякий)
    const existing = await this.userRepository.findOne({ where: { role: Role.Admin } });
    if (existing) return existing;

    const admin = this.userRepository.create({
      login: 'adm',
      email: 'admin@local.xyz',
      password: hashed,
      role: Role.Admin,
      userType: UserType.Employee,
      mustChangePassword: false,
    });

    return this.userRepository.save(admin);
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { login } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['trackerRole'] });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findAll(): Promise<User[]> {
    // отдадим с привязанной ролью трекера
    return this.userRepository.find({ relations: ['trackerRole'] });
  }

  // --- создание/обновление/удаление ---

  async create(dto: CreateUserDto): Promise<User> {
    // уникальность логина/почты
    const byLogin = await this.userRepository.findOne({ where: { login: dto.login } });
    if (byLogin) {
      throw new BadRequestException('Пользователь с таким логином уже существует');
    }
    const byEmail = await this.userRepository.findOne({ where: { email: dto.email } });
    if (byEmail) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      login: dto.login,
      email: dto.email,
      role: dto.role,
      password: hashedPassword,

      // новые поля
      userType: dto.userType ?? UserType.Employee,           // по умолчанию сотрудник
      trackerRoleId: dto.trackerRoleId ?? null,
      department: dto.department ?? null,
      mustChangePassword: dto.mustChangePassword ?? true,     // при создании требуем смену
    });

    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // если меняем логин — проверить уникальность
    if (dto.login && dto.login !== user.login) {
      const exists = await this.userRepository.findOne({ where: { login: dto.login, id: Not(id) } });
      if (exists) throw new BadRequestException('Логин уже занят');
    }

    // если меняем email — проверить уникальность
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOne({ where: { email: dto.email, id: Not(id) } });
      if (exists) throw new BadRequestException('Email уже занят');
    }

    // пароль хэшируем, если передан
    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    // собираем патч только из разрешённых полей
    const patch: Partial<User> = {
      ...(dto.login !== undefined ? { login: dto.login } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.userType !== undefined ? { userType: dto.userType } : {}),
      ...(dto.department !== undefined ? { department: dto.department ?? null } : {}),
      ...(dto.trackerRoleId !== undefined ? { trackerRoleId: dto.trackerRoleId ?? null } : {}),
      ...(dto.mustChangePassword !== undefined ? { mustChangePassword: dto.mustChangePassword } : {}),
      ...(hashedPassword ? { password: hashedPassword } : {}),
    };

    Object.assign(user, patch);
    await this.userRepository.save(user);

    // вернём с relation для фронта
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
