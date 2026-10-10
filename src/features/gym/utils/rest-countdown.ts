export interface RestCountdown {
  remaining: number;
  duration: number;
  deadline: number | null;
  started: boolean;
}

type RestAction = { type: 'start' | 'pause' | 'tick' | 'add'; now: number };

export function createRestCountdown(
  seconds: number,
  now: number,
  autoStart: boolean,
): RestCountdown {
  const duration = Math.max(1, Math.round(seconds));
  return {
    remaining: duration,
    duration,
    deadline: autoStart ? now + duration * 1000 : null,
    started: autoStart,
  };
}

export function restCountdownReducer(state: RestCountdown, action: RestAction): RestCountdown {
  const remaining =
    state.deadline === null
      ? state.remaining
      : Math.max(0, Math.ceil((state.deadline - action.now) / 1000));
  // Once finished, further actions cannot restart a timer tied to an exercise set.
  if (remaining === 0) return { ...state, remaining: 0, deadline: null };
  switch (action.type) {
    case 'start':
      return { ...state, started: true, deadline: state.deadline ?? action.now + remaining * 1000 };
    case 'pause':
      return { ...state, remaining, deadline: null };
    case 'add':
      return {
        ...state,
        remaining: remaining + 30,
        duration: state.duration + 30,
        deadline: state.deadline === null ? null : state.deadline + 30_000,
      };
    case 'tick':
      return remaining === state.remaining ? state : { ...state, remaining };
  }
}
