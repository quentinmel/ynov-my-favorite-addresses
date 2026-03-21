import styled from "styled-components";
import logo from "../assets/logo_mfp.png";

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 6px;
`;

const Logo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandTitle = styled.span`
  font-family: "Fraunces", serif;
  font-size: 18px;
  color: var(--text);
`;

const BrandTagline = styled.span`
  font-size: 12px;
  color: var(--muted);
`;

const Container = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 16px auto;
  border-radius: var(--radius);
  background-color: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
  border: 1px solid rgba(31, 42, 46, 0.08);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    inset: 0;
    border-top: 4px solid var(--accent);
    pointer-events: none;
  }

  & > h1 {
    margin: 0;
    padding: 8px 20px 8px;
    color: var(--text);
  }
`;

const Content = styled.main`
  padding: 8px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  justify-content: stretch;
`;

export function Layout(props: { title?: string; children: React.ReactNode }) {
  return (
    <Container>
      <Brand>
        <Logo src={logo} alt="MFP logo" />
        <BrandText>
          <BrandTitle>MFP</BrandTitle>
          <BrandTagline>My Favorite Places</BrandTagline>
        </BrandText>
      </Brand>
      {props.title && <h1>{props.title}</h1>}
      <Content>{props.children}</Content>
    </Container>
  );
}
