import { isLoggedIn } from "../../../utils/auth";
import { PostEditForm } from "../../../components/PostEditForm";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  // Check if user is logged in, redirect to home if not
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirect("/");
  }

  // Use the same form component but with isCreate=true and no post data
  return <PostEditForm isCreate={true} />;
}