import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import * as bcrypt from 'bcrypt';
import { makeId } from '../../shared/constants';

@Injectable()
export class UserSeed {
    private readonly logger = new Logger(UserSeed.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async run() {
        const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
        const defaultName = process.env.DEFAULT_ADMIN_NAME || 'System Admin';
        const defaultPhone = process.env.DEFAULT_ADMIN_PHONE || '255700000000';
        const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
        const [firstName = 'System', surname = 'Admin'] = defaultName.split(' ');

        const existingUser = await this.userRepository.findOne({
            where: { username: defaultUsername },
        });

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        const adminRole = await this.roleRepository.findOne({
            where: { name: 'Admin' },
        });

        if (!adminRole) {
            throw new Error('Required role not found: Admin');
        }

        if (existingUser) {
            existingUser.firstName = firstName;
            existingUser.surname = surname;
            existingUser.email = defaultEmail;
            existingUser.phoneNumber = defaultPhone;
            existingUser.password = hashedPassword;
            existingUser.salt = salt;
            existingUser.roles = [adminRole];

            await this.userRepository.save(existingUser);

            this.logger.log(`Default user updated: ${defaultUsername}`);
            return;
        }

        const user = this.userRepository.create({
            uid: makeId(),
            firstName,
            surname,
            email: defaultEmail,
            phoneNumber: defaultPhone,
            username: defaultUsername,
            password: hashedPassword,
            salt,
            roles: [adminRole],
        });

        await this.userRepository.save(user);

        this.logger.log(`Default admin created: ${defaultEmail}`);
    }

}

