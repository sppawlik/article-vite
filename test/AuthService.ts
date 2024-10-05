import {Amplify} from "aws-amplify";
import {fetchAuthSession, signIn, SignInOutput} from "@aws-amplify/auth";

Amplify.configure({
    Auth: {
        Cognito:{
            userPoolId: "eu-central-1_sHlwUvTjb",
            userPoolClientId: "103jmngm1va7un6cse7gfp0bj7"
        }
    }
})

export class AuthService{
    public async login(username: string, password: string) {
        return (await signIn({
            username,
            password,
            options: {
                authFlowType: 'USER_PASSWORD_AUTH',
            },
        })) as SignInOutput;
    }

    public async getIdToken() {
        const authSession =  await fetchAuthSession();
        return authSession.tokens?.idToken?.toString();
    }
}