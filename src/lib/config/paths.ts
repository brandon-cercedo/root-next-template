type PathFunction = (...args: never[]) => `/${string}`;

type PathsType = {
  [key: string]: PathFunction | PathsType;
};

export const paths = {
  home: () => "/",
  auth: {
    signIn: () => "/auth/signin",
    signOut: () => "/auth/signout",
    error: (error = "FailedToSignIn") => {
      const params = new URLSearchParams();
      if (error) {
        params.set("error", error);
      }
      const query = params.toString();
      return `/error${query ? `?${query}` : ""}`;
    },
  },
  dashboard: {
    home: () => "/dashboard",
  },
} satisfies PathsType;
