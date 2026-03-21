import { Button } from "../components/Button";
import { Form } from "../components/Form";
import { Input } from "../components/Input";
import { Layout } from "../components/Layout";
import { Row } from "../components/Row";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export function DashboardPage() {
  const [addresses, setAddresses] = useState<
    Array<{ id: number; name: string; description?: string; verified: boolean }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUserEmail(parsed?.email || null);
      } catch {
        setUserEmail(null);
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("/api/addresses", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAddresses(res.data?.items || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  async function onCreateAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be signed in");
      return;
    }

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      searchWord: form.get("searchWord"),
      name: form.get("name"),
      description: form.get("description"),
    };

    setCreating(true);
    try {
      const { data } = await axios.post("/api/addresses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.item?.id) {
        setAddresses((prev) => [data.item, ...prev]);
        formEl.reset();
        toast.success("Address created");
      } else {
        toast.error("Unable to create address");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create address";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  function onSignout() {
    sessionStorage.clear();
    localStorage.clear();
    location.href = "/";
  }
  return (
    <Layout title="Dashboard page">
      <p>Welcome on your dashboard</p>
      {userEmail && <p>Signed in as {userEmail}</p>}
      <div>
        <h3>Create an address</h3>
        <Form onSubmit={onCreateAddress}>
          <Input name="searchWord" placeholder="Search word (e.g. Paris)" />
          <Input name="name" placeholder="Address name" />
          <Input name="description" placeholder="Description (optional)" />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create address"}
          </Button>
        </Form>
      </div>
      <div>
        <h3>Your addresses</h3>
        {loading ? (
          <p>Loading your addresses...</p>
        ) : addresses.length === 0 ? (
          <p>No addresses yet. Create one via the API to see the badge here.</p>
        ) : (
          <ul>
            {addresses.map((address) => (
              <li key={address.id}>
                {address.name}
                {address.verified ? " ✅ Verified" : " ⚠️ Not verified"}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Row>
        <Button onClick={onSignout}>Signout</Button>
      </Row>
    </Layout>
  );
}
