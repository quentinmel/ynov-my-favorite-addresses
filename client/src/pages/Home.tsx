import { ButtonLink } from "../components/ButtonLink";
import { Layout } from "../components/Layout";
import { Row } from "../components/Row";

export function HomePage() {
  return (
    <Layout title="Welcome">
      <p>Save and organize your favorite places.</p>
      <Row>
        <ButtonLink to="/signin">Sign in</ButtonLink>
        <ButtonLink to="/signup">Create account</ButtonLink>
      </Row>
    </Layout>
  );
}
