import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { makeId } from '../../shared/constants';

@Injectable()
export class UserSeed {
    private readonly logger = new Logger(UserSeed.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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

        if (existingUser) {
            this.logger.log(`Default user already exists: ${defaultUsername}`);
            return;
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const user = this.userRepository.create({
            uid: makeId(),
            firstName,
            surname,
            email: defaultEmail,
            phoneNumber: defaultPhone,
            username: defaultUsername,
            password: hashedPassword,
            salt,
        });

        await this.userRepository.save(user);

        this.logger.log(`Default admin created: ${defaultEmail}`);
    }

}

