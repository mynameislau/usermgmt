/**
 * Proposition simplifiée d'une lib de gestion des queries
 * façon relay swr appolo etc.
 * J'ai laissé bcp de choses très basiques qui mériteraient d'être
 * plus travaillées vu qu'il ne s'agit que d'un exercice :)
 */

import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiGet } from "../../utils/api-utils";

/**
 * Ce context permet au composants enfants du provider de bénéficier des résultat des queries
 */
export type QueriesContextData = {
  cache: Readonly<Cache>;
  updateCache: (cache: Cache) => void;
  /**
   * invalidateQueries est l'api publique permettant de forcer un rechargement
   * des données mises en cache
   * @param regexp permet d'invalider les routes qui matchent la regex
   */
  invalidateQueries: (regexp: RegExp) => void;
};

export const QueriesContext = React.createContext<QueriesContextData>({
  cache: {},
  updateCache: () => {},
  invalidateQueries: (_) => {},
});

/**
 * stockage des infos de cache : une simple map clef / valeur
 * les clefs sont les différentes routes utilisées dans useQuery
 */
export type Cache = { [index: string]: any };

/**
 * le composant qui permet à tous ces enfants de bénéficier de useQuery etc.
 */
export const QueriesProvider: FunctionComponent<{}> = ({ children }) => {
  const [cacheState, updateCacheState] = useState<Cache>({});

  const invalidateQueries = useCallback(
    (regexp: RegExp) => {
      const keys = Object.keys(cacheState);
      const invalidatedKeys = keys.filter((key) => regexp.test(key));

      const merged = invalidatedKeys.reduce(
        (acc, key) => ({ ...acc, [key]: null }),
        { ...cacheState }
      );

      updateCacheState(merged);
    },
    [cacheState, updateCacheState]
  );

  return (
    <QueriesContext.Provider
      value={{
        cache: cacheState,
        updateCache: updateCacheState,
        invalidateQueries,
      }}
    >
      {children}
    </QueriesContext.Provider>
  );
};

/**
 * @param route la route de l'api. Si on voulait aller plus loin il faudrait decoupler l'appel
 * à apiGet
 *
 * Pour rester simple j'ai decidé de mettre les hooks dans le composant queries provider
 * mais on aurait pu mettre les hooks dans un autre fichier
 */
export const useQuery = <T extends {}>(route: string) => {
  // le cache provient du provider QueriesProvider
  const { cache, updateCache } = useContext(QueriesContext);
  const inCache = cache[route]; // la route est elle déjà en cache ?

  // state local. ces valeurs sont retournées à la fin du hook
  const [state, setState] = useState<{
    value: T | null;
    error: string | null;
    isPending: boolean;
  }>({
    value: cache[route] ?? null,
    error: null,
    isPending: true,
  });

  /**
   * ce useeffect permet de lancer la promesse qui fetch les
   * données mais qui toutefois s'arrete si jamais le composant est
   * unmounted
   */
  useEffect(() => {
    /**
     * si la requete est deja dans le cache, pas besoin de refetcher
     */
    if (inCache) {
      return;
    }
    //flag pour savoir si le composant est monté ou démonté
    let isSubscribed = true;
    // on réinitialise le isPending a true
    setState({ value: state.value, error: null, isPending: true });
    apiGet<T>(route)
      .then((value) => {
        // si le composant a été démonté, on ne fait rien
        if (!isSubscribed) {
          return;
        }
        // on met le cache a jour avec les données recuperees
        updateCache({ ...cache, [route]: value });
        // on set la value etc.
        setState({ value, error: null, isPending: false });
      })
      .catch((error) => {
        if (!isSubscribed) {
          return;
        }
        // si erreur on set l'erreur, on repasse la value a null.
        setState({ value: null, error: error, isPending: false });
      });

    return () => {
      isSubscribed = false;
    };
  }, [route, inCache, cache, updateCache, state.value]);

  const { value, error, isPending } = state;

  // typeof pour eviter de retaper les type :)
  type ReturnTuple = [typeof value, typeof error, typeof isPending];

  const toReturn: ReturnTuple = [value, error, isPending];

  return toReturn;
};

type Mutator<U> = () => Promise<U>;

/**
 * @param mutator la fonction qui permet de faire la modification serveur
 * @param onError callback en cas d'erreur
 * @param onSuccess idem succes
 */
export const useMutation = <ResponseData extends {}>({
  mutator,
  onError,
  onSuccess,
}: {
  mutator: Mutator<ResponseData>;
  onPending?: () => void;
  onError?: (error: string) => void;
  onSuccess?: (data: ResponseData) => void;
}) => {
  const [state, updateState] = useState<{ mutate: () => void }>({
    mutate: () => {},
  });

  /**
   * de meme que pour useQuery, permet d' "annuler"
   * les callback si le composant a été démonté
   */
  useEffect(() => {
    let isSubscribed = true;

    updateState({
      mutate: () => {
        return mutator()
          .then((data) => {
            if (!isSubscribed) {
              return;
            }

            onSuccess && onSuccess(data);
          })
          .catch((error) => {
            if (!isSubscribed) {
              return;
            }

            onError && onError(error);
          });
      },
    });

    return () => {
      isSubscribed = false;
    };
  }, [mutator, onError, onSuccess]);

  type ReturnTuple = [typeof state.mutate];

  const toReturn: ReturnTuple = [state.mutate];

  return toReturn;
};
