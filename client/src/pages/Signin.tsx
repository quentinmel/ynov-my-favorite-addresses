import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { Input } from "../components/Input";
import { Layout } from "../components/Layout";
import axios from "axios";
import { toast } from "react-hot-toast";

export function SigninPage() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const json = { email: form.get("email"), password: form.get("password") };
    try {
      const { data } = await axios.post<{ token: string }>(
        "/api/users/tokens",
        json,
      );

      if (data?.token) {
        const meResult = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (meResult.data?.item?.id) {
          localStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(meResult.data.item)); // ✅ fix objet
          toast.success("You are connected");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // ✅ laisse le toast s'afficher
          location.href = "/";
        } else {
          toast.error("Unable to sign in");
        }
      } else {
        toast.error("Unable to sign in");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to sign in";
      toast.error(message);
    }
  }

  return (
    <Layout title="Sign in">
      <p>Access your dashboard and saved places.</p>
      <Form onSubmit={onSubmit}>
        <Input name="email" type="email" placeholder="Email address" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit">Sign in</Button>
      </Form>
    </Layout>
  );
}
