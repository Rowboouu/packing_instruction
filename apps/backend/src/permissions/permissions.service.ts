import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {
  findAll() {
    return [
      {
        id: 1,
        name: 'user',
        description: 'User',
      },
      {
        id: 2,
        name: 'admin',
        description: 'Admin',
      },
    ];
  }
}
