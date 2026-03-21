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
    Array<{
      id: number;
      name: string;
      description?: string;
      verified: boolean;
      lat?: number;
      lng?: number;
    }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);

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

  function exportCsv() {
    const header = ["name", "description", "lat", "lng", "verified"];
    const rows = addresses.map((addr) => [
      addr.name,
      addr.description || "",
      addr.lat ?? "",
      addr.lng ?? "",
      addr.verified ? "true" : "false",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const v = String(value);
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
              return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mfp_addresses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCsvTemplate() {
    const template =
      "searchWord,name,description\n" +
      "Paris,Maison du cafe,Bon espresso\n" +
      "Tour Eiffel,Point de vue,Belle vue\n";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mfp_template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function parseCsvLine(line: string) {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map((cell) => cell.trim());
  }

  async function onImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be signed in");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast.error("CSV must contain a header and at least one row");
        return;
      }

      const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const searchWordIdx = header.indexOf("searchword");
      const nameIdx = header.indexOf("name");
      const descriptionIdx = header.indexOf("description");

      if (searchWordIdx === -1 || nameIdx === -1) {
        toast.error("CSV header must include searchWord and name");
        return;
      }

      if (lines.length - 1 > 50) {
        toast.error("CSV import is limited to 50 rows");
        return;
      }

      let created = 0;
      for (let i = 1; i < lines.length; i += 1) {
        const cols = parseCsvLine(lines[i]);
        const payload = {
          searchWord: cols[searchWordIdx],
          name: cols[nameIdx],
          description: descriptionIdx >= 0 ? cols[descriptionIdx] : undefined,
        };
        if (!payload.searchWord || !payload.name) {
          toast.error(`Row ${i + 1} is missing searchWord or name`);
          return;
        }
        if (String(payload.searchWord).length < 3) {
          toast.error(`Row ${i + 1} searchWord is too short`);
          return;
        }
        if (String(payload.name).length < 2) {
          toast.error(`Row ${i + 1} name is too short`);
          return;
        }
        const { data } = await axios.post("/api/addresses", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.item?.id) {
          created += 1;
          setAddresses((prev) => [data.item, ...prev]);
        }
      }

      toast.success(`Imported ${created} address(es)`);
      e.target.value = "";
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to import CSV";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }

  function getGoogleMapsLink(address: { lat?: number; lng?: number; name: string }) {
    if (address.lat !== undefined && address.lng !== undefined) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${address.lat},${address.lng}`,
      )}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address.name,
    )}`;
  }

  function getGoogleMapsRouteLink() {
    if (addresses.length < 2) return null;
    const points = addresses.slice(0, 25).map((addr) => {
      if (addr.lat !== undefined && addr.lng !== undefined) {
        return `${addr.lat},${addr.lng}`;
      }
      return addr.name;
    });
    const origin = points[0];
    const destination = points[points.length - 1];
    const waypoints = points.slice(1, -1);
    const params = new URLSearchParams({
      api: "1",
      origin,
      destination,
    });
    if (waypoints.length > 0) {
      params.set("waypoints", waypoints.join("|"));
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
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
        <h3>Import / export</h3>
        <p>CSV import expects headers: searchWord,name,description</p>
        <Row>
          <Button type="button" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button type="button" onClick={downloadCsvTemplate}>
            Download template
          </Button>
          <label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onImportCsv}
              disabled={importing}
            />
          </label>
        </Row>
      </div>
      <div>
        <h3>Your places</h3>
        {loading ? (
          <p>Loading your places...</p>
        ) : addresses.length === 0 ? (
          <p>No places yet. Create one above to see the badge.</p>
        ) : (
          <>
            {getGoogleMapsRouteLink() && (
              <p>
                <a
                  href={getGoogleMapsRouteLink() as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open all in Google Maps
                </a>
              </p>
            )}
            <ul>
              {addresses.map((address) => (
                <li key={address.id}>
                  <div>
                    <strong>{address.name}</strong>
                    {address.description && <div>{address.description}</div>}
                    <a
                      href={getGoogleMapsLink(address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                  <div>
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
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Row>
        <Button onClick={onSignout}>Sign out</Button>
      </Row>
    </Layout>
  );
}
