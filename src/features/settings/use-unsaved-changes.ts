'use client';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const drafts = new Set<symbol>();
export function confirmSettingsNavigation() {
  return drafts.size === 0 || window.confirm('Discard your unsaved settings changes?');
}
function unload(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = '';
}
function navigate(event: MouseEvent) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.target === '_blank' ||
    link.hasAttribute('download') ||
    link.href === window.location.href ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  if (!confirmSettingsNavigation()) {
    event.preventDefault();
    event.stopPropagation();
  }
}
/** Protect drafts on reload, tab close, and link navigation. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const id = Symbol();
    drafts.add(id);
    if (drafts.size === 1) {
      window.addEventListener('beforeunload', unload);
      document.addEventListener('click', navigate, true);
    }
    return () => {
      drafts.delete(id);
      if (drafts.size === 0) {
        window.removeEventListener('beforeunload', unload);
        document.removeEventListener('click', navigate, true);
      }
    };
  }, [dirty]);
}
/** Use for button-driven navigation from settings layouts. */
export function useSettingsRouter() {
  const router = useRouter();
  return useMemo(
    () => ({
      ...router,
      push: (...args: Parameters<typeof router.push>) => {
        if (confirmSettingsNavigation()) router.push(...args);
      },
      replace: (...args: Parameters<typeof router.replace>) => {
        if (confirmSettingsNavigation()) router.replace(...args);
      },
      back: () => {
        if (confirmSettingsNavigation()) router.back();
      },
    }),
    [router],
  );
}
