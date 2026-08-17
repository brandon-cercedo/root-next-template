import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FullUser } from "@/actions/db/user";
import FirstLoginConfetti from "@/features/home/components/FirstLoginConfetti";
import { UserProvider } from "@/hooks/use-user";
import {
  fakeUserComplete,
  fakeUserSettingComplete,
} from "@/prisma/utils/fake-data";

const { markLoginConfettiSeen, confettiProps } = vi.hoisted(() => ({
  markLoginConfettiSeen: vi.fn(),
  confettiProps: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  markLoginConfettiSeen: () => markLoginConfettiSeen(),
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

function renderFirstLogin(user: FullUser) {
  return render(
    <UserProvider user={user}>
      <FirstLoginConfetti />
    </UserProvider>
  );
}

afterEach(() => {
  cleanup();
  markLoginConfettiSeen.mockReset();
  confettiProps.mockReset();
});

describe("FirstLoginConfetti", () => {
  it("should fire when loginConfettiSeenAt is unset", () => {
    renderFirstLogin(createFullUser());

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: true })
    );
  });

  it("should not fire when loginConfettiSeenAt is set", () => {
    renderFirstLogin(
      createFullUser({
        seenAt: "2026-08-17T00:00:00.000Z",
      })
    );

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: false })
    );
  });

  it("should fire when the setting relation is missing", () => {
    renderFirstLogin(createFullUser({ setting: null }));

    expect(confettiProps).toHaveBeenCalledWith(
      expect.objectContaining({ fire: true })
    );
  });

  it("should persist seen-at when the burst fires", () => {
    renderFirstLogin(createFullUser());

    const props = confettiProps.mock.calls[0][0] as {
      onFired?: () => void;
    };
    props.onFired?.();

    expect(markLoginConfettiSeen).toHaveBeenCalledTimes(1);
  });
});
