import { Component, type ReactNode } from 'react';
import { translations, type Language } from '@/lib/translations';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const t = translations[
    (typeof document !== 'undefined' ? (document.documentElement.getAttribute('dir') === 'rtl' ? 'ar' as Language : 'en' as Language) : 'en')
  ];
  const title = t.common_error_title || 'Something went wrong';
  const reloadLabel = t.common_error_reload || 'Reload page';
  if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6 dark:bg-black">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-black">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/30">⚠</div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{this.state.message}</p>
            <button
              onClick={this.handleReload}
              className="mt-6 rounded-lg border border-stone-900 bg-white px-6 py-2.5 font-bold text-stone-900 transition hover:bg-stone-100 dark:border-transparent dark:bg-amber-500 dark:text-stone-900 dark:hover:bg-amber-400"
            >
              {reloadLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}