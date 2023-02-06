//import { isFunction } from '@vue';
import {
  type CloneFn,
  cloneFnJSON,
  type UseManualRefHistoryOptions,
  type UseManualRefHistoryReturn,
  type UseRefHistoryRecord,
} from '@vueuse/core';
import { isFunction, timestamp } from '@vueuse/shared';
import type { Store, _StoreWithState } from 'pinia';
import { computed, markRaw, ref, watch, type Raw, type Ref } from 'vue';

const fnBypass = <F, T>(v: F) => v as unknown as T;
const fnSetSource = <F>(source: Ref<F>, value: F) => (source.value = value);
const fnPatchStore = <S extends Store, Raw extends S['$state']>(store: S, value: Raw) => store.$patch({ ...value });

type FnCloneOrBypass<F, T> = (v: F) => T;

function defaultDump<R, S>(clone?: boolean | CloneFn<R>) {
  return (clone ? (isFunction(clone) ? clone : cloneFnJSON) : fnBypass) as unknown as FnCloneOrBypass<R, S>;
}

function defaultParse<R, S>(clone?: boolean | CloneFn<R>) {
  return (clone ? (isFunction(clone) ? clone : cloneFnJSON) : fnBypass) as unknown as FnCloneOrBypass<S, R>;
}

export function useStoreManualHistory<S extends Store, Raw extends S['$state'], Serialized = Raw>(
  store: S,
  options: Omit<UseManualRefHistoryOptions<Raw, Serialized>, 'setSource'> & {
    patchStore?: (store: S, value: Raw) => void;
  } = {},
): Omit<UseManualRefHistoryReturn<Raw, Serialized>, 'source'> & { store: S } {
  const {
    clone = false,
    dump = defaultDump<Raw, Serialized>(clone),
    parse = defaultParse<Raw, Serialized>(clone),
    patchStore = fnPatchStore,
  } = options;

  function _createHistoryRecord(): UseRefHistoryRecord<Serialized> {
    return {
      snapshot: dump(store.$state as Raw),
      timestamp: timestamp(),
    };
  }

  const last: Ref<UseRefHistoryRecord<Serialized>> = ref(_createHistoryRecord()) as Ref<
    UseRefHistoryRecord<Serialized>
  >;

  const undoStack: Ref<UseRefHistoryRecord<Serialized>[]> = ref([]);
  const redoStack: Ref<UseRefHistoryRecord<Serialized>[]> = ref([]);

  const _setSource = (record: UseRefHistoryRecord<Serialized>) => {
    patchStore(store, parse(record.snapshot));
    last.value = record;
  };

  const commit = () => {
    undoStack.value.unshift(last.value);
    last.value = _createHistoryRecord();

    if (options.capacity && undoStack.value.length > options.capacity)
      undoStack.value.splice(options.capacity, Infinity);
    if (redoStack.value.length) redoStack.value.splice(0, redoStack.value.length);
  };

  const clear = () => {
    undoStack.value.splice(0, undoStack.value.length);
    redoStack.value.splice(0, redoStack.value.length);
  };

  const undo = () => {
    const state = undoStack.value.shift();

    if (state) {
      redoStack.value.unshift(last.value);
      _setSource(state);
    }
  };

  const redo = () => {
    const state = redoStack.value.shift();

    if (state) {
      undoStack.value.unshift(last.value);
      _setSource(state);
    }
  };

  const reset = () => {
    _setSource(last.value);
  };

  const history = computed(() => [last.value, ...undoStack.value]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  return {
    store,
    undoStack,
    redoStack,
    last,
    history,
    canUndo,
    canRedo,

    clear,
    commit,
    reset,
    undo,
    redo,
  };
}
