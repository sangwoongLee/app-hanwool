import { POST, GET, HEAD } from './utils';
import { UserDto } from '@shared/dto';

const emailSignUp = (data: UserDto.SIGNUP_EMAIL): any => POST('/api/auth/email/signup', data);
const emailLogin = (data: UserDto.LOGIN) => POST('/api/auth/email', data);
const googleLogin = () => GET('/api/auth/google', {});
const kakaoLogin = (data: JSON) => GET('/api/auth/kakao', data);
const isValidToken = (data: UserDto.IS_VALID_TOKEN): any => GET('/api/auth', {}, data.token);

export { emailLogin, emailSignUp, googleLogin, kakaoLogin, isValidToken };
