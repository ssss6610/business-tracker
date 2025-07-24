import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role , UserType} from './user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAdmin(): Promise<User | null> {
    return this.userRepository.findOne({ where: { role: Role.Admin } });
  }

async createAdmin(password: string): Promise<User> {
  const hashed = await bcrypt.hash(password, 10);

  const admin = this.userRepository.create({
    login: 'adm', // 🆕 логин
    email: 'admin@local.xyz', // ✅ новый email
    password: hashed,
    role: Role.Admin,
  });

  const saved = await this.userRepository.save(admin);
  console.log('💾 Сохранён TEMP admin:', saved);
  return saved;
}

async findByLogin(login: string): Promise<User | null> {
  console.log('📥 findByLogin получил login:', login);
  const user = await this.userRepository.findOne({ where: { login } });
  console.log('📤 Найден пользователь по логину:', user);
  return user;
}

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async findAll(): Promise<User[]> {
  return this.userRepository.find();
}

async create(dto: CreateUserDto): Promise<User> {
  const exists = await this.userRepository.findOne({ where: { login: dto.login } });
  if (exists) {
    throw new Error('Пользователь с таким логином уже существует');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
  login: dto.login,
  email: dto.email,
  role: dto.role,
  password: hashedPassword,
  userType: dto.userType ?? UserType.Employee, // 👈 по умолчанию сотрудник
  mustChangePassword: dto.mustChangePassword ?? true,
  });

  return this.userRepository.save(user);
}

async update(id: number, dto: UpdateUserDto): Promise<User> {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new Error('Пользователь не найден');

  if (dto.password) {
    dto.password = await bcrypt.hash(dto.password, 10);
  }

  Object.assign(user, dto);
  return this.userRepository.save(user);
}

async remove(id: number): Promise<void> {
  await this.userRepository.delete(id);
}

async findById(id: number): Promise<User> {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new Error('Пользователь не найден');
  return user;
}

}
