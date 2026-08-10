import prisma from "@/lib/prisma-client";

const DRY_RUN = true;

const USER_EMAIL = "marloncercedo@gmail.com";
const USER_IMAGE =
  "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png";

async function run() {
  console.log("RNT-13: update user.image");

  if (DRY_RUN) {
    console.log("🧪 mode: DEV");
  } else {
    console.log("🚀 mode: PROD");
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: USER_EMAIL },
  });
  console.log(
    ">>> user:",
    JSON.stringify(
      {
        id: user.id,
        email: user.email,
        image: user.image,
      },
      null,
      2
    )
  );

  if (DRY_RUN) {
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email: USER_EMAIL },
    data: { image: USER_IMAGE },
  });
  console.log(
    "<<< updated user:",
    JSON.stringify(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        image: updatedUser.image,
      },
      null,
      2
    )
  );
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
