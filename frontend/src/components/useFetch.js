import { useCallback, useEffect, useState } from 'react';

export default function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn().then((data) => setState({ data, error: '', loading: false }))
      .catch((e) => setState({ data: null, error: e.message, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { ...state, retry: run };
}
