import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../permission/permission.entity';
import { makeId } from '../../shared/constants';

@Injectable()
export class PermissionSeed {
	private readonly logger = new Logger(PermissionSeed.name);

	constructor(
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>,
	) {}

	async run() {
		const defaultKey = 'ALL';

		const existingPermission = await this.permissionRepository.findOne({
			where: { key: defaultKey },
		});

		if (existingPermission) {
			this.logger.log(`Default permission already exists: ${defaultKey}`);
			return existingPermission;
		}

		const permission = this.permissionRepository.create({
			uid: makeId(),
			key: defaultKey,
			description: 'Full access to all resources',
		});

		await this.permissionRepository.save(permission);

		this.logger.log(`Default permission created: ${defaultKey}`);

		return permission;
	}
}
