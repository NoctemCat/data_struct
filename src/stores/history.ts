import { once } from '@/utility/functions';
//import { useRefHistory } from "@vueuse/core";
import { getActivePinia, type StateTree } from 'pinia';
import { watch, type Ref } from 'vue';

//let init = false;
export const usePiniaHistory = () => {
  const pinia = getActivePinia();
  if (!pinia) throw new Error('To use pinia history store must exist');

  //if (!init) {
  //  init = true;

  //  watch(
  //    pinia.state,
  //    (state: Ref<Record<string, StateTree>>) => {
  //      console.log(state);
  //    },
  //    { deep: true },
  //  );
  //}

  //const { history, commit, undo, redo } = useRefHistory(pinia.state, {
  //  deep: true,
  //  capacity: 100,
  //  //dump: dumpHistory,
  //  //parse: parseHistory,
  //});

  return {};
};
