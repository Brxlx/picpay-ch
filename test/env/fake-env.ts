import { CoreEnv } from '@/core/env/env';

type FakeEnvProps = {
  fakeURL: string;
};

export class FakeEnv implements CoreEnv<FakeEnvProps> {
  get() {
    return 'http://myfakeurl.com';
  }
}
