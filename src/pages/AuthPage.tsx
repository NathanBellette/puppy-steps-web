import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export const AuthPage = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Initialize forms before any conditional returns
  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmitSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUp(data.email, data.password, data.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Start tracking your dog\'s socialization progress' : 'Welcome back to PuppySteps'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Create a new account to get started' : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(onSubmitSignUp)} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    {...signUpForm.register('displayName')}
                    className={cn(
                      signUpForm.formState.errors.displayName && 'border-red-500'
                    )}
                  />
                  {signUpForm.formState.errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {signUpForm.formState.errors.displayName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...signUpForm.register('email')}
                    className={cn(
                      signUpForm.formState.errors.email && 'border-red-500'
                    )}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...signUpForm.register('password')}
                    className={cn(
                      signUpForm.formState.errors.password && 'border-red-500'
                    )}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(onSubmitSignIn)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...signInForm.register('email')}
                    className={cn(
                      signInForm.formState.errors.email && 'border-red-500'
                    )}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...signInForm.register('password')}
                    className={cn(
                      signInForm.formState.errors.password && 'border-red-500'
                    )}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      const email = signInForm.getValues('email');
                      if (!email) {
                        setError('Please enter your email address first');
                        return;
                      }
                      setError(null);
                      setResetSent(false);
                      try {
                        await resetPassword(email);
                        setResetSent(true);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to send reset email');
                      }
                    }}
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {resetSent && (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 text-sm">
                    Password reset email sent. Check your inbox.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Don\'t have an account? Sign up'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
