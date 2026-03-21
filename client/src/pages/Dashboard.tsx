import { Button } from "../components/Button";
import { Layout } from "../components/Layout";
import { Row } from "../components/Row";
import axios from "axios";
import { useEffect, useState } from "react";

export function DashboardPage() {
  const [addresses, setAddresses] = useState<
    Array<{ id: number; name: string; description?: string; verified: boolean }>
  >([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/api/addresses", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAddresses(res.data?.items || []))
      .catch(() => setAddresses([]));
  }, []);

  function onSignout() {
    sessionStorage.clear();
    localStorage.clear();
    location.href = "/";
  }
  return (
    <Layout title="Dashboard page">
      <p>Welcome on your dashboard</p>
      {addresses.length > 0 && (
        <div>
          <h3>Your addresses</h3>
          <ul>
            {addresses.map((address) => (
              <li key={address.id}>
                {address.name}
                {address.verified ? " ✅ Verified" : " ⚠️ Not verified"}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Row>
        <Button onClick={onSignout}>Signout</Button>
      </Row>
    </Layout>
  );
}
