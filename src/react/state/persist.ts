import { persistDataPromise } from "@/persistData";
import { useMemo } from "react";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";

export const config$ = atom<Config>({
  key: "persist/config",
  default: persistDataPromise.then((d) => d.config)
});

export const recentOpenedRepositories$ = atom<string[]>({
  key: "persist/recentOpenedRepositories",
  default: persistDataPromise.then((d) => d.environment.recentOpened || [])
});

export const useConfigAction = () => {
  const setConfig = useSetRecoilState(config$);
  return useMemo(
    () => ({
      update: (newConfig: Config) => {
        setConfig(newConfig);
      }
    }),
    []
  );
};

export const useRecentOpenedRepositoriesAction = () => {
  const config = useRecoilValue(config$);
  const setRecentOpenedRepositories = useSetRecoilState(recentOpenedRepositories$);
  return useMemo(
    () => ({
      add: (path: string) => {
        setRecentOpenedRepositories((cur) => {
          const ret = [path, ...cur.filter((p) => p !== path)];
          if (config.recentListCount < ret.length) {
            ret.length = config.recentListCount;
          }
          return ret;
        });
      },
      remove: (path: string) => {
        setRecentOpenedRepositories((cur) => cur.filter((p) => p !== path));
      }
    }),
    [config.recentListCount]
  );
};
