import { fetchAuthSession } from '@aws-amplify/auth';
import { AuthService } from './AuthService';

async function testAuth() {
    const service = new AuthService();
    await service.login('test1', 'Asdf123@#');

    const { idToken } = (await fetchAuthSession()).tokens ?? {};

    console.log(idToken?.toString());

    return idToken;
}

testAuth();