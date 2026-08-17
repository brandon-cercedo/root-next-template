import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FullUser } from "@/actions/db/user";
import LoginConfetti from "@/features/home/components/LoginConfetti";
import { UserProvider } from "@/hooks/use-user";
import {
  fakeUserComplete,
  fakeUserSettingComplete,
} from "@/prisma/utils/fake-data";

const { completeLoginConfetti, confettiProps } = vi.hoisted(() => ({
  completeLoginConfetti: vi.fn(),
  confettiProps: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  completeLoginConfetti: () => completeLoginConfetti(),
}));

vi.mock("@/components/ui/Confetti", () => ({
  default: (props: { fire: boolean; onFired?: () => void }) => {
    confettiProps(props);
    return null;
  },
}));

function createFullUser({
  seenAt,
  setting,
}: {
  seenAt?: string;
  setting?: FullUser["setting"];
} = {}): FullUser {
  const user = fakeUserComplete();
  if (setting !== undefined) {
    return {
      ...user,
      setting,
    };
  }

  return {
    ...user,
    setting: {
      ...fakeUserSettingComplete(),
      userId: user.id,
      preferences: seenAt ? { loginConfettiSeenAt: seenAt } : {},
    },
  };
}

function renderLoginConfetti(user: FullUser) {
  return render(
    <UserProvider user={user}>
      <LoginConfetti />
    </UserProvider>
  );
}

afterEach(() => {
  cleanup();
  completeLoginConfetti.mockReset();
  confettiProps.mockReset();
});

describe("LoginConfetti", () => {
  it("should fire when loginConfettiSeenAt is unset", () => {
    renderLoginConfetti(createFullUser());

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: true })
    );
  });

  it("should not fire when loginConfettiSeenAt is set", () => {
    renderLoginConfetti(
      createFullUser({
        seenAt: "2026-08-17T00:00:00.000Z",
      })
    );

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: false })
    );
  });

  it("should fire when the setting relation is missing", () => {
    renderLoginConfetti(createFullUser({ setting: null }));

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: true })
    );
  });

  it("should persist seen-at when the burst fires", () => {
    renderLoginConfetti(createFullUser());

    const props = confettiProps.mock.calls[0][0] as {
      onFired?: () => void;
    };
    props.onFired?.();

    expect(completeLoginConfetti).toHaveBeenCalledTimes(1);
  });
});
