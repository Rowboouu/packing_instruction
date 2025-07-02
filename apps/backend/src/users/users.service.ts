import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    try {
      const createdUser = new this.userModel(createUserDto);

      const user = await createdUser.save();
      return omit(user.toJSON(), 'password');
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new ConflictException(
          `Email ${createUserDto.email} already taken`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .collation({ locale: 'en_US', strength: 1 })
      .sort({ name: 1 })
      .select({
        password: 0,
      })
      .lean()
      .exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    try {
      return this.userModel
        .findById(id)
        .select({
          password: 0,
        })
        .lean()
        .exec();
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: new RegExp(`^${email}$`, 'i') })
      .exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User> | null> {
    try {
      const user = await this.userModel.findOne({ _id: id });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Apply the updates to the user object
      Object.assign(user, updateUserDto);

      // Trigger the pre-save middleware by calling save
      await user.save();

      return omit(user.toJSON(), 'password');
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to update user with ID '${id}' : ${error.message}`,
        )
      );
    }
  }

  async remove(id: string): Promise<User | null> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID '${id}' not found`);
      }
      return deletedUser;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to delete user with ID '${id}': ${error.message}`,
        )
      );
    }
  }
}
