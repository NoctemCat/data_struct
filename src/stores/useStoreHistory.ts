//import { isFunction } from '@vue';
import type { UseRefHistoryOptions, UseRefHistoryReturn } from '@vueuse/core';
import { pausableFilter, watchIgnorable, type Fn } from '@vueuse/shared';
import type { Store, _StoreWithState } from 'pinia';
import { useStoreManualHistory } from './useManualStoreHistory';

//const mapHistory = new Map<string, _StoreWithState<string, {}, {}, {}>['$state'][]>();
//const mapRedo = new Map<string, _StoreWithState<string, {}, {}, {}>['$state'][]>();

//let trackChanges = true;

//export const useStoreHistory = <S extends Store>(
//  store: S,
//  dump?: (state: S['$state']) => string,
//  parse?: (raw: string) => S['$state'],
//) => {
//  if (!mapHistory.has(store.$id)) {
//    mapHistory.set(store.$id, [JSON.parse(JSON.stringify(store.$state))]);
//    mapRedo.set(store.$id, []);

//    const historyWatch: S['$state'][] = mapHistory.get(store.$id)!;

//    watch(
//      store.$state,
//      (_) => {
//        if (trackChanges) {
//          const dumped = dump ? dump(store.$state) : JSON.stringify(store.$state);
//          const parsed = parse ? parse(dumped) : JSON.parse(dumped);
//          historyWatch.push(parsed);
//        }
//      },
//      { deep: true },
//    );
//  }

//  const history: S['$state'][] = mapHistory.get(store.$id)!;
//  const redoStack: S['$state'][] = mapRedo.get(store.$id)!;

//  const undo = () => {
//    trackChanges = false;
//    const last = history[history.length - 2];
//    if (!last) {
//      trackChanges = true;
//      return;
//    }
//    console.log(history);

//    store.$patch({ ...last });
//    setTimeout(() => {
//      trackChanges = true;
//    }, 0);

//    if (history.length > 1) {
//      redoStack.push(history.pop()!);
//    }
//  };

//  const redo = () => {
//    trackChanges = false;
//    const last = redoStack.pop();
//    if (!last) {
//      trackChanges = true;
//      return;
//    }

//    store.$patch({ ...last });
//    setTimeout(() => {
//      trackChanges = true;
//    }, 0);

//    history.push(last);
//  };

//  return { undo, redo };
//};

export function useStoreHistory<S extends Store, Raw extends S['$state'], Serialized = Raw>(
  store: S,
  options: UseRefHistoryOptions<Raw, Serialized> = {},
): Omit<UseRefHistoryReturn<Raw, Serialized>, 'source'> & { store: S } {
  const { deep = false, flush = 'pre', eventFilter } = options;

  const {
    eventFilter: composedFilter,
    pause,
    resume: resumeTracking,
    isActive: isTracking,
  } = pausableFilter(eventFilter);

  const { ignoreUpdates, ignorePrevAsyncUpdates, stop } = watchIgnorable(store.$state, commit, {
    deep,
    flush,
    eventFilter: composedFilter,
  });

  function patchStore(store: S, value: Raw) {
    // Support changes that are done after the last history operation
    // examples:
    //   undo, modify
    //   undo, undo, modify
    // If there were already changes in the state, they will be ignored
    // examples:
    //   modify, undo
    //   undo, modify, undo
    ignorePrevAsyncUpdates();

    ignoreUpdates(() => {
      store.$patch({ ...value });
    });
  }

  const manualHistory = useStoreManualHistory(store, { ...options, clone: options.clone || deep, patchStore });

  const { clear, commit: manualCommit } = manualHistory;

  function commit() {
    // This guard only applies for flush 'pre' and 'post'
    // If the user triggers a commit manually, then reset the watcher
    // so we do not trigger an extra commit in the async watcher
    ignorePrevAsyncUpdates();

    manualCommit();
  }

  function resume(commitNow?: boolean) {
    resumeTracking();
    if (commitNow) commit();
  }

  function batch(fn: (cancel: Fn) => void) {
    let canceled = false;

    const cancel = () => (canceled = true);

    ignoreUpdates(() => {
      fn(cancel);
    });

    if (!canceled) commit();
  }

  function dispose() {
    stop();
    clear();
  }
  return {
    ...manualHistory,
    isTracking,
    pause,
    resume,
    commit,
    batch,
    dispose,
  };
}
