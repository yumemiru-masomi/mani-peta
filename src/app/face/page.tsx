import FaceMaskScreen from "@/screen/FaceMaskScreen";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  console.log(session?.user); // デバッグ用

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <>
      <FaceMaskScreen />
    </>
  );
}
