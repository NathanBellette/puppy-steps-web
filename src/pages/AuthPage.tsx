import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm, FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { AppLogo } from '@/components/AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn, getErrorMessage } from '@/lib/utils';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

interface AuthFieldConfig<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type: string;
}

const emailField = { id: 'email', label: 'Email Address', type: 'email' } as const;
const passwordField = { id: 'password', label: 'Password', type: 'password' } as const;

const signInFields: AuthFieldConfig<SignInForm>[] = [emailField, passwordField];
const signUpFields: AuthFieldConfig<SignUpForm>[] = [
  { id: 'displayName', label: 'Full Name', type: 'text' },
  emailField,
  passwordField,
];

/** Renders a labelled input for each field, wired to the form's validation errors. */
const AuthFields = <T extends FieldValues>({ form, fields }: { form: UseFormReturn<T>; fields: AuthFieldConfig<T>[] }) => (
  <>
    {fields.map(({ id, label, type }) => {
      const error = form.formState.errors[id] as FieldError | undefined;
      return (
        <FormField key={id} label={label} htmlFor={id} error={error?.message} labelClassName="">
          <Input id={id} type={type} {...form.register(id)} className={cn(error && 'border-red-500')} />
        </FormField>
      );
    })}
  </>
);

const SubmitButton = ({ isLoading, label, loadingLabel }: { isLoading: boolean; label: string; loadingLabel: string }) => (
  <Button type="submit" className="w-full" disabled={isLoading}>
    {isLoading ? loadingLabel : label}
  </Button>
);

const linkButtonClassName =
  'text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300';

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

  const runAuthAction = async (action: () => Promise<void>, failureMessage: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, failureMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = (data: SignInForm) =>
    runAuthAction(() => signIn(data.email, data.password), 'Sign in failed');

  const handleSignUp = (data: SignUpForm) =>
    runAuthAction(() => signUp(data.email, data.password, data.displayName), 'Sign up failed');

  const handleForgotPassword = async () => {
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
      setError(getErrorMessage(err, 'Failed to send reset email'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AppLogo size="lg" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <AuthFields form={signUpForm} fields={signUpFields} />
                <SubmitButton isLoading={isLoading} label="Create Account" loadingLabel="Creating Account..." />
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <AuthFields form={signInForm} fields={signInFields} />

                <div className="flex justify-end">
                  <button type="button" onClick={handleForgotPassword} className={linkButtonClassName}>
                    Forgot password?
                  </button>
                </div>

                {resetSent && (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 text-sm">
                    Password reset email sent. Check your inbox.
                  </div>
                )}

                <SubmitButton isLoading={isLoading} label="Sign In" loadingLabel="Signing In..." />
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={linkButtonClassName}
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
