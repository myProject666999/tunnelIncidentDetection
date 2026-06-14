import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    this.logger.debug('Finding all users');
    return this.usersRepository.find({
      select: ['id', 'username', 'displayName', 'role', 'createdAt'],
    });
  }

  async findOne(id: number) {
    this.logger.debug(`Finding user with id: ${id}`);
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'displayName', 'role', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.debug(`Creating user with username: ${createUserDto.username}`);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.usersRepository.save(user);
    return {
      id: saved.id,
      username: saved.username,
      displayName: saved.displayName,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.debug(`Updating user with id: ${id}`);
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    this.logger.debug(`Removing user with id: ${id}`);
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { message: '删除成功' };
  }
}
