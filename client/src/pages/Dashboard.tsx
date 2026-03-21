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

  async function onToggleVerified(id: number, next: boolean) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be signed in");
      return;
    }

    try {
      const { data } = await axios.patch(
        `/api/addresses/${id}/verify`,
        { verified: next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data?.item?.id) {
        setAddresses((prev) =>
          prev.map((address) =>
            address.id === id ? { ...address, verified: next } : address,
          ),
        );
        toast.success(next ? "Marked as verified" : "Marked as not verified");
      } else {
        toast.error("Unable to update verification");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update verification";
      toast.error(message);
    }
  }

  function onSignout() {
    sessionStorage.clear();
    localStorage.clear();
    location.href = "/";
  }
  return (
    <Layout title="Your dashboard">
      <p>Your saved places and verification status.</p>
      {userEmail && <p>Signed in as {userEmail}</p>}
      <div>
        <h3>Create a place</h3>
        <Form onSubmit={onCreateAddress}>
          <Input name="searchWord" placeholder="Search keyword (e.g. Paris)" />
          <Input name="name" placeholder="Place name" />
          <Input name="description" placeholder="Description (optional)" />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create address"}
          </Button>
        </Form>
      </div>
      <div>
        <h3>Your places</h3>
        {loading ? (
          <p>Loading your places...</p>
        ) : addresses.length === 0 ? (
          <p>No places yet. Create one above to see the badge.</p>
        ) : (
          <ul>
            {addresses.map((address) => (
              <li key={address.id}>
                {address.name}
                {address.verified ? " ✅ Verified" : " ⚠️ Not verified"}
                <label style={{ marginLeft: 8 }}>
                  <input
                    type="checkbox"
                    checked={address.verified}
                    onChange={(e) =>
                      onToggleVerified(address.id, e.target.checked)
                    }
                  />{" "}
                  Verified
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Row>
        <Button onClick={onSignout}>Sign out</Button>
      </Row>
    </Layout>
  );
}
