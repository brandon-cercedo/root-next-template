type PathFunction = (...args: never[]) => `/${string}`;

type PathsType = {
  [key: string]: PathFunction | PathsType;
};

export const paths = {
  home: () => "/",
  dashboard: {
    home: () => "/dashboard",
  },
} satisfies PathsType;
