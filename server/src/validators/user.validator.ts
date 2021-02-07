import { UsernamePasswordInput } from '../models/username-password-input.model';

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [{ field: 'email', message: 'Please provide proper email' }];
    }

    if (options.username.includes('@')) {
        return [{ field: 'username', message: 'Username can not include @' }];
    }

    if (options.username.length <= 2) {
        return [{ field: 'username', message: 'Please provide username with length more than 2 symbols' }];
    }

    if (options.password.length <= 2) {
        return [{ field: 'password', message: 'Please provide password with length more than 2 symbols' }];
    }

    return;
};
