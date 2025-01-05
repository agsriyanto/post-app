import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import axios from 'axios';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [formData, setFormData] = useState({ name: '', token: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateToken = async (accessToken: string) => {
    try {
      const response = await axios.get(
        `https://gorest.co.in/public/v2/users?access-token=${accessToken}`
      );
      const user_id = response?.data[0].id;
      sessionStorage.setItem('user_id', user_id);
      return response.status === 200;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error Fetching Data');
    }
  };

  const handleGo = async () => {
    const { name, token } = formData;

    setLoading(true);
    const isValid = await validateToken(token);
    setLoading(false);

    if (isValid) {
      sessionStorage.setItem('name', name);
      sessionStorage.setItem('access_token', token);
      router.push('/posts');
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      router.push('/posts');
    }
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="relative flex place-items-center w-[50%] p-8 border border-gray-300 rounded-md shadow">
        <div className="flex flex-col items-center justify-center space-y-8 w-full">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
            Welcome&nbsp;
            <code className="font-mono font-bold">Post App</code>
          </p>
          <p className="!mt-1">Go to a list!</p>

          <div className="w-full flex flex-col space-y-4">
            <Input
              size="large"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              value={formData.name}
              aria-label="Name"
            />
            <Input
              size="large"
              name="token"
              placeholder="GoRest Token"
              onChange={handleChange}
              value={formData.token}
              aria-label="GoRest Token"
            />
            <Button
              loading={loading}
              type="primary"
              size="large"
              onClick={handleGo}
              disabled={!formData.name || !formData.token}
              className="disabled:!bg-[#8dbaef] disabled:!text-white"
            >
              Go!
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
